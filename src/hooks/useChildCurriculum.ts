import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { YEAR_MAP } from "@/lib/gcConstants";
import type { CurriculumContent, ContentProgress, ContentProgressStatus } from "@/lib/types";

export type ContentWithProgress = CurriculumContent & {
  progress: ContentProgress | null;
};

export type DomainGroup = {
  domain: string;
  period: string;
  contents: ContentWithProgress[];
};

export type DisciplineGroup = {
  discipline: string;
  domains: DomainGroup[];
  total: number;
  mastered: number; // rating dominado (3)
  started: number;  // em_progresso ou dominado
};

export function useChildCurriculum(childId: string | null, schoolYear: string | null) {
  const queryClient = useQueryClient();
  const dbYear = schoolYear ? (YEAR_MAP[schoolYear] ?? null) : null;

  const { data: contents = [], isLoading: contentsLoading } = useQuery({
    queryKey: ["curriculum_contents", dbYear],
    enabled: !!dbYear,
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("curriculum_contents")
        .select("*")
        .eq("school_year", dbYear!)
        .order("discipline")
        .order("sort_order");
      if (error) throw error;
      return data as CurriculumContent[];
    },
  });

  const { data: progressList = [], isLoading: progressLoading } = useQuery({
    queryKey: ["child_content_progress", childId],
    enabled: !!childId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("child_content_progress")
        .select("*")
        .eq("child_id", childId!);
      if (error) throw error;
      return data as ContentProgress[];
    },
  });

  // Join and group by discipline → domain
  const progressMap = new Map(progressList.map((p) => [p.content_id, p]));

  const disciplineMap = new Map<string, Map<string, ContentWithProgress[]>>();
  for (const c of contents) {
    if (!disciplineMap.has(c.discipline)) disciplineMap.set(c.discipline, new Map());
    const domainKey = `${c.period}||${c.domain}`;
    const dm = disciplineMap.get(c.discipline)!;
    if (!dm.has(domainKey)) dm.set(domainKey, []);
    dm.get(domainKey)!.push({ ...c, progress: progressMap.get(c.id) ?? null });
  }

  const grouped: DisciplineGroup[] = [];
  for (const [disc, domainMap] of disciplineMap) {
    const domains: DomainGroup[] = [];
    for (const [key, items] of domainMap) {
      const sepIdx = key.indexOf("||");
      const period = key.slice(0, sepIdx);
      const domain = key.slice(sepIdx + 2);
      domains.push({ domain, period, contents: items });
    }
    const total = domains.reduce((s, d) => s + d.contents.length, 0);
    const mastered = domains.reduce(
      (s, d) => s + d.contents.filter((c) => c.progress?.status === "dominado").length,
      0
    );
    const started = domains.reduce(
      (s, d) => s + d.contents.filter((c) => c.progress && c.progress.status !== "a_aprender").length,
      0
    );
    grouped.push({ discipline: disc, domains, total, mastered, started });
  }

  const upsertProgress = useMutation({
    mutationFn: async ({
      contentId,
      status,
    }: {
      contentId: string;
      status: ContentProgressStatus;
    }) => {
      const { error } = await supabase
        .from("child_content_progress")
        .upsert(
          {
            child_id: childId!,
            content_id: contentId,
            status,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "child_id,content_id" }
        );
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["child_content_progress", childId] }),
  });

  return {
    grouped,
    isLoading: contentsLoading || progressLoading,
    upsertProgress,
    hasData: !!dbYear,
    dbYear,
  };
}
