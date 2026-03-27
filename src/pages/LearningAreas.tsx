import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronDown, Clock, Loader2, ArrowRight } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useChildren } from "@/hooks/useChildren";
import { useCurriculum, type CurriculumDiscipline } from "@/hooks/useCurriculum";
import { disciplines as DISCIPLINE_META } from "@/lib/disciplines";
import { getAgeGroup, getAgeGroupLabel } from "@/lib/disciplines";

// Map discipline_key → visual metadata from disciplines.ts
function getMeta(key: string) {
  return DISCIPLINE_META.find((d) => d.id === key) ?? {
    icon: "📚",
    color: "#9CA3AF",
    names: { early: key, primary: key, secondary: key },
    descriptions: { early: "", primary: "", secondary: "" },
  };
}

// Derive age from school_year string
function ageFromSchoolYear(schoolYear: string): number {
  if (schoolYear.includes("pré") || schoolYear.includes("Pré")) return 5;
  const match = schoolYear.match(/(\d)/);
  if (!match) return 7;
  const year = parseInt(match[1]);
  return 5 + year; // 1º→6, 2º→7, 3º→8, 4º→9
}

export default function LearningAreas() {
  const { children, isLoading: childrenLoading } = useChildren();
  const [selectedChildId, setSelectedChildId] = useState<string>("__first__");

  const child = selectedChildId === "__first__"
    ? children[0]
    : children.find((c) => c.id === selectedChildId);

  const schoolYear = child?.school_year ?? null;
  const { disciplines, isLoading: curriculumLoading } = useCurriculum(schoolYear);

  const isLoading = childrenLoading || curriculumLoading;

  const ageGroup = child ? getAgeGroup(ageFromSchoolYear(child.school_year)) : "primary";

  return (
    <AppLayout>
      <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Áreas de Aprendizagem
            </h1>
            <p className="text-muted-foreground mt-1">
              Disciplinas e objetivos adaptados ao ano escolar de cada criança.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!childrenLoading && children.length > 0 && (
              <Select
                value={selectedChildId === "__first__" ? (children[0]?.id ?? "") : selectedChildId}
                onValueChange={setSelectedChildId}
              >
                <SelectTrigger className="w-[200px] bg-card border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {children.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {child && (
              <Badge variant="secondary" className="text-xs whitespace-nowrap">
                {child.school_year} · {getAgeGroupLabel(ageGroup)}
              </Badge>
            )}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground py-12">
            <Loader2 className="h-4 w-4 animate-spin" /> A carregar currículo…
          </div>
        )}

        {/* Empty state — no children */}
        {!isLoading && children.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto text-primary/20 mb-3" />
            <p className="font-semibold text-foreground">Sem perfis criados</p>
            <p className="text-sm mt-1">Adiciona uma criança primeiro nas Definições.</p>
          </div>
        )}

        {/* Discipline grid */}
        {!isLoading && disciplines.length > 0 && (
          <motion.div
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
            key={schoolYear}
          >
            {disciplines.map((disc) => (
              <DisciplineCard key={disc.discipline_key} discipline={disc} ageGroup={ageGroup} />
            ))}
          </motion.div>
        )}

        {/* Link to Portfolio coverage */}
        {!isLoading && disciplines.length > 0 && (
          <CoverageCallToAction />
        )}

        {/* Empty curriculum (year not yet in DB) */}
        {!isLoading && child && disciplines.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="h-10 w-10 mx-auto text-primary/20 mb-3" />
            <p className="text-sm">Currículo para <strong>{schoolYear}</strong> ainda não disponível.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function CoverageCallToAction() {
  const navigate = useNavigate();
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Queres saber que objetivos já foram trabalhados?</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            No Portfólio podes analisar atividades e projetos com IA para ver a cobertura curricular.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 shrink-0"
          onClick={() => navigate("/portfolio")}
        >
          Ver Portfólio <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
}

function DisciplineCard({
  discipline,
  ageGroup,
}: {
  discipline: CurriculumDiscipline;
  ageGroup: ReturnType<typeof getAgeGroup>;
}) {
  const [open, setOpen] = useState(false);
  const meta = getMeta(discipline.discipline_key);
  const displayName = discipline.discipline_name;
  const objCount = discipline.objectives.length;

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <Card
        className={cn(
          "group relative overflow-hidden border-border/60 transition-shadow duration-300",
          open ? "shadow-elevated" : "hover:shadow-md cursor-pointer",
        )}
        onClick={() => setOpen((v) => !v)}
      >
        {/* Accent bar */}
        <div
          className="absolute top-0 left-0 w-full h-1 rounded-t-lg"
          style={{ backgroundColor: meta.color }}
        />

        <CardContent className="p-5 pt-6 space-y-3">
          {/* Icon + name row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3">
              <span className="text-2xl leading-none">{meta.icon}</span>
              <h3 className="text-base font-semibold text-foreground leading-tight">
                {displayName}
              </h3>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground shrink-0 mt-0.5 transition-transform duration-200",
                open && "rotate-180",
              )}
            />
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              {objCount} objetivos
            </span>
            {discipline.weekly_minutes && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {discipline.weekly_minutes} min/sem
              </span>
            )}
          </div>

          {/* Expandable objectives list */}
          <AnimatePresence initial={false}>
            {open && (
              <motion.ul
                key="objectives"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-1 pt-1 border-t border-border/40 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {discipline.objectives.map((obj, i) => (
                  <li key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: meta.color }}
                    />
                    {obj}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
