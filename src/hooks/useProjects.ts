import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface Phase {
  id: string;
  title: string;
  completed: boolean;
  completed_at?: string | null;
}

export interface Project {
  id: string;
  family_id: string;
  child_id: string | null;
  title: string;
  description: string | null;
  status: "active" | "completed" | "paused";
  start_date: string | null;
  end_date: string | null;
  phases: Phase[];
  created_at: string;
  updated_at: string;
}

export interface CreateProjectInput {
  child_id: string;
  title: string;
  description?: string;
  phases: { title: string }[];
  start_date?: string;
}

export function useProjects() {
  const { family } = useAuth();
  const qc = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
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

  const createProject = useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      if (!family) throw new Error("Sem família");
      const phases: Phase[] = input.phases.map((p, i) => ({
        id: String(i + 1),
        title: p.title,
        completed: false,
        completed_at: null,
      }));
      const { error } = await supabase.from("projects").insert({
        family_id: family.id,
        child_id: input.child_id,
        title: input.title,
        description: input.description || null,
        phases,
        status: "active",
        start_date: input.start_date ?? new Date().toISOString().slice(0, 10),
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects", family?.id] }),
  });

  const completePhase = useMutation({
    mutationFn: async ({ project, phaseId }: { project: Project; phaseId: string }) => {
      const phases = project.phases.map((p) =>
        p.id === phaseId
          ? { ...p, completed: !p.completed, completed_at: !p.completed ? new Date().toISOString() : null }
          : p
      );
      const { error } = await supabase
        .from("projects")
        .update({ phases, updated_at: new Date().toISOString() })
        .eq("id", project.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects", family?.id] }),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Project["status"] }) => {
      const update: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
      if (status === "completed") update.end_date = new Date().toISOString().slice(0, 10);
      const { error } = await supabase.from("projects").update(update).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects", family?.id] }),
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects", family?.id] }),
  });

  return { projects, isLoading, createProject, completePhase, updateStatus, deleteProject };
}
