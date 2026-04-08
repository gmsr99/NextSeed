import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type {
  Methodology,
  FamilyMethodology,
  MethodologyCompatibility,
} from "@/lib/types";

// ─── Fetch all methodologies (public, shared across all families) ─────────────

export function useAllMethodologies() {
  return useQuery({
    queryKey: ["methodologies"],
    staleTime: 10 * 60 * 1000, // 10 min — content rarely changes
    queryFn: async () => {
      const { data, error } = await supabase
        .from("methodologies")
        .select("*, methodology_principles(*)")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as Methodology[];
    },
  });
}

// ─── Fetch compatibility pairs (public, used client-side for matching) ────────

export function useMethodologyCompatibility() {
  return useQuery({
    queryKey: ["methodology_compatibility"],
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("methodology_compatibility")
        .select("*");
      if (error) throw error;
      return (data ?? []) as MethodologyCompatibility[];
    },
  });
}

// ─── Fetch this family's selected methodologies ───────────────────────────────

export function useFamilyMethodologies() {
  const { family } = useAuth();

  return useQuery({
    queryKey: ["family_methodologies", family?.id],
    enabled: !!family,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("family_methodologies")
        .select("*, methodology:methodologies(*, methodology_principles(*))")
        .order("priority");
      if (error) throw error;
      return (data ?? []) as FamilyMethodology[];
    },
  });
}

// ─── Combined hook — used by the page ────────────────────────────────────────

export function useMethodologies() {
  const queryClient = useQueryClient();
  const { family } = useAuth();

  const {
    data: allMethodologies = [],
    isLoading: loadingAll,
  } = useAllMethodologies();

  const {
    data: familyMethodologies = [],
    isLoading: loadingFamily,
  } = useFamilyMethodologies();

  const {
    data: compatibility = [],
  } = useMethodologyCompatibility();

  // ─ Select ──────────────────────────────────────────────────────────────────
  const select = useMutation({
    mutationFn: async (methodologyId: string) => {
      const nextPriority = (familyMethodologies.length + 1) as 1 | 2 | 3;
      const { error } = await supabase
        .from("family_methodologies")
        .insert({
          methodology_id: methodologyId,
          priority: nextPriority > 3 ? 3 : nextPriority,
        });
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["family_methodologies", family?.id],
      }),
  });

  // ─ Deselect ────────────────────────────────────────────────────────────────
  const deselect = useMutation({
    mutationFn: async (familyMethodologyId: string) => {
      const { error } = await supabase
        .from("family_methodologies")
        .delete()
        .eq("id", familyMethodologyId);
      if (error) throw error;
    },
    onSuccess: async () => {
      // Re-fetch first, then renumber priorities to keep them contiguous
      await queryClient.invalidateQueries({
        queryKey: ["family_methodologies", family?.id],
      });
    },
  });

  // ─ Move up (swap priorities with item above) ───────────────────────────────
  const moveUp = useMutation({
    mutationFn: async (familyMethodologyId: string) => {
      const idx = familyMethodologies.findIndex(
        (fm) => fm.id === familyMethodologyId
      );
      if (idx <= 0) return;
      const current = familyMethodologies[idx];
      const above = familyMethodologies[idx - 1];
      // Swap priorities
      const { error: e1 } = await supabase
        .from("family_methodologies")
        .update({ priority: above.priority })
        .eq("id", current.id);
      const { error: e2 } = await supabase
        .from("family_methodologies")
        .update({ priority: current.priority })
        .eq("id", above.id);
      if (e1 || e2) throw e1 ?? e2;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["family_methodologies", family?.id],
      }),
  });

  // ─ Move down (swap priorities with item below) ────────────────────────────
  const moveDown = useMutation({
    mutationFn: async (familyMethodologyId: string) => {
      const idx = familyMethodologies.findIndex(
        (fm) => fm.id === familyMethodologyId
      );
      if (idx < 0 || idx >= familyMethodologies.length - 1) return;
      const current = familyMethodologies[idx];
      const below = familyMethodologies[idx + 1];
      const { error: e1 } = await supabase
        .from("family_methodologies")
        .update({ priority: below.priority })
        .eq("id", current.id);
      const { error: e2 } = await supabase
        .from("family_methodologies")
        .update({ priority: current.priority })
        .eq("id", below.id);
      if (e1 || e2) throw e1 ?? e2;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["family_methodologies", family?.id],
      }),
  });

  // ─ Helpers ─────────────────────────────────────────────────────────────────

  /** Returns the family_methodology record for a given methodology id, or undefined */
  function getFamilyMethodology(methodologyId: string) {
    return familyMethodologies.find(
      (fm) => fm.methodology_id === methodologyId
    );
  }

  /** Returns compatibility info between two methodology ids (order-independent) */
  function getCompatibility(idA: string, idB: string) {
    return compatibility.find(
      (c) =>
        (c.methodology_a_id === idA && c.methodology_b_id === idB) ||
        (c.methodology_a_id === idB && c.methodology_b_id === idA)
    );
  }

  return {
    allMethodologies,
    familyMethodologies,
    compatibility,
    isLoading: loadingAll || loadingFamily,
    select,
    deselect,
    moveUp,
    moveDown,
    getFamilyMethodology,
    getCompatibility,
  };
}
