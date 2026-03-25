import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { CalendarIcon, Trophy, Star, Image, FileText, Video, Sparkles, Filter, ChevronDown, Heart, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

/* ── Types ─────────────────────────────────────── */
interface PortfolioEntry {
  id: string;
  title: string;
  description: string;
  date: Date;
  subject: string;
  subjectColor: string;
  project?: string;
  evidences: { type: "image" | "video" | "text"; name: string }[];
  milestone?: boolean;
}

/* ── Mock data ─────────────────────────────────── */
const children = [
  { id: "1", name: "Bryan Malta", schoolYear: "2º ano", avatar: "BM" },
  { id: "2", name: "Noa Malta", schoolYear: "Pré-escolar", avatar: "NM" },
];

const entries: PortfolioEntry[] = [
  { id: "1", title: "Leitura do conto 'O Gato Malhado'", description: "Leitura expressiva com interpretação oral e desenho sobre a história.", date: new Date(2026, 1, 14), subject: "Português", subjectColor: "bg-blue-100 text-blue-700", project: "Projeto Leitura", evidences: [{ type: "image", name: "desenho_gato.png" }, { type: "text", name: "resumo.pdf" }], milestone: true },
  { id: "2", title: "Contagem e agrupamento com materiais", description: "Utilizou blocos lógicos para agrupar por cor e forma. Contagem até 50.", date: new Date(2026, 1, 12), subject: "Matemática", subjectColor: "bg-amber-100 text-amber-700", evidences: [{ type: "image", name: "blocos.jpg" }] },
  { id: "3", title: "Exploração de plantas no jardim", description: "Observou diferentes tipos de folhas e registou num caderno de campo.", date: new Date(2026, 1, 10), subject: "Estudo do Meio", subjectColor: "bg-emerald-100 text-emerald-700", project: "Projeto Natureza", evidences: [{ type: "image", name: "folhas.jpg" }, { type: "image", name: "caderno.jpg" }] },
  { id: "4", title: "Escrita criativa — 'O meu animal preferido'", description: "Texto de 8 frases com adjetivos e pontuação correta.", date: new Date(2026, 1, 7), subject: "Português", subjectColor: "bg-blue-100 text-blue-700", evidences: [{ type: "text", name: "texto_animal.pdf" }], milestone: true },
  { id: "5", title: "Pintura com aguarelas — Paisagem", description: "Exploração de cores primárias e secundárias numa paisagem imaginada.", date: new Date(2026, 1, 5), subject: "Expressões", subjectColor: "bg-pink-100 text-pink-700", project: "Projeto Leitura", evidences: [{ type: "image", name: "pintura.jpg" }, { type: "video", name: "processo.mp4" }] },
  { id: "6", title: "Resolução de problemas — Mercado", description: "Simulação de compras com cálculo de trocos e somas.", date: new Date(2026, 1, 3), subject: "Matemática", subjectColor: "bg-amber-100 text-amber-700", evidences: [{ type: "image", name: "mercado.jpg" }] },
];

const subjects = ["Todos", "Português", "Matemática", "Estudo do Meio", "Expressões", "Cidadania"];
const projects = ["Todos", "Projeto Leitura", "Projeto Natureza"];

const evidenceIcon = (type: string) => {
  if (type === "image") return <Image className="h-3.5 w-3.5" />;
  if (type === "video") return <Video className="h-3.5 w-3.5" />;
  return <FileText className="h-3.5 w-3.5" />;
};

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }) };

const Portfolio = () => {
  const [selectedChild, setSelectedChild] = useState("1");
  const [subjectFilter, setSubjectFilter] = useState("Todos");
  const [projectFilter, setProjectFilter] = useState("Todos");
  const [showFilters, setShowFilters] = useState(false);

  const child = children.find((c) => c.id === selectedChild)!;

  const filtered = entries.filter((e) => {
    if (subjectFilter !== "Todos" && e.subject !== subjectFilter) return false;
    if (projectFilter !== "Todos" && e.project !== projectFilter) return false;
    return true;
  });

  const milestoneCount = entries.filter((e) => e.milestone).length;

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* ── Header with child selector ──────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-2">
              <Trophy className="h-7 w-7 text-primary" /> Portfólio
            </h1>
            <p className="text-muted-foreground mt-1">O percurso de aprendizagem, passo a passo.</p>
          </div>
          <Select value={selectedChild} onValueChange={setSelectedChild}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {children.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ── Child profile banner ────────────────── */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
          <Card className="border-primary/10 overflow-hidden">
            <div className="gradient-warmth p-6 flex items-center gap-5">
              <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                {child.avatar}
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-heading font-bold">{child.name}</h2>
                <p className="text-white/80 text-sm">{child.schoolYear} · Ensino Doméstico</p>
              </div>
              <div className="ml-auto hidden sm:flex gap-3">
                <div className="text-center bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2">
                  <p className="text-2xl font-bold text-white">{entries.length}</p>
                  <p className="text-xs text-white/70">Atividades</p>
                </div>
                <div className="text-center bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2">
                  <p className="text-2xl font-bold text-white">{milestoneCount}</p>
                  <p className="text-xs text-white/70">Conquistas</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ── Filters ────────────────────────────── */}
        <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
            <Filter className="h-4 w-4" /> Filtros <ChevronDown className={cn("h-4 w-4 transition-transform", showFilters && "rotate-180")} />
          </Button>

          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex flex-wrap gap-3 mt-3">
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {projects.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </motion.div>
          )}
        </motion.div>

        {/* ── Timeline ───────────────────────────── */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 via-primary/15 to-transparent hidden sm:block" />

          <div className="space-y-4">
            {filtered.map((entry, i) => (
              <motion.div key={entry.id} initial="hidden" animate="visible" custom={i + 2} variants={fadeUp} className="flex gap-4">
                {/* Timeline dot */}
                <div className="hidden sm:flex flex-col items-center pt-5">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center shrink-0 shadow-sm z-10",
                    entry.milestone ? "gradient-warmth" : "bg-card border-2 border-primary/20"
                  )}>
                    {entry.milestone ? <Star className="h-4 w-4 text-white" /> : <Leaf className="h-4 w-4 text-primary/60" />}
                  </div>
                </div>

                {/* Card */}
                <Card className={cn(
                  "flex-1 hover:shadow-md transition-shadow border-primary/10",
                  entry.milestone && "ring-1 ring-primary/20"
                )}>
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={cn("text-xs font-medium", entry.subjectColor)}>{entry.subject}</Badge>
                        {entry.project && <Badge variant="outline" className="text-xs">{entry.project}</Badge>}
                        {entry.milestone && (
                          <Badge className="bg-primary/10 text-primary text-xs gap-1">
                            <Heart className="h-3 w-3" /> Conquista
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{format(entry.date, "d MMM yyyy", { locale: pt })}</span>
                    </div>

                    <h3 className="font-semibold text-foreground">{entry.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{entry.description}</p>

                    {/* Evidences */}
                    {entry.evidences.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {entry.evidences.map((ev, j) => (
                          <div key={j} className="flex items-center gap-1.5 bg-muted/60 rounded-lg px-2.5 py-1 text-xs text-muted-foreground">
                            {evidenceIcon(ev.type)}
                            <span className="max-w-[120px] truncate">{ev.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Sparkles className="h-12 w-12 mx-auto text-primary/30 mb-3" />
              <p className="text-muted-foreground">Nenhuma atividade encontrada com estes filtros.</p>
            </div>
          )}
        </div>
      </motion.div>
    </AppLayout>
  );
};

export default Portfolio;
