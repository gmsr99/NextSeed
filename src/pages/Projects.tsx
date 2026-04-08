import { useState } from "react";
import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import {
  Rocket, TreePine, Hammer, FlaskConical, Palette, Star,
  Plus, CheckCircle2, Circle, ChevronDown, ChevronUp,
  Trash2, Loader2, X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useChildren } from "@/hooks/useChildren";
import { useProjects, type Project } from "@/hooks/useProjects";

// ── Template data ───────────────────────────────────────────────────────────

const typeConfig: Record<string, { icon: typeof TreePine; color: string; bg: string }> = {
  Natureza:   { icon: TreePine,      color: "text-accent",       bg: "bg-accent/10" },
  Construção: { icon: Hammer,        color: "text-primary",      bg: "bg-primary/10" },
  Ciência:    { icon: FlaskConical,  color: "text-destructive",  bg: "bg-destructive/10" },
  Arte:       { icon: Palette,       color: "text-orange-500",   bg: "bg-orange-500/10" },
};

const difficultyStars: Record<string, number> = { Fácil: 1, Médio: 2, Avançado: 3 };

const TEMPLATES = [
  {
    id: "t1", title: "Horta Vertical com Garrafas", type: "Natureza", difficulty: "Fácil",
    areas: ["Ciências", "Matemática", "Expressão Plástica"],
    description: "Construir uma horta vertical reutilizando garrafas PET. Medir, plantar e observar o crescimento.",
    phases: [
      "Reunir materiais (garrafas, terra, sementes)",
      "Cortar e preparar as garrafas",
      "Plantar as sementes",
      "Montar a estrutura vertical",
      "Regar e observar o crescimento",
    ],
  },
  {
    id: "t2", title: "Vulcão em Erupção", type: "Ciência", difficulty: "Médio",
    areas: ["Ciências", "Expressão Plástica"],
    description: "Criar um modelo de vulcão e simular uma erupção com bicarbonato e vinagre.",
    phases: [
      "Construir o molde do vulcão",
      "Pintar e decorar",
      "Preparar os materiais da erupção",
      "Realizar a erupção e registar",
    ],
  },
  {
    id: "t3", title: "Ponte de Palitos de Gelado", type: "Construção", difficulty: "Avançado",
    areas: ["Matemática", "Engenharia", "Expressão Plástica"],
    description: "Projetar e construir uma ponte resistente usando apenas palitos e cola.",
    phases: [
      "Planear e desenhar o projeto",
      "Cortar e preparar os palitos",
      "Construir a estrutura principal",
      "Testar a resistência",
    ],
  },
  {
    id: "t4", title: "Pintura com Elementos Naturais", type: "Arte", difficulty: "Fácil",
    areas: ["Expressão Plástica", "Ciências"],
    description: "Criar obras de arte usando folhas, flores, terra e materiais encontrados na natureza.",
    phases: [
      "Recolher materiais naturais",
      "Experimentar texturas e padrões",
      "Criar a composição final",
      "Fotografar o resultado",
    ],
  },
  {
    id: "t5", title: "Estação Meteorológica Caseira", type: "Ciência", difficulty: "Avançado",
    areas: ["Ciências", "Matemática", "Tecnologia"],
    description: "Construir instrumentos simples para medir temperatura, vento e chuva.",
    phases: [
      "Construir o pluviómetro",
      "Construir o anemómetro",
      "Montar a estação",
      "Registar dados durante uma semana",
    ],
  },
  {
    id: "t6", title: "Casa para Insetos", type: "Natureza", difficulty: "Médio",
    areas: ["Ciências", "Expressão Plástica"],
    description: "Criar um refúgio para insetos usando materiais naturais: paus, pinhas e folhas.",
    phases: [
      "Recolher materiais naturais",
      "Construir a estrutura base",
      "Preencher com materiais",
      "Colocar no jardim ou varanda",
    ],
  },
  {
    id: "t7", title: "Robot com Materiais Reciclados", type: "Construção", difficulty: "Médio",
    areas: ["Tecnologia", "Expressão Plástica", "Matemática"],
    description: "Construir um robot criativo reutilizando caixas, tampas e rolos de papel.",
    phases: [
      "Recolher materiais reciclados",
      "Planear o design do robot",
      "Construir o corpo",
      "Decorar e finalizar",
    ],
  },
  {
    id: "t8", title: "Mural de Land Art", type: "Arte", difficulty: "Fácil",
    areas: ["Expressão Plástica", "Ciências"],
    description: "Criar composições artísticas ao ar livre utilizando pedras, folhas e ramos.",
    phases: [
      "Escolher o local",
      "Recolher materiais naturais",
      "Criar a composição",
      "Fotografar o resultado",
    ],
  },
];

