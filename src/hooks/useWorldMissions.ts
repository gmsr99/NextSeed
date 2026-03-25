import { useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { missions, type Mission, type MissionBenefit } from "@/lib/worldMissionsContent";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface MissionPoints {
  responsibility: number;
  autonomy: number;
  cooperation: number;
  care: number;
  resilience: number;
}

interface CompletionRow {
  id: string;
  child_id: string;
  template_mission_id: string | null;
  reflection: string | null;
  learned: string | null;
  points_earned: number;
  completed_at: string;
}

// ── Levels ────────────────────────────────────────────────────────────────────

export const LEVELS = [
  {
    id: "explorer",
    name: "Explorador do Espaço",
    minPoints: 0,
    icon: "🌱",
    description: "A descobrir o mundo ao teu redor",
    color: "from-emerald-100 to-teal-100",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
  },
  {
    id: "guardian",
    name: "Guardião da Casa",
    minPoints: 60,
    icon: "🏡",
    description: "O teu espaço é o teu reflexo",
    color: "from-amber-100 to-yellow-100",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
  },
  {
    id: "caretaker",
    name: "Cuidador da Família",
    minPoints: 150,
    icon: "🤝",
    description: "O teu cuidado transforma quem te rodeia",
    color: "from-sky-100 to-blue-100",
    textColor: "text-sky-700",
    borderColor: "border-sky-200",
  },
  {
    id: "builder",
    name: "Construtor do Mundo",
    minPoints: 300,
    icon: "🌍",
    description: "Cada ação tua muda o mundo um pouco mais",
    color: "from-violet-100 to-purple-100",
    textColor: "text-violet-700",
    borderColor: "border-violet-200",
  },
];

// ── Points logic ──────────────────────────────────────────────────────────────

const BENEFIT_POINTS: Record<MissionBenefit, Partial<MissionPoints>> = {
  responsabilidade: { responsibility: 10 },
  autonomia:        { autonomy: 10 },
  cooperação:       { cooperation: 10 },
  cuidado:          { care: 10 },
  resiliência:      { resilience: 10 },
  organização:      { responsibility: 5, autonomy: 5 },
  liderança:        { cooperation: 8, autonomy: 8 },
  criatividade:     { autonomy: 6, resilience: 6 },
};

export function calcMissionPoints(mission: Mission): MissionPoints {
  const pts: MissionPoints = { responsibility: 0, autonomy: 0, cooperation: 0, care: 0, resilience: 0 };
  if (mission.mode === "equipa")      pts.cooperation += 5;
  if (mission.mode === "individual")  pts.autonomy    += 5;
  for (const b of mission.benefits) {
    const bp = BENEFIT_POINTS[b];
    if (bp.responsibility) pts.responsibility += bp.responsibility;
    if (bp.autonomy)       pts.autonomy       += bp.autonomy;
    if (bp.cooperation)    pts.cooperation    += bp.cooperation;
    if (bp.care)           pts.care           += bp.care;
    if (bp.resilience)     pts.resilience     += bp.resilience;
  }
  return pts;
}

export function sumPoints(pts: MissionPoints): number {
  return pts.responsibility + pts.autonomy + pts.cooperation + pts.care + pts.resilience;
}

function calcTotalPoints(rows: CompletionRow[]): MissionPoints {
  const acc: MissionPoints = { responsibility: 0, autonomy: 0, cooperation: 0, care: 0, resilience: 0 };
  for (const row of rows) {
    const mission = missions.find((m) => m.id === row.template_mission_id);
    if (!mission) continue;
    const pts = calcMissionPoints(mission);
    acc.responsibility += pts.responsibility;
    acc.autonomy       += pts.autonomy;
    acc.cooperation    += pts.cooperation;
    acc.care           += pts.care;
    acc.resilience     += pts.resilience;
  }
  return acc;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useWorldMissions(selectedChildId?: string) {
  const { family } = useAuth();
  const qc = useQueryClient();

  // Load all completions for this family (RLS filters by child_id → family)
  const { data: allCompletions = [] } = useQuery<CompletionRow[]>({
    queryKey: ["mission-completions", family?.id],
    enabled: !!family,
    queryFn: async () => {
      const { data } = await supabase
        .from("mission_completions")
        .select("id, child_id, template_mission_id, reflection, learned, points_earned, completed_at")
        .order("completed_at", { ascending: false });
      return (data ?? []) as CompletionRow[];
    },
  });

  // Filtra por criança selecionada — se nenhuma, usa todas
  const completions = useMemo(
    () => selectedChildId ? allCompletions.filter((c) => c.child_id === selectedChildId) : allCompletions,
    [allCompletions, selectedChildId]
  );

  // Save a new completion
  const saveMutation = useMutation({
    mutationFn: async ({
      mission,
      childId,
      feeling,
      learning,
    }: {
      mission: Mission;
      childId: string;
      feeling: string;
      learning: string;
    }) => {
      const pts = calcMissionPoints(mission);
      const { error } = await supabase.from("mission_completions").insert({
        mission_id: null,
        child_id: childId,
        template_mission_id: mission.id,
        reflection: feeling,
        learned: learning || null,
        points_earned: sumPoints(pts),
      });
      if (error) throw error;
      return pts;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mission-completions", family?.id] });
    },
  });

  // ── Gamification derived state ─────────────────────────────────────────────

  const totalPoints = useMemo(() => calcTotalPoints(completions), [completions]);
  const totalPointsSum = useMemo(() => sumPoints(totalPoints), [totalPoints]);

  const currentLevel = useMemo(() => {
    let level = LEVELS[0];
    for (const l of LEVELS) { if (totalPointsSum >= l.minPoints) level = l; }
    return level;
  }, [totalPointsSum]);

  const nextLevel = useMemo(() => {
    for (const l of LEVELS) { if (totalPointsSum < l.minPoints) return l; }
    return null;
  }, [totalPointsSum]);

  const progressToNext = useMemo(() => {
    if (!nextLevel) return 100;
    const range = nextLevel.minPoints - currentLevel.minPoints;
    const current = totalPointsSum - currentLevel.minPoints;
    return Math.min(100, Math.round((current / range) * 100));
  }, [currentLevel, nextLevel, totalPointsSum]);

  const weeklyStats = useMemo(() => {
    const days: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const count = completions.filter((c) => c.completed_at.slice(0, 10) === key).length;
      days.push({ date: key, count });
    }
    return days;
  }, [completions]);

  const skillBreakdown = useMemo(() => {
    const t = totalPoints;
    const total = sumPoints(t) || 1;
    return [
      { label: "Responsabilidade", value: t.responsibility, pct: Math.round((t.responsibility / total) * 100), color: "bg-amber-400" },
      { label: "Autonomia",        value: t.autonomy,       pct: Math.round((t.autonomy       / total) * 100), color: "bg-sky-400"  },
      { label: "Cooperação",       value: t.cooperation,    pct: Math.round((t.cooperation    / total) * 100), color: "bg-violet-400" },
      { label: "Cuidado",          value: t.care,           pct: Math.round((t.care           / total) * 100), color: "bg-green-400" },
      { label: "Resiliência",      value: t.resilience,     pct: Math.round((t.resilience     / total) * 100), color: "bg-rose-400" },
    ];
  }, [totalPoints]);

  const isMissionCompleted = useCallback(
    (missionId: string) => completions.some((c) => c.template_mission_id === missionId),
    [completions]
  );

  const getPreviewPoints = useCallback((mission: Mission) => calcMissionPoints(mission), []);

  // Compat with WorldMissions.tsx state.completed usage
  const state = useMemo(() => ({
    completed: completions.map((c) => ({
      missionId: c.template_mission_id ?? "",
      childId: c.child_id,
      completedAt: c.completed_at,
      feeling: c.reflection ?? "",
      learning: c.learned ?? "",
      pointsEarned: (() => {
        const m = missions.find((x) => x.id === c.template_mission_id);
        return m ? calcMissionPoints(m) : { responsibility: 0, autonomy: 0, cooperation: 0, care: 0, resilience: 0 };
      })(),
    })),
  }), [completions]);

  return {
    state,
    completeMission: saveMutation,
    isMissionCompleted,
    getPreviewPoints,
    currentLevel,
    nextLevel,
    totalPointsSum,
    progressToNext,
    weeklyStats,
    skillBreakdown,
    LEVELS,
  };
}
