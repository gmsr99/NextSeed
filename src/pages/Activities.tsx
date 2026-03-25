import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { CalendarIcon, Upload, X, FileText, Image, Video, Save, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";

const children = [
  { id: "1", name: "Bryan Malta", schoolYear: "2º ano" },
  { id: "2", name: "Noa Malta", schoolYear: "Pré-escolar" },
];

const subjects = [
  { id: "portugues", name: "Português" },
  { id: "matematica", name: "Matemática" },
  { id: "estudo-meio", name: "Estudo do Meio" },
  { id: "expressoes", name: "Expressões" },
  { id: "cidadania", name: "Cidadania" },
];

const contentBySubject: Record<string, string[]> = {
  portugues: ["Leitura e compreensão de textos", "Escrita criativa", "Gramática — classes de palavras", "Oralidade — apresentação oral"],
  matematica: ["Números e operações", "Geometria e medida", "Resolução de problemas", "Organização de dados"],
  "estudo-meio": ["Seres vivos e ambiente", "Corpo humano", "À descoberta dos materiais", "O passado do meio local"],
  expressoes: ["Expressão plástica", "Expressão musical", "Expressão dramática", "Educação física"],
  cidadania: ["Direitos e deveres", "Interculturalidade", "Educação ambiental", "Saúde e bem-estar"],
};

interface Evidence {
  id: string;
  name: string;
  type: "image" | "video" | "text";
  size: string;
}

const Activities = () => {
  const [selectedChild, setSelectedChild] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedContent, setSelectedContent] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [saved, setSaved] = useState(false);

  const handleFileUpload = () => {
    // Simulated file upload
    const mockFiles: Evidence[] = [
      { id: crypto.randomUUID(), name: "desenho_atividade.png", type: "image", size: "2.4 MB" },
    ];
    setEvidences((prev) => [...prev, ...mockFiles]);
  };

  const removeEvidence = (id: string) => {
    setEvidences((prev) => prev.filter((e) => e.id !== id));
  };

  const isFormValid = selectedChild && selectedSubject && selectedContent && description.trim() && date;

  const handleSave = () => {
    if (!isFormValid) return;
    setSaved(true);
    toast({ title: "Atividade guardada no portfólio! 🌱", description: "Podes consultá-la a qualquer momento." });
    setTimeout(() => {
      setSaved(false);
      setSelectedChild("");
      setSelectedSubject("");
      setSelectedContent("");
      setDescription("");
      setDate(new Date());
      setEvidences([]);
    }, 2000);
  };

  const evidenceIcon = (type: Evidence["type"]) => {
    if (type === "image") return <Image className="h-4 w-4 text-primary" />;
    if (type === "video") return <Video className="h-4 w-4 text-accent" />;
    return <FileText className="h-4 w-4 text-secondary" />;
  };

  const availableContent = selectedSubject ? contentBySubject[selectedSubject] ?? [] : [];

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" /> Registar Atividade
          </h1>
          <p className="text-muted-foreground mt-1">Regista rapidamente o que foi feito e guarda no portfólio.</p>
        </div>

        <Card className="border-primary/10 shadow-soft">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-heading">Nova Atividade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Row 1: Criança + Data */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Criança</Label>
                <Select value={selectedChild} onValueChange={setSelectedChild}>
                  <SelectTrigger><SelectValue placeholder="Selecionar criança" /></SelectTrigger>
                  <SelectContent>
                    {children.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name} — {c.schoolYear}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: pt }) : "Escolher data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Row 2: Área + Conteúdo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Área Curricular</Label>
                <Select value={selectedSubject} onValueChange={(v) => { setSelectedSubject(v); setSelectedContent(""); }}>
                  <SelectTrigger><SelectValue placeholder="Selecionar área" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Conteúdo Associado</Label>
                <Select value={selectedContent} onValueChange={setSelectedContent} disabled={!selectedSubject}>
                  <SelectTrigger><SelectValue placeholder={selectedSubject ? "Selecionar conteúdo" : "Escolhe a área primeiro"} /></SelectTrigger>
                  <SelectContent>
                    {availableContent.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label>Descrição da Atividade</Label>
              <Textarea
                placeholder="Descreve brevemente o que foi feito…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>

            {/* Evidências */}
            <div className="space-y-3">
              <Label>Evidências</Label>
              <div
                onClick={handleFileUpload}
                className="border-2 border-dashed border-primary/20 rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors"
              >
                <Upload className="h-8 w-8 mx-auto text-primary/40 mb-2" />
                <p className="text-sm text-muted-foreground">Clica para adicionar imagem, vídeo ou documento</p>
              </div>

              <AnimatePresence>
                {evidences.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-2 pt-1">
                    {evidences.map((ev) => (
                      <motion.div key={ev.id} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} layout>
                        <Badge variant="secondary" className="gap-1.5 pr-1 py-1">
                          {evidenceIcon(ev.type)}
                          <span className="text-xs max-w-[140px] truncate">{ev.name}</span>
                          <button onClick={() => removeEvidence(ev.id)} className="ml-1 rounded-full hover:bg-muted p-0.5">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Guardar */}
            <div className="pt-2">
              <Button onClick={handleSave} disabled={!isFormValid || saved} variant="warmth" size="lg" className="w-full sm:w-auto">
                {saved ? (
                  <><CheckCircle2 className="h-5 w-5 mr-2" /> Guardado!</>
                ) : (
                  <><Save className="h-5 w-5 mr-2" /> Guardar no Portfólio</>
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
