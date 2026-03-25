import { useState, useRef } from "react";
import { pdf } from "@react-pdf/renderer";
import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import { CalendarIcon, Upload, X, Save, CheckCircle2, Trash2, ImageIcon, Loader2, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useChildren } from "@/hooks/useChildren";
import { useActivities } from "@/hooks/useActivities";
import { useAuth } from "@/contexts/AuthContext";
import { DISCIPLINE_LABELS, DISCIPLINE_COLORS } from "@/lib/planGenerator";

const DISCIPLINES = Object.entries(DISCIPLINE_LABELS).map(([id, name]) => ({ id, name }));

function getTrimesterRange(trimester: "1" | "2" | "3") {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const base = month >= 9 ? year : year - 1;
  if (trimester === "1") return { start: `${base}-09-01`,     end: `${base}-12-31`,   label: "1º Trimestre" };
  if (trimester === "2") return { start: `${base + 1}-01-01`, end: `${base + 1}-03-31`, label: "2º Trimestre" };
  return                         { start: `${base + 1}-04-01`, end: `${base + 1}-06-30`, label: "3º Trimestre" };
}

const Activities = () => {
  const { family } = useAuth();
  const { children } = useChildren();
  const { activities, isLoading: activitiesLoading, createActivity, deleteActivity } = useActivities();

  const [childId, setChildId] = useState("");
  const [title, setTitle] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Report state
  const [reportChildId, setReportChildId] = useState("");
  const [reportTrimester, setReportTrimester] = useState<"1" | "2" | "3">("1");
  const [generatingReport, setGeneratingReport] = useState(false);

  const isFormValid = childId && title.trim() && date;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setPhotoFiles((prev) => [...prev, ...files]);
    setPreviewUrls((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
    e.target.value = "";
  };

  const removePhoto = (idx: number) => {
    URL.revokeObjectURL(previewUrls[idx]);
    setPhotoFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!isFormValid) return;
    try {
      await createActivity.mutateAsync({
        child_id: childId,
        title: title.trim(),
        discipline: discipline || undefined,
        description: description.trim() || undefined,
        activity_date: format(date, "yyyy-MM-dd"),
        photoFiles,
      });
      setSaved(true);
      toast({ title: "Atividade guardada no portfólio! 🌱" });
      // Reset form
      setChildId("");
      setTitle("");
      setDiscipline("");
      setDescription("");
      setDate(new Date());
      previewUrls.forEach((u) => URL.revokeObjectURL(u));
      setPhotoFiles([]);
      setPreviewUrls([]);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      toast({
        title: "Erro ao guardar",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteActivity.mutateAsync(id);
      toast({ title: "Atividade removida." });
    } catch (e) {
      toast({
        title: "Erro ao remover",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    }
  };

  const handleGenerateReport = async () => {
    if (!reportChildId) return;
    setGeneratingReport(true);
    try {
      const { start, end, label } = getTrimesterRange(reportTrimester);
      const child = children.find((c) => c.id === reportChildId);
      if (!child) throw new Error("Criança não encontrada");

      const filtered = activities.filter(
        (a) => a.child_id === reportChildId && a.activity_date >= start && a.activity_date <= end,
      );

      const { default: TrimesterReportPDF } = await import("@/components/pdf/TrimesterReportPDF");
      const blob = await pdf(
        <TrimesterReportPDF
          child={child}
          familyName={family?.name ?? "Família"}
          activities={filtered}
          trimesterLabel={label}
          startDate={start}
          endDate={end}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nexseed-relatorio-${child.name.split(" ")[0].toLowerCase()}-${reportTrimester}trim-${start.substring(0, 4)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast({
        title: "Erro ao gerar relatório",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Registar Atividade</h1>
          <p className="text-muted-foreground mt-1">Regista o que foi feito e guarda no portfólio com fotos.</p>
        </div>

        {/* Form */}
        <Card className="border-border/60 shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-heading">Nova Atividade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Criança + Data */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Criança</Label>
                <Select value={childId} onValueChange={setChildId}>
                  <SelectTrigger><SelectValue placeholder="Selecionar criança" /></SelectTrigger>
                  <SelectContent>
                    {children.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name} — {c.school_year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(date, "PPP", { locale: pt })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Título + Disciplina */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Título da Atividade</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Diário sobre dinossauros..."
                />
              </div>
              <div className="space-y-2">
                <Label>Área Curricular</Label>
                <Select value={discipline} onValueChange={setDiscipline}>
                  <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                  <SelectContent>
                    {DISCIPLINES.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Descreve brevemente o que foi feito…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[90px] resize-none"
              />
            </div>

            {/* Fotos */}
            <div className="space-y-3">
              <Label>Fotos</Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-primary/20 rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors"
              >
                <Upload className="h-7 w-7 mx-auto text-primary/40 mb-2" />
                <p className="text-sm text-muted-foreground">Clica para adicionar fotos</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <AnimatePresence>
                {previewUrls.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-2">
                    {previewUrls.map((url, i) => (
                      <motion.div
                        key={url}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="relative group"
                      >
                        <img src={url} className="h-20 w-20 rounded-lg object-cover border border-border" />
                        <button
                          onClick={() => removePhoto(i)}
                          className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Botão */}
            <div className="pt-1">
              <Button
                onClick={handleSave}
                disabled={!isFormValid || createActivity.isPending || saved}
                size="lg"
                className="w-full sm:w-auto gap-2"
              >
                {createActivity.isPending ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> A guardar...</>
                ) : saved ? (
                  <><CheckCircle2 className="h-5 w-5" /> Guardado!</>
                ) : (
                  <><Save className="h-5 w-5" /> Guardar no Portfólio</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* List of past activities */}
        {!activitiesLoading && activities.length > 0 && (
          <Card className="border-border/60 shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-lg">Portfólio</CardTitle>
              <CardDescription>{activities.length} atividade{activities.length !== 1 ? "s" : ""} registada{activities.length !== 1 ? "s" : ""}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {activities.map((act) => {
                const child = children.find((c) => c.id === act.child_id);
                const color = act.discipline ? DISCIPLINE_COLORS[act.discipline] ?? "#E5E7EB" : "#E5E7EB";
                const label = act.discipline ? DISCIPLINE_LABELS[act.discipline] ?? act.discipline : null;
                const d = parseISO(act.activity_date + "T00:00:00");
                return (
                  <div
                    key={act.id}
                    className="flex gap-3 rounded-xl p-3 hover:bg-muted/50 transition-colors group"
                    style={{ borderLeft: `3px solid ${color}` }}
                  >
                    {/* Photos thumbnail */}
                    {act.photos.length > 0 ? (
                      <img
                        src={act.photos[0]}
                        className="h-14 w-14 rounded-lg object-cover shrink-0 border border-border"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{act.title}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {format(d, "d 'de' MMMM", { locale: pt })}
                        </span>
                        {child && (
                          <span className="text-xs text-muted-foreground">· {child.name.split(" ")[0]}</span>
                        )}
                        {label && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0" style={{ backgroundColor: color + "33" }}>
                            {label}
                          </Badge>
                        )}
                        {act.photos.length > 1 && (
                          <span className="text-xs text-muted-foreground">· {act.photos.length} fotos</span>
                        )}
                      </div>
                      {act.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{act.description}</p>
                      )}
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(act.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1 shrink-0"
                      title="Remover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {activitiesLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> A carregar portfólio...
          </div>
        )}

        {/* Trimester Report */}
        <Card className="border-border/60 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Relatório do Trimestre
            </CardTitle>
            <CardDescription>
              Gera um PDF oficial com todas as atividades do período — para entregar na escola.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Criança</Label>
                <Select value={reportChildId} onValueChange={setReportChildId}>
                  <SelectTrigger><SelectValue placeholder="Selecionar criança" /></SelectTrigger>
                  <SelectContent>
                    {children.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Período</Label>
                <Select value={reportTrimester} onValueChange={(v) => setReportTrimester(v as "1" | "2" | "3")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1º Trimestre (Set – Dez)</SelectItem>
                    <SelectItem value="2">2º Trimestre (Jan – Mar)</SelectItem>
                    <SelectItem value="3">3º Trimestre (Abr – Jun)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {reportChildId && (() => {
              const { start, end } = getTrimesterRange(reportTrimester);
              const count = activities.filter(
                (a) => a.child_id === reportChildId && a.activity_date >= start && a.activity_date <= end
              ).length;
              return (
                <p className="text-sm text-muted-foreground">
                  {count} atividade{count !== 1 ? "s" : ""} registada{count !== 1 ? "s" : ""} neste período.
                </p>
              );
            })()}

            <Button
              onClick={handleGenerateReport}
              disabled={!reportChildId || generatingReport}
              className="gap-2"
            >
              {generatingReport ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> A gerar PDF...</>
              ) : (
                <><FileText className="h-4 w-4" /> Gerar e Descarregar PDF</>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </AppLayout>
  );
};

export default Activities;