// ── Status config ───────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  active:    { label: "Em curso",   className: "bg-primary/10 text-primary" },
  paused:    { label: "Pausado",    className: "bg-amber-100 text-amber-700" },
  completed: { label: "Concluído",  className: "bg-green-100 text-green-700" },
};

// ── Active Project Card ─────────────────────────────────────────────────────

function ProjectCard({
  project,
  childName,
  onCompletePhase,
  onUpdateStatus,
  onDelete,
}: {
  project: Project;
  childName: string;
  onCompletePhase: (phaseId: string) => void;
  onUpdateStatus: (status: Project["status"]) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(project.status === "active");
  const done = project.phases.filter((p) => p.completed).length;
  const total = project.phases.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const sc = STATUS_CONFIG[project.status];

  return (
    <Card className="border-border/60 shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sc.className}`}>
                {sc.label}
              </span>
              {childName && (
                <span className="text-xs text-muted-foreground">{childName}</span>
              )}
            </div>
            <h3 className="font-heading font-bold text-base leading-tight">{project.title}</h3>
          </div>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0 p-1"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className="space-y-1 mt-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{done} de {total} fases</span>
              <span>{pct}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}
      </CardHeader>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <CardContent className="pt-0 pb-3 space-y-1.5">
              {project.description && (
                <p className="text-xs text-muted-foreground mb-3">{project.description}</p>
              )}
              {project.phases.map((phase) => (
                <button
                  key={phase.id}
                  onClick={() => onCompletePhase(phase.id)}
                  className="w-full flex items-center gap-2.5 text-left rounded-lg px-2 py-1.5 hover:bg-muted/50 transition-colors group"
                >
                  {phase.completed
                    ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    : <Circle className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                  }
                  <span className={`text-sm ${phase.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {phase.title}
                  </span>
                </button>
              ))}
            </CardContent>

            <CardFooter className="pt-0 gap-2 flex-wrap">
              {project.status !== "completed" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs"
                  onClick={() => onUpdateStatus(project.status === "active" ? "paused" : "active")}
                >
                  {project.status === "active" ? "Pausar" : "Retomar"}
                </Button>
              )}
              {pct === 100 && project.status !== "completed" && (
                <Button
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => onUpdateStatus("completed")}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Concluir
                </Button>
              )}
              <button
                onClick={onDelete}
                className="ml-auto text-muted-foreground hover:text-destructive transition-colors p-1"
                title="Eliminar projeto"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </CardFooter>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// ── Start Dialog ────────────────────────────────────────────────────────────

function StartProjectDialog({
  template,
  children,
  onClose,
  onStart,
  saving,
}: {
  template: typeof TEMPLATES[0] | null;
  children: { id: string; name: string }[];
  onClose: () => void;
  onStart: (childId: string, title: string) => void;
  saving: boolean;
}) {
  const [childId, setChildId] = useState(children[0]?.id ?? "");
  const [title, setTitle] = useState(template?.title ?? "");

  // Reset when template changes
  if (template && title !== template.title && !saving) {
    setTitle(template.title);
    setChildId(children[0]?.id ?? "");
  }

  return (
    <Dialog open={!!template} onOpenChange={onClose}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading">Iniciar Projeto</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label>Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Criança</Label>
            <Select value={childId} onValueChange={setChildId}>
              <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
              <SelectContent>
                {children.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {template && (
            <div className="rounded-lg bg-muted/50 p-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">{template.phases.length} fases incluídas</p>
              {template.phases.map((p, i) => (
                <p key={i} className="text-xs text-muted-foreground">· {p}</p>
              ))}
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button
              className="flex-1 gap-2"
              disabled={!childId || !title.trim() || saving}
              onClick={() => onStart(childId, title.trim())}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
              Iniciar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function Projects() {
  const { children } = useChildren();
  const { projects, isLoading, createProject, completePhase, updateStatus, deleteProject } = useProjects();

  const [typeFilter, setTypeFilter] = useState("all");
  const [diffFilter, setDiffFilter] = useState("all");
  const [startingTemplate, setStartingTemplate] = useState<typeof TEMPLATES[0] | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const activeProjects   = projects.filter((p) => p.status !== "completed");
  const completedProjects = projects.filter((p) => p.status === "completed");

  const filteredTemplates = TEMPLATES.filter(
    (t) =>
      (typeFilter === "all" || t.type === typeFilter) &&
      (diffFilter === "all" || t.difficulty === diffFilter)
  );

  const handleStart = async (childId: string, title: string) => {
    if (!startingTemplate) return;
    try {
      await createProject.mutateAsync({
        child_id: childId,
        title,
        description: startingTemplate.description,
        phases: startingTemplate.phases.map((p) => ({ title: p })),
      });
      toast({ title: "Projeto iniciado! 🚀" });
      setStartingTemplate(null);
    } catch (e) {
      toast({ title: "Erro ao iniciar", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    }
  };

  const handleCompletePhase = async (project: Project, phaseId: string) => {
    try {
      await completePhase.mutateAsync({ project, phaseId });
    } catch {
      toast({ title: "Erro ao atualizar fase", variant: "destructive" });
    }
  };

  const handleStatus = async (id: string, status: Project["status"]) => {
    try {
      await updateStatus.mutateAsync({ id, status });
    } catch {
      toast({ title: "Erro ao atualizar estado", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject.mutateAsync(id);
      toast({ title: "Projeto eliminado." });
      setConfirmDeleteId(null);
    } catch {
      toast({ title: "Erro ao eliminar", variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-end gap-3">
          <div className="h-10 w-10 rounded-xl gradient-warmth flex items-center justify-center shrink-0">
            <Rocket className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold">Projetos STEAM</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Explora, cria e aprende por fases.</p>
          </div>
        </div>

        <Tabs defaultValue={activeProjects.length > 0 ? "mine" : "library"}>
          <TabsList>
            <TabsTrigger value="mine">
              Os Meus Projetos
              {activeProjects.length > 0 && (
                <span className="ml-1.5 bg-primary/15 text-primary text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {activeProjects.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="library">Biblioteca</TabsTrigger>
          </TabsList>

          {/* ── Tab: Os Meus Projetos ── */}
          <TabsContent value="mine" className="mt-6 space-y-6">
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground py-8">
                <Loader2 className="h-4 w-4 animate-spin" /> A carregar...
              </div>
            ) : activeProjects.length === 0 && completedProjects.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Rocket className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-heading font-semibold text-foreground">Nenhum projeto ainda</p>
                <p className="text-sm mt-1">Vai à Biblioteca para iniciar um projeto.</p>
              </div>
            ) : (
              <>
                {/* Active / Paused */}
                {activeProjects.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="font-heading font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Em curso & pausados
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {activeProjects.map((p) => {
                        const child = children.find((c) => c.id === p.child_id);
                        return (
                          <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                            <ProjectCard
                              project={p}
                              childName={child?.name.split(" ")[0] ?? ""}
                              onCompletePhase={(phaseId) => handleCompletePhase(p, phaseId)}
                              onUpdateStatus={(status) => handleStatus(p.id, status)}
                              onDelete={() => setConfirmDeleteId(p.id)}
                            />
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Completed */}
                {completedProjects.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="font-heading font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Concluídos
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {completedProjects.map((p) => {
                        const child = children.find((c) => c.id === p.child_id);
                        return (
                          <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <ProjectCard
                              project={p}
                              childName={child?.name.split(" ")[0] ?? ""}
                              onCompletePhase={(phaseId) => handleCompletePhase(p, phaseId)}
                              onUpdateStatus={(status) => handleStatus(p.id, status)}
                              onDelete={() => setConfirmDeleteId(p.id)}
                            />
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* ── Tab: Biblioteca ── */}
          <TabsContent value="library" className="mt-6 space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px] h-9 text-sm"><SelectValue placeholder="Tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="Natureza">Natureza</SelectItem>
                  <SelectItem value="Construção">Construção</SelectItem>
                  <SelectItem value="Ciência">Ciência</SelectItem>
                  <SelectItem value="Arte">Arte</SelectItem>
                </SelectContent>
              </Select>
              <Select value={diffFilter} onValueChange={setDiffFilter}>
                <SelectTrigger className="w-[140px] h-9 text-sm"><SelectValue placeholder="Dificuldade" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Fácil">Fácil</SelectItem>
                  <SelectItem value="Médio">Médio</SelectItem>
                  <SelectItem value="Avançado">Avançado</SelectItem>
                </SelectContent>
              </Select>
              {(typeFilter !== "all" || diffFilter !== "all") && (
                <button
                  onClick={() => { setTypeFilter("all"); setDiffFilter("all"); }}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3 w-3" /> Limpar
                </button>
              )}
            </div>

            {/* Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTemplates.map((t, i) => {
                const cfg = typeConfig[t.type];
                const Icon = cfg.icon;
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Card className="h-full flex flex-col hover:shadow-elevated transition-shadow duration-300 group">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className={`h-10 w-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                            <Icon className={`h-5 w-5 ${cfg.color}`} />
                          </div>
                          <Badge variant="secondary" className="text-[10px] font-medium shrink-0">{t.type}</Badge>
                        </div>
                        <h3 className="font-heading font-bold text-base leading-tight mt-2 group-hover:text-primary transition-colors">
                          {t.title}
                        </h3>
                      </CardHeader>

                      <CardContent className="flex-1 pb-3 space-y-3">
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                          {t.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {t.areas.map((a) => (
                            <Badge key={a} variant="outline" className="text-[10px] px-1.5 py-0">{a}</Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 3 }).map((_, s) => (
                            <Star
                              key={s}
                              className={`h-3.5 w-3.5 ${s < difficultyStars[t.difficulty] ? "text-primary fill-primary" : "text-muted-foreground/30"}`}
                            />
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">{t.difficulty}</span>
                          <span className="text-xs text-muted-foreground ml-auto">{t.phases.length} fases</span>
                        </div>
                      </CardContent>

                      <CardFooter className="pt-0">
                        <Button
                          size="sm"
                          className="w-full gap-1.5"
                          onClick={() => setStartingTemplate(t)}
                          disabled={children.length === 0}
                        >
                          <Plus className="h-3.5 w-3.5" /> Iniciar Projeto
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Rocket className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhum projeto encontrado. Ajusta os filtros.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Start dialog */}
      <StartProjectDialog
        template={startingTemplate}
        children={children}
        onClose={() => setStartingTemplate(null)}
        onStart={handleStart}
        saving={createProject.isPending}
      />

      {/* Confirm delete dialog */}
      <Dialog open={!!confirmDeleteId} onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar projeto?</DialogTitle>
            <DialogDescription>
              Esta ação é permanente. O projeto e todas as suas fases serão eliminados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setConfirmDeleteId(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={deleteProject.isPending}
              onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
            >
              {deleteProject.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
