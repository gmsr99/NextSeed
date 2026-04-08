import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useChildren } from "@/hooks/useChildren";
import { supabase } from "@/lib/supabase";
import type { Activity, NexseedCurriculum, CurriculumCoverage } from "@/lib/types";
import type { Project } from "@/hooks/useProjects";

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface CoverageLink {
  curriculum_id: string;
  confidence: number;
  source: "ai" | "manual";
  objective: string;
  discipline_name: string;
  area: string | null;
}

export interface PortfolioActivity extends Activity {
  kind: "activity";
  date: string;          // activity_date
  coverage: CoverageLink[];
}

export interface PortfolioProject extends Project {
  kind: "project";
  date: string;          // created_at (date part)
  coverage: CoverageLink[];
}

export type PortfolioEntry = PortfolioActivity | PortfolioProject;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePortfolio() {
  const { family } = useAuth();
  const { children } = useChildren();
  const qc = useQueryClient();

  // Atividades
  const { data: activities = [], isLoading: loadingActivities } = useQuery({
    queryKey: ["activities", family?.id],
    enabled: !!family,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("family_id", family!.id)
        .order("activity_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Activity[];
    },
  });

  // Projetos
  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ["projects", family?.id],
    enabled: !!family,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("family_id", family!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Project[];
    },
  });

  // Cobertura curricular com objetivos inline
  const { data: coverageRaw = [], isLoading: loadingCoverage } = useQuery({
    queryKey: ["curriculum_coverage", family?.id],
    enabled: !!family,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("curriculum_coverage")
        .select("*, nexseed_curriculum(objective, discipline_name, area)")
        .eq("family_id", family!.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  // Mapa: id → CoverageLink[]
  const coverageByActivity = new Map<string, CoverageLink[]>();
  const coverageByProject  = new Map<string, CoverageLink[]>();

  for (const row of coverageRaw as (CurriculumCoverage & {
    nexseed_curriculum: Pick<NexseedCurriculum, "objective" | "discipline_name" | "area"> | null
  })[]) {
    const link: CoverageLink = {
      curriculum_id:  row.curriculum_id,
      confidence:     row.confidence ?? 0,
      source:         row.source,
      objective:      row.nexseed_curriculum?.objective ?? "",
      discipline_name: row.nexseed_curriculum?.discipline_name ?? "",
      area:           row.nexseed_curriculum?.area ?? null,
    };
    if (row.activity_id) {
      const arr = coverageByActivity.get(row.activity_id) ?? [];
      arr.push(link);
      coverageByActivity.set(row.activity_id, arr);
    }
    if (row.project_id) {
      const arr = coverageByProject.get(row.project_id) ?? [];
      arr.push(link);
      coverageByProject.set(row.project_id, arr);
    }
  }

  // Timeline unificada, ordenada por data desc
  const entries: PortfolioEntry[] = [
    ...activities.map((a): PortfolioActivity => ({
      ...a,
      kind: "activity",
      date: a.activity_date,
      photos: a.photos ?? [],
      coverage: coverageByActivity.get(a.id) ?? [],
    })),
    ...projects.map((p): PortfolioProject => ({
      ...p,
      kind: "project",
      date: p.created_at.slice(0, 10),
      coverage: coverageByProject.get(p.id) ?? [],
    })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  // ─── Mutação: analisar com IA ──────────────────────────────────────────────

  const analyze = useMutation({
    mutationFn: async (selected: PortfolioEntry[]) => {
      if (!family) throw new Error("Sem família");

      // Resolver school_year para cada item
      const childMap = new Map(children.map((c) => [c.id, c.school_year]));

      const items = selected.map((entry) => ({
        id:          entry.id,
        type:        entry.kind,
        title:       entry.title,
        description: entry.kind === "activity" ? entry.description : entry.description,
        discipline:  entry.kind === "activity" ? entry.discipline  : null,
        child_id:    entry.child_id,
        school_year: (entry.child_id ? childMap.get(entry.child_id) : null) ?? "",
      })).filter((i) => i.school_year);  // apenas itens com criança atribuída

      if (!items.length) throw new Error("Nenhum item tem criança atribuída (necessário para o ano escolar).");

      const { data, error } = await supabase.functions.invoke("analyze-curriculum-coverage", {
        body: { items, family_id: family.id },
      });
      if (error) throw error;
      return data as { matched: number };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["curriculum_coverage", family?.id] });
    },
  });

  // ─── Mutação: apagar atividade ─────────────────────────────────────────────

  const deleteActivity = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("activities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activities", family?.id] });
      qc.invalidateQueries({ queryKey: ["curriculum_coverage", family?.id] });
    },
  });

  // Contagem de cobertura por curriculum_id — para mostrar no tab de currículo
  const coverageCountByCurriculum = new Map<string, number>();
  for (const row of coverageRaw as { curriculum_id: string }[]) {
    coverageCountByCurriculum.set(
      row.curriculum_id,
      (coverageCountByCurriculum.get(row.curriculum_id) ?? 0) + 1
    );
  }

  const isLoading = loadingActivities || loadingProjects || loadingCoverage;

  return { entries, isLoading, analyze, deleteActivity, coverageCountByCurriculum };
}
