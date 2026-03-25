import { useState, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  missions,
  ageGroupLabels,
  benefitLabels,
  benefitColors,
  type AgeGroup,
  type MissionType,
  type MissionMode,
  type Mission,
} from "@/lib/worldMissionsContent";
import { useWorldMissions, LEVELS } from "@/hooks/useWorldMissions";
import { ReflectionDialog } from "@/components/ReflectionDialog";
import { Clock, Users, Home, TreePine, CheckCircle2, ChevronRight } from "lucide-react";

// ─── Filter chip ──────────────────────────────────────────────
const FilterChip = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
      active
        ? "bg-foreground text-background border-foreground shadow-sm"
        : "bg-card text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
    }`}
  >
    {children}
  </button>
);

// ─── Progress bar ─────────────────────────────────────────────
const ProgressBar = ({
  value,
  color = "bg-primary",
}: {
  value: number;
  color?: string;
}) => (
  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`h-full rounded-full ${color}`}
    />
  </div>
);

// ─── Mission Card ─────────────────────────────────────────────
const MissionCard = ({
  mission,
  index,
  completed,
  onStart,
}: {
  mission: Mission;
  index: number;
  completed: boolean;
  onStart: (m: Mission) => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: index * 0.04 }}
    className={`bg-card border rounded-2xl p-5 shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col gap-4 relative overflow-hidden ${
      completed ? "border-green-200 bg-green-50/30" : "border-border"
    }`}
  >
    {completed && (
      <div className="absolute top-3 right-3">
        <CheckCircle2 className="h-5 w-5 text-green-500" />
      </div>
    )}

    {/* Top row */}
    <div className="flex items-start gap-3">
      <span className={`text-3xl leading-none mt-0.5 ${completed ? "grayscale-0" : ""}`}>
        {mission.icon}
      </span>
      <div className="flex-1 min-w-0 pr-6">
        <h3 className="font-heading font-semibold text-foreground text-base leading-snug">
          {mission.name}
        </h3>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          {mission.description}
        </p>
      </div>
    </div>

    {/* Meta */}
    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
      <span className="flex items-center gap-1 bg-secondary rounded-full px-2.5 py-1">
        <Clock className="h-3 w-3" />
        {mission.estimatedTime}
      </span>
      <span className="flex items-center gap-1 bg-secondary rounded-full px-2.5 py-1">
        {mission.mode === "equipa" ? <Users className="h-3 w-3" /> : <span>👤</span>}
        {mission.mode === "equipa" ? "Equipa" : "Individual"}
      </span>
      <span className="flex items-center gap-1 bg-secondary rounded-full px-2.5 py-1">
        {mission.type === "interior" ? <Home className="h-3 w-3" /> : <TreePine className="h-3 w-3" />}
        {mission.type === "interior" ? "Interior" : "Exterior"}
      </span>
      <span className="bg-primary/10 text-primary rounded-full px-2.5 py-1 font-medium">
        {ageGroupLabels[mission.ageGroup]}
      </span>
    </div>

    {/* Benefits */}
    <div className="flex flex-wrap gap-1.5">
      {mission.benefits.map((b) => (
        <span
          key={b}
          className={`text-xs px-2.5 py-1 rounded-full font-medium ${benefitColors[b]}`}
        >
          {benefitLabels[b]}
        </span>
      ))}
    </div>

    {/* CTA */}
    <button
      onClick={() => onStart(mission)}
      className={`mt-1 w-full rounded-xl py-2 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
        completed
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-primary text-primary-foreground hover:opacity-90"
      }`}
    >
      {completed ? (
        <>
          <CheckCircle2 className="h-4 w-4" /> Repetir missão
        </>
      ) : (
        <>
          Iniciar missão <ChevronRight className="h-4 w-4" />
        </>
      )}
    </button>
  </motion.div>
);

// ─── Weekly bar chart ─────────────────────────────────────────
const WeeklyChart = ({ data }: { data: { date: string; count: number }[] }) => {
  const max = Math.max(...data.map((d) => d.count), 1);
  const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  return (
    <div className="flex items-end gap-2 h-20">
      {data.map((d, i) => {
        const dayOfWeek = new Date(d.date + "T12:00:00").getDay();
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(d.count / max) * 64}px` }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
      className={`w-full rounded-t-md ${d.count > 0 ? "bg-primary" : "bg-secondary"}`}
              style={{ minHeight: d.count > 0 ? 8 : 4 }}
            />
            <span className="text-[10px] text-muted-foreground">{dayLabels[dayOfWeek]}</span>
          </div>
        );
      })}
    </div>
  );
};

