import { useState, useRef } from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { CalendarIcon, Upload, X, Save, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useChildren } from "@/hooks/useChildren";
import { useActivities } from "@/hooks/useActivities";
import { DISCIPLINE_LABELS } from "@/lib/planGenerator";

const DISCIPLINES = Object.entries(DISCIPLINE_LABELS).map(([id, name]) => ({ id, name }));

const Activities = () => {
  const { children } = useChildren();
  const { createActivity } = useActivities();

  const [childId, setChildId] = useState("");
  const [title, setTitle] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isFormValid = childId && title.trim() && date;

  const MAX_FILE_SIZE_MB = 10;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;

    const invalid = files.filter((f) => !f.type.startsWith("image/"));
    if (invalid.length) {
      toast({ title: "Ficheiro inválido", description: "Apenas imagens são permitidas.", variant: "destructive" });
      return;
    }

    const oversized = files.filter((f) => f.size > MAX_FILE_SIZE_BYTES);
    if (oversized.length) {
      toast({
        title: "Ficheiro demasiado grande",
        description: `Cada imagem deve ter no máximo ${MAX_FILE_SIZE_MB} MB. (${oversized.map((f) => f.name).join(", ")})`,
        variant: "destructive",
      });
      return;
    }

    setPhotoFiles((prev) => [...prev, ...files]);
    setPreviewUrls((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
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

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Diário de Atividades</h1>
          <p className="text-muted-foreground mt-1">Regista o que fizeram hoje — atividades, momentos e aprendizagens do dia-a-dia.</p>
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
      </motion.div>
    </AppLayout>
  );
};

export default Activities;
