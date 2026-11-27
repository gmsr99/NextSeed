// Agenda da comunidade (I-03a, 1B). Tabelas da migração 041.
// Enquanto a 041 não estiver aplicada, as consultas falham e os ecrãs mostram
// "A agenda da comunidade ainda não está disponível" em vez de partir.
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { cleanPrefs, type Preferences, type CommunityEventLike, type EventKind } from "@/lib/agenda";
import type { Tables } from "@/lib/types";

type Row = Tables<"community_events">;

export interface CommunityEvent extends CommunityEventLike {
  kind: EventKind;
  recurrence: "none" | "weekly";
  title: string;
  description: string;
  organizer_name: string;
  venue: string | null;
  all_day: boolean;
  price_text: string | null;
  url: string | null;
  public_contact: string | null;
  source_url: string | null;
  status: "pendente" | "publicado" | "recusado" | "cancelado";
  rejection_reason: string | null;
  submitted_by: string | null;
  created_at: string;
  updated_at: string;
}

export type CommunityEventInput = Omit<
  CommunityEvent,
  "id" | "status" | "rejection_reason" | "submitted_by" | "created_at" | "updated_at"
>;

const PUBLIC_FIELDS =
  "id, kind, title, description, organizer_name, municipality_code, venue, starts_at, ends_at, all_day, recurrence, recurrence_until, age_min, age_max, categories, is_free, price_text, url, public_contact, source_url, status, rejection_reason, submitted_by, created_at, updated_at";

const toEvent = (r: Partial<Row>) => r as unknown as CommunityEvent;

/** Publicados (e cancelados) que ainda não acabaram. */
export function usePublishedEvents() {
  const today = new Date().toISOString().slice(0, 10);
  return useQuery({
    queryKey: ["community_events", "published", today],
    staleTime: 60_000,
    retry: false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_events")
        .select(PUBLIC_FIELDS)
        .eq("status", "publicado")
        .or(`ends_at.gte.${today},recurrence_until.gte.${today}`)
        .order("starts_at", { ascending: true })
        .limit(500);
      if (error) throw error;
      return (data ?? []).map(toEvent);
    },
  });
}

/** As propostas do próprio utilizador, mais recentes primeiro. */
export function useMyProposals() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["community_events", "mine", user?.id],
    enabled: !!user,
    retry: false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_events")
        .select(PUBLIC_FIELDS)
        .eq("submitted_by", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(toEvent);
    },
  });
}

/** Um evento (para editar a proposta). */
export function useCommunityEvent(id: string | null) {
  return useQuery({
    queryKey: ["community_events", "one", id],
    enabled: !!id,
    retry: false,
    queryFn: async () => {
      const { data, error } = await supabase.from("community_events").select(PUBLIC_FIELDS).eq("id", id!).maybeSingle();
      if (error) throw error;
      return data ? toEvent(data) : null;
    },
  });
}

/** Triagem: pendentes, do mais antigo para o mais recente (a RLS só os mostra à equipa). */
export function usePendingEvents(enabled: boolean) {
  return useQuery({
    queryKey: ["community_events", "pending"],
    enabled,
    retry: false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_events")
        .select(PUBLIC_FIELDS)
        .eq("status", "pendente")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(toEvent);
    },
  });
}

/** Estado dos eventos ligados à agenda da família (para mostrar "cancelado"). */
export function useLinkedEventStatus(ids: string[]) {
  const key = [...new Set(ids)].sort();
  return useQuery({
    queryKey: ["community_events", "linked", key],
    enabled: key.length > 0,
    staleTime: 60_000,
    retry: false,
    queryFn: async () => {
      const { data, error } = await supabase.from("community_events").select("id, kind, status").in("id", key);
      if (error) throw error;
      return Object.fromEntries((data ?? []).map((r) => [r.id, { kind: r.kind as EventKind, status: r.status }]));
    },
  });
}

export function useCommunityEventMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["community_events"] });

  const propose = useMutation({
    mutationFn: async (input: CommunityEventInput) => {
      const { error } = await supabase.from("community_events").insert({ ...input, declaration_accepted: true });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  /** Editar a própria proposta: o servidor volta a pô-la em triagem. */
  const update = useMutation({
    mutationFn: async ({ id, ...patch }: Partial<CommunityEventInput> & { id: string }) => {
      const { error } = await supabase.from("community_events").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const cancel = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("community_events").update({ status: "cancelado" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("community_events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  /** Equipa: publicar ou recusar. */
  const review = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: "publicado" | "recusado"; reason?: string }) => {
      const { data, error } = await supabase
        .from("community_events")
        .update({ status, rejection_reason: status === "recusado" ? reason ?? "outro" : null })
        .eq("id", id)
        .select("status")
        .maybeSingle();
      if (error) throw error;
      if (data?.status !== status) throw new Error("Sem permissão para rever este evento.");
    },
    onSuccess: invalidate,
  });

  return { propose, update, cancel, remove, review };
}

// ─── Definições da família: concelho guardado e "O que preferimos" ──────────────

export interface EventSettings {
  municipality_code: string | null;
  preferences: Preferences;
  /** A família já escolheu as preferências (senão, usam-se as sugeridas pelos interesses). */
  prefsChosen: boolean;
}

export function useEventSettings() {
  const { family } = useAuth();
  const qc = useQueryClient();
  const key = ["family_event_settings", family?.id];

  const query = useQuery({
    queryKey: key,
    enabled: !!family?.id,
    retry: false,
    queryFn: async (): Promise<EventSettings> => {
      const { data, error } = await supabase
        .from("family_event_settings")
        .select("municipality_code, preferences")
        .eq("family_id", family!.id)
        .maybeSingle();
      if (error) throw error;
      return {
        municipality_code: data?.municipality_code ?? null,
        preferences: cleanPrefs(data?.preferences),
        prefsChosen: !!data?.preferences && typeof data.preferences === "object" && "_v" in (data.preferences as object),
      };
    },
  });

  const save = useMutation({
    mutationFn: async (patch: { municipality_code?: string | null; preferences?: Preferences }) => {
      // "_v" marca que a família escolheu as preferências (cleanPrefs ignora-o).
      const row = {
        family_id: family!.id,
        ...(patch.municipality_code !== undefined ? { municipality_code: patch.municipality_code } : {}),
        ...(patch.preferences ? { preferences: { ...patch.preferences, _v: 1 } } : {}),
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("family_event_settings").upsert(row, { onConflict: "family_id" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { settings: query.data, isLoading: query.isLoading, isError: query.isError, save };
}

// ─── "Juntar à nossa agenda" ─────────────────────────────────────────────────────

/** IDs dos eventos da comunidade já juntados à agenda da família. */
export function useJoinedEventIds() {
  const { family } = useAuth();
  return useQuery({
    queryKey: ["calendar_events", family?.id, "joined"],
    enabled: !!family?.id,
    retry: false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calendar_events" as never)
        .select("community_event_id")
        .not("community_event_id", "is", null);
      if (error) throw error;
      return new Set(((data ?? []) as { community_event_id: string }[]).map((r) => r.community_event_id));
    },
  });
}

export function useJoinEvent() {
  const { family } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { eventId: string; title: string; date: string; start_time: string | null; end_time: string | null; notes: string }) => {
      const { error } = await supabase.from("calendar_events" as never).insert({
        family_id: family!.id,
        title: input.title.slice(0, 200),
        date: input.date,
        start_time: input.start_time,
        end_time: input.end_time,
        notes: input.notes,
        type: "saida",
        community_event_id: input.eventId,
      } as never);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendar_events"] }),
  });
}