// ─── Age groups filter list ───────────────────────────────────
const ageGroups: { value: AgeGroup | "all"; label: string }[] = [
  { value: "all", label: "Todas as idades" },
  { value: "4-6", label: "4–6 anos" },
  { value: "7-10", label: "7–10 anos" },
  { value: "10+", label: "10+ anos" },
];

// ─── Main page ────────────────────────────────────────────────
export default function WorldMissions() {
  const [selectedAge, setSelectedAge] = useState<AgeGroup | "all">("all");
  const [selectedType, setSelectedType] = useState<MissionType | "all">("all");
  const [selectedMode, setSelectedMode] = useState<MissionMode | "all">("all");
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [showProgress, setShowProgress] = useState(false);

  const {
    completeMission,
    isMissionCompleted,
    currentLevel,
    nextLevel,
    totalPointsSum,
    progressToNext,
    weeklyStats,
    skillBreakdown,
    getPreviewPoints,
    state,
  } = useWorldMissions();

  const filtered = useMemo(() => {
    return missions.filter((m) => {
      if (selectedAge !== "all" && m.ageGroup !== selectedAge) return false;
      if (selectedType !== "all" && m.type !== selectedType) return false;
      if (selectedMode !== "all" && m.mode !== selectedMode) return false;
      return true;
    });
  }, [selectedAge, selectedType, selectedMode]);

  const hasExterior = useMemo(
    () =>
      missions.some(
        (m) =>
          m.type === "exterior" &&
          (selectedAge === "all" || m.ageGroup === selectedAge) &&
          (selectedMode === "all" || m.mode === selectedMode)
      ),
    [selectedAge, selectedMode]
  );

  const previewPoints = activeMission ? getPreviewPoints(activeMission) : null;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end gap-4"
        >
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium tracking-wide uppercase">
              <span className="text-lg">🌍</span> Área Transversal
            </div>
            <h1 className="font-heading text-4xl font-bold text-foreground leading-tight">
              Missões do Mundo
            </h1>
            <p className="text-lg text-muted-foreground font-light leading-relaxed">
              Cuidar do nosso mundo começa em casa.
            </p>
          </div>
          <button
            onClick={() => setShowProgress((p) => !p)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${
              showProgress
                ? "bg-foreground text-background border-foreground"
                : "bg-card border-border text-foreground hover:border-foreground/40"
            }`}
          >
            <span className="text-base">{currentLevel.icon}</span>
            {currentLevel.name}
          </button>
        </motion.div>

        {/* ── Progress Panel ── */}
        <AnimatePresence>
          {showProgress && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="overflow-hidden"
            >
              <div className={`rounded-3xl border p-6 bg-gradient-to-br ${currentLevel.color} ${currentLevel.borderColor} space-y-6`}>
                {/* Level header */}
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{currentLevel.icon}</span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Nível atual
                    </p>
                    <h2 className={`font-heading text-2xl font-bold ${currentLevel.textColor}`}>
                      {currentLevel.name}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {currentLevel.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-heading text-3xl font-bold ${currentLevel.textColor}`}>
                      {totalPointsSum}
                    </p>
                    <p className="text-xs text-muted-foreground">pontos totais</p>
                  </div>
                </div>

                {/* Progress to next level */}
                {nextLevel ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progresso para <strong>{nextLevel.name}</strong></span>
                      <span>{progressToNext}%</span>
                    </div>
                    <ProgressBar value={progressToNext} />
                    <p className="text-xs text-muted-foreground">
                      Faltam {nextLevel.minPoints - totalPointsSum} pontos para o próximo nível
                    </p>
                  </div>
                ) : (
                  <div className="text-sm font-medium text-muted-foreground text-center py-2">
                    🏆 Atingiste o nível máximo! O teu impacto é real.
                  </div>
                )}

                {/* Level path */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  {LEVELS.map((level, i) => {
                    const reached = totalPointsSum >= level.minPoints;
                    return (
                      <div key={level.id} className="flex items-center gap-1 shrink-0">
                        <div
                          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border text-center transition-all ${
                            reached
                              ? "bg-white/70 border-white/60 shadow-sm"
                              : "bg-white/20 border-white/20 opacity-50"
                          }`}
                        >
                          <span className="text-xl">{level.icon}</span>
                          <span className="text-[10px] font-semibold text-foreground leading-tight max-w-[64px]">
                            {level.name.split(" ").slice(0, 2).join(" ")}
                          </span>
                        </div>
                        {i < LEVELS.length - 1 && (
                          <div className={`h-px w-4 shrink-0 ${reached ? "bg-foreground/30" : "bg-foreground/10"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Missões concluídas", value: state.completed.length, icon: "🎯" },
                    { label: "Esta semana", value: weeklyStats.reduce((a, d) => a + d.count, 0), icon: "📅" },
                    { label: "Em equipa", value: state.completed.filter((c) => missions.find((m) => m.id === c.missionId)?.mode === "equipa").length, icon: "🤝" },
                    { label: "Individuais", value: state.completed.filter((c) => missions.find((m) => m.id === c.missionId)?.mode === "individual").length, icon: "👤" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/60 rounded-2xl p-3 text-center">
                      <div className="text-xl mb-1">{s.icon}</div>
                      <div className="font-heading text-2xl font-bold text-foreground">{s.value}</div>
                      <div className="text-[11px] text-muted-foreground">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Skills breakdown */}
                {totalPointsSum > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Competências desenvolvidas
                    </p>
                    {skillBreakdown.map((s) => (
                      <div key={s.label} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-foreground">{s.label}</span>
                          <span className="text-muted-foreground">{s.value} pts</span>
                        </div>
                        <ProgressBar value={s.pct} color={s.color} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Weekly chart */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Histórico semanal
                  </p>
                  <WeeklyChart data={weeklyStats} />
                </div>

                {/* Philosophy note */}
                <p className="text-xs text-muted-foreground text-center italic border-t border-white/30 pt-4">
                  Não há ranking entre crianças. O único caminho é o teu próprio crescimento. 🌱
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Filters ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-5 shadow-soft space-y-4"
        >
          <h2 className="font-heading text-sm font-semibold text-foreground uppercase tracking-wider">
            Filtrar missões
          </h2>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Idade</p>
            <div className="flex flex-wrap gap-2">
              {ageGroups.map((ag) => (
                <FilterChip key={ag.value} active={selectedAge === ag.value} onClick={() => setSelectedAge(ag.value)}>
                  {ag.label}
                </FilterChip>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Espaço</p>
            <div className="flex flex-wrap gap-2">
              <FilterChip active={selectedType === "all"} onClick={() => setSelectedType("all")}>Todos</FilterChip>
              <FilterChip active={selectedType === "interior"} onClick={() => setSelectedType("interior")}>
                <span className="flex items-center gap-1.5"><Home className="h-3.5 w-3.5" /> Interior</span>
              </FilterChip>
              {hasExterior && (
                <FilterChip active={selectedType === "exterior"} onClick={() => setSelectedType("exterior")}>
                  <span className="flex items-center gap-1.5"><TreePine className="h-3.5 w-3.5" /> Exterior</span>
                </FilterChip>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Modalidade</p>
            <div className="flex flex-wrap gap-2">
              <FilterChip active={selectedMode === "all"} onClick={() => setSelectedMode("all")}>Todas</FilterChip>
              <FilterChip active={selectedMode === "individual"} onClick={() => setSelectedMode("individual")}>👤 Individual</FilterChip>
              <FilterChip active={selectedMode === "equipa"} onClick={() => setSelectedMode("equipa")}>
                <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Equipa</span>
              </FilterChip>
            </div>
          </div>
        </motion.div>

        {/* ── Mission Grid ── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              {filtered.length === missions.length
                ? "Todas as missões"
                : `${filtered.length} missão${filtered.length !== 1 ? "ões" : ""} encontrada${filtered.length !== 1 ? "s" : ""}`}
            </h2>
            {state.completed.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {state.completed.length} concluída{state.completed.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 text-muted-foreground"
            >
              <div className="text-5xl mb-4">🌱</div>
              <p className="font-heading text-lg font-medium">Nenhuma missão encontrada</p>
              <p className="text-sm mt-1">Tenta ajustar os filtros para descobrir mais missões.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((mission, i) => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  index={i}
                  completed={isMissionCompleted(mission.id)}
                  onStart={setActiveMission}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="border-t border-border pt-8 pb-4 text-center"
        >
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            As missões são sugestões de ponto de partida. Adapta-as ao ritmo, ao espaço
            e à personalidade de cada criança.
          </p>
        </motion.div>
      </div>

      {/* ── Reflection Dialog ── */}
      <ReflectionDialog
        mission={activeMission}
        open={!!activeMission}
        onClose={() => setActiveMission(null)}
        onComplete={(feeling, learning) => {
          if (activeMission) {
            completeMission(activeMission, feeling, learning);
            setShowProgress(true);
          }
        }}
        previewPoints={previewPoints}
      />
    </AppLayout>
  );
}
