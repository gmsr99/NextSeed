import { useState, useCallback, useMemo } from "react";
import { missions, type Mission, type MissionBenefit } from "@/lib/worldMissionsContent";

export interface CompletedMission {
  missionId: string;
  completedAt: string; // ISO date
  feeling: string;
  learning: string;
  pointsEarned: MissionPoints;
}

export interface MissionPoints {
  responsibility: number;
  autonomy: number;
  cooperation: number;
  care: number;
  resilience: number;
}

export interface GamificationState {
  completed: CompletedMission[];
  totalPoints: MissionPoints;
}

// Points per benefit type
const BENEFIT_POINTS: Record<MissionBenefit, Partial<MissionPoints>> = {
  responsabilidade: { responsibility: 10 },
  autonomia: { autonomy: 10 },
  cooperação: { cooperation: 10 },
  cuidado: { care: 10 },
  resiliência: { resilience: 10 },
  organização: { responsibility: 5, autonomy: 5 },
  liderança: { cooperation: 8, autonomy: 8 },
  criatividade: { autonomy: 6, resilience: 6 },
};

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

function calcTotalPoints(completed: CompletedMission[]): MissionPoints {
  return completed.reduce(
    (acc, c) => ({
      responsibility: acc.responsibility + c.pointsEarned.responsibility,
      autonomy: acc.autonomy + c.pointsEarned.autonomy,
      cooperation: acc.cooperation + c.pointsEarned.cooperation,
      care: acc.care + c.pointsEarned.care,
      resilience: acc.resilience + c.pointsEarned.resilience,
    }),
    { responsibility: 0, autonomy: 0, cooperation: 0, care: 0, resilience: 0 }
  );
}

function calcMissionPoints(mission: Mission): MissionPoints {
  const pts: MissionPoints = {
    responsibility: 0,
    autonomy: 0,
    cooperation: 0,
    care: 0,
    resilience: 0,
  };

  // Mode bonus
  if (mission.mode === "equipa") pts.cooperation += 5;
  if (mission.mode === "individual") pts.autonomy += 5;

  // Benefit points
  for (const b of mission.benefits) {
    const bp = BENEFIT_POINTS[b];
    if (bp.responsibility) pts.responsibility += bp.responsibility;
    if (bp.autonomy) pts.autonomy += bp.autonomy;
    if (bp.cooperation) pts.cooperation += bp.cooperation;
    if (bp.care) pts.care += bp.care;
    if (bp.resilience) pts.resilience += bp.resilience;
  }

  return pts;
}

function sumPoints(pts: MissionPoints): number {
  return pts.responsibility + pts.autonomy + pts.cooperation + pts.care + pts.resilience;
}

function getCurrentLevel(totalPts: MissionPoints) {
  const total = sumPoints(totalPts);
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (total >= level.minPoints) current = level;
  }
  return current;
}

function getNextLevel(totalPts: MissionPoints) {
  const total = sumPoints(totalPts);
  for (const level of LEVELS) {
    if (total < level.minPoints) return level;
  }
  return null;
}

const STORAGE_KEY = "nexseed_world_missions";

function loadState(): GamificationState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { completed: [], totalPoints: { responsibility: 0, autonomy: 0, cooperation: 0, care: 0, resilience: 0 } };
}

function saveState(state: GamificationState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function useWorldMissions() {
  const [state, setState] = useState<GamificationState>(() => {
    const loaded = loadState();
    return { ...loaded, totalPoints: calcTotalPoints(loaded.completed) };
  });

  const completeMission = useCallback(
    (mission: Mission, feeling: string, learning: string) => {
      const points = calcMissionPoints(mission);
      const entry: CompletedMission = {
        missionId: mission.id,
        completedAt: new Date().toISOString(),
        feeling,
        learning,
        pointsEarned: points,
      };
      setState((prev) => {
        const completed = [...prev.completed, entry];
        const totalPoints = calcTotalPoints(completed);
        const next = { completed, totalPoints };
        saveState(next);
        return next;
      });
      return points;
    },
    []
  );

  const isMissionCompleted = useCallback(
    (missionId: string) => state.completed.some((c) => c.missionId === missionId),
    [state.completed]
  );

  const getMissionHistory = useCallback(
    (missionId: string) => state.completed.filter((c) => c.missionId === missionId),
    [state.completed]
  );

  const currentLevel = useMemo(() => getCurrentLevel(state.totalPoints), [state.totalPoints]);
  const nextLevel = useMemo(() => getNextLevel(state.totalPoints), [state.totalPoints]);
  const totalPointsSum = useMemo(() => sumPoints(state.totalPoints), [state.totalPoints]);

  const progressToNext = useMemo(() => {
    if (!nextLevel) return 100;
    const prev = currentLevel.minPoints;
    const range = nextLevel.minPoints - prev;
    const current = totalPointsSum - prev;
    return Math.min(100, Math.round((current / range) * 100));
  }, [currentLevel, nextLevel, totalPointsSum]);

  // Weekly stats — last 7 days
  const weeklyStats = useMemo(() => {
    const days: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const count = state.completed.filter((c) => c.completedAt.slice(0, 10) === key).length;
      days.push({ date: key, count });
    }
    return days;
  }, [state.completed]);

  // Skill breakdown as percentages
  const skillBreakdown = useMemo(() => {
    const t = state.totalPoints;
    const total = sumPoints(t) || 1;
    return [
      { label: "Responsabilidade", value: t.responsibility, pct: Math.round((t.responsibility / total) * 100), color: "bg-amber-400" },
      { label: "Autonomia", value: t.autonomy, pct: Math.round((t.autonomy / total) * 100), color: "bg-sky-400" },
      { label: "Cooperação", value: t.cooperation, pct: Math.round((t.cooperation / total) * 100), color: "bg-violet-400" },
      { label: "Cuidado", value: t.care, pct: Math.round((t.care / total) * 100), color: "bg-green-400" },
      { label: "Resiliência", value: t.resilience, pct: Math.round((t.resilience / total) * 100), color: "bg-rose-400" },
    ];
  }, [state.totalPoints]);

  // Per-mission points preview
  const getPreviewPoints = useCallback((mission: Mission) => calcMissionPoints(mission), []);

  return {
    state,
    completeMission,
    isMissionCompleted,
    getMissionHistory,
    currentLevel,
    nextLevel,
    totalPointsSum,
    progressToNext,
    weeklyStats,
    skillBreakdown,
    getPreviewPoints,
    LEVELS,
  };
}
