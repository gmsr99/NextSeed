import { useState } from "react";
import { Plus, MapPin, Clock, Car, Pencil, Trash2, Loader2, X } from "lucide-react";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useChildren } from "@/hooks/useChildren";
import { useExtracurricular } from "@/hooks/useExtracurricular";
import { useAuth } from "@/contexts/AuthContext";
import type { ExtracurricularActivity } from "@/lib/types";
import { EXTRACURRICULAR_COLORS, EXTRACURRICULAR_TYPES, DAY_LABELS_FULL } from "@/lib/constants";

// ─── Formulário vazio ─────────────────────────────────────────────────────────

const emptyForm = {
  child_id: "all",
  name: "",
  type: "",
  location: "",
  day_of_week: "",
  start_time: "",
  end_time: "",
  travel_time_minutes: "0",
  notes: "",
};

// ─── Componente principal ─────────────────────────────────────────────────────

export default function Extracurricular() {
  const { children } = useChildren();
  const { family } = useAuth();
  const { activities, isLoading, create, update, remove } = useExtracurricular();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const resetForm = () => { setForm(emptyForm); setEditingId(null); };

  const openCreate = () => { resetForm(); setDialogOpen(true); };

  const openEdit = (act: ExtracurricularActivity) => {
    setEditingId(act.id);
    setForm({
      child_id: act.child_id ?? "all",
      name: act.name,
      type: act.type ?? "",
      location: act.location ?? "",
      day_of_week: act.day_of_week?.toString() ?? "",
      start_time: act.start_time ?? "",
      end_time: act.end_time ?? "",
      travel_time_minutes: act.travel_time_minutes?.toString() ?? "0",
      notes: act.notes ?? "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!family || !form.name) return;

    const payload = {
      family_id: family.id,
      child_id: form.child_id === "all" ? null : form.child_id || null,
      name: form.name,
      type: form.type || null,
      location: form.location || null,
      day_of_week: form.day_of_week ? parseInt(form.day_of_week) : null,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
      travel_time_minutes: parseInt(form.travel_time_minutes) || 0,
      notes: form.notes || null,
    };

    if (editingId) {
      await update.mutateAsync({ id: editingId, ...payload });
    } else {
      await create.mutateAsync(payload);
    }
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await remove.mutateAsync(id);
    setConfirmDeleteId(null);
  };

  const getChildName = (childId: string | null) => {
    if (!childId) return "Todos";
    return children.find((c) => c.id === childId)?.name ?? "—";
  };

  const getDayLabel = (day: number | null) =>
    day ? DAY_LABELS_FULL[day - 1] : "—";

  const getTravelLabel = (min: number) => {
    if (!min) return null;
    if (min < 60) return `${min} min deslocação`;
    return `${Math.floor(min / 60)}h${min % 60 ? `${min % 60}min` : ""} deslocação`;
  };

  // Agrupar por dia da semana
  const byDay: Record<number, ExtracurricularActivity[]> = {};
  activities.forEach((a) => {
    const day = a.day_of_week ?? 8; // 8 = sem dia definido
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push(a);
  });

  const pending = create.isPending || update.isPending;

  return (
    <AppLayout>
      <div className="space-y-6">

        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Atividades Extracurriculares</h1>
            <p className="text-muted-foreground mt-1">
              Regista desportos, música, teatro e outras atividades fora do horário académico.
            </p>
          </div>
          <Button className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Nova Atividade
          </Button>
        </div>

        {/* Lista de atividades */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : activities.length === 0 ? (
          <Card className="border-border/60 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <p className="font-semibold text-foreground">Ainda não há atividades</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Adiciona desportos, música, natação e outras atividades extracurriculares.
                Inclui o tempo de deslocação para planear melhor o dia.
              </p>
              <Button variant="outline" className="mt-2 gap-2" onClick={openCreate}>
                <Plus className="h-4 w-4" /> Adicionar primeira atividade
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((day) => {
              const dayActs = byDay[day];
              if (!dayActs?.length) return null;
              const dayLabel = day <= 7 ? DAY_LABELS_FULL[day - 1] : "Sem dia definido";

              return (
                <div key={day}>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {dayLabel}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dayActs.map((act, i) => {
                      const color = EXTRACURRICULAR_COLORS[act.type ?? "Outro"] ?? "#9CA3AF";
                      return (
                        <motion.div
                          key={act.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <Card className="border-border/60 hover:shadow-elevated transition-all duration-200 hover:-translate-y-0.5 overflow-hidden">
                            <div className="h-1.5" style={{ backgroundColor: color }} />
                            <CardContent className="p-4 space-y-3">

                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-foreground truncate">{act.name}</h3>
                                  {act.type && (
                                    <Badge
                                      variant="secondary"
                                      className="mt-1 text-xs"
                                      style={{ backgroundColor: color + "33" }}
                                    >
                                      {act.type}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex gap-1 shrink-0">
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(act)}>
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                    onClick={() => setConfirmDeleteId(act.id)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>

                              <div className="space-y-1 text-sm text-muted-foreground">
                                {act.start_time && (
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5 shrink-0" />
                                    <span>
                                      {act.start_time}{act.end_time ? ` — ${act.end_time}` : ""}
                                    </span>
                                  </div>
                                )}
                                {act.location && (
                                  <div className="flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate">{act.location}</span>
                                  </div>
                                )}
                                {act.travel_time_minutes > 0 && (
                                  <div className="flex items-center gap-1.5">
                                    <Car className="h-3.5 w-3.5 shrink-0" />
                                    <span>{getTravelLabel(act.travel_time_minutes)}</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center justify-between pt-1">
                                <span className="text-xs text-muted-foreground">
                                  {getChildName(act.child_id)}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Dialog de criar/editar ─── */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              {editingId ? "Editar Atividade" : "Nova Atividade Extracurricular"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">

            <div className="space-y-2">
              <Label htmlFor="name">Nome da atividade *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Futsal, Piano, Natação..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>
                    {EXTRACURRICULAR_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Criança</Label>
                <Select value={form.child_id} onValueChange={(v) => setForm({ ...form, child_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {children.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dia da semana</Label>
                <Select value={form.day_of_week} onValueChange={(v) => setForm({ ...form, day_of_week: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>
                    {DAY_LABELS_FULL.map((d, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Horário</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="time"
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    className="flex-1"
                  />
                  <span className="text-muted-foreground text-sm">–</span>
                  <Input
                    type="time"
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Local</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Ex: Pavilhão Municipal..."
                />
              </div>

              <div className="space-y-2">
                <Label>Tempo de deslocação</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    value={form.travel_time_minutes}
                    onChange={(e) => setForm({ ...form, travel_time_minutes: e.target.value })}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">minutos</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tempo de ida (unidirecional)
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Material necessário, professor, equipamento..."
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => { setDialogOpen(false); resetForm(); }}>
                Cancelar
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editingId ? "Guardar" : "Adicionar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Dialog de confirmação de eliminação ─── */}
      <Dialog open={!!confirmDeleteId} onOpenChange={() => setConfirmDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remover atividade?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mt-2">
            Esta atividade será removida da lista. Podes sempre adicioná-la novamente.
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={() => setConfirmDeleteId(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
              disabled={remove.isPending}
            >
              {remove.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Remover
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </AppLayout>
  );
}
