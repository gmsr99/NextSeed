// DASH fase 3 (migração 037): quantas revisões seguidas cada tema já teve.
// Sem a coluna review_count (migração por aplicar), devolve available=false e
// a app comporta-se como antes: as revisões voltam sem limite de vezes.
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface ReviewCounts {
  available: boolean;
  /** childId → contentId → { status, count } */
  byChild: Record<string, Record<string, { status: string; count: number }>>;
}

export async function fetchReviewCounts(childIds: string[]): Promise<ReviewCounts> {
  if (childIds.length === 0) return { available: false, byChild: {} };
  const { data, error } = await supabase
    .from("child_content_progress")
    .select("child_id, content_id, status, review_count")
    .in("child_id", childIds)
    .gt("review_count", 0);
  if (error) return { available: false, byChild: {} };
  const byChild: ReviewCounts["byChild"] = {};
  for (const r of (data ?? []) as { child_id: string; content_id: string; status: string; review_count: number }[]) {
    (byChild[r.child_id] ??= {})[r.content_id] = { status: r.status, count: r.review_count };
  }
  return { available: true, byChild };
}

export function useReviewCounts(childIds: string[]) {
  const ids = [...childIds].sort();
  return useQuery({
    queryKey: ["review-counts", ids],
    enabled: ids.length > 0,
    queryFn: () => fetchReviewCounts(ids),
  });
}
