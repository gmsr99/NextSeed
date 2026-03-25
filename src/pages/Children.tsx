import { useState } from "react";
import { format, differenceInYears, parseISO } from "date-fns";
import { CalendarIcon, Plus, ArrowRight, Palette, BookOpen, Music, FlaskConical, Gamepad2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import TagInput from "@/components/TagInput";
import { cn } from "@/lib/utils";
import { useChildren } from "@/hooks/useChildren";
import { useAuth } from "@/contexts/AuthContext";

const interestIcons: Record<string, React.ReactNode> = {
  Arte: <Palette className="h-3 w-3" />,
  Leitura: <BookOpen className="h-3 w-3" />,
  Música: <Music className="h-3 w-3" />,
  Ciências: <FlaskConical className="h-3 w-3" />,
  Jogos: <Gamepad2 className="h-3 w-3" />,
};

const avatarColors = [
  "bg-primary/80",
  "bg-accent/80",
  "bg-nexseed-moss/80",
  "bg-nexseed-orange-light/80",
];

const emptyForm = {
  name: "",
  birthDate: undefined as Date | undefined,
  schoolYear: "",
  school: "",
  curriculum: "",
  manuals: "",
  interests: [] as string[],
  learningPreferences: "",
  learningPace: "",
};

export default function Children() {
  const { children, isLoading, createChild } = useChildren();
  const { family } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const resetForm = () => setForm(emptyForm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.birthDate || !form.schoolYear || !family) return;
    await createChild.mutateAsync({
      family_id: family.id,
      name: form.name,
      birth_date: format(form.birthDate, "yyyy-MM-dd"),
      school_year: form.schoolYear,
      school: form.school || null,
      curriculum: form.curriculum || null,
      manuals: form.manuals || null,
      interests: form.interests,
      learning_preferences: form.learningPreferences || null,
      learning_pace: form.learningPace || null,
    });
    resetForm();
    setDialogOpen(false);
  };

  const getAge = (birthDate: string) => differenceInYears(new Date(), parseISO(birthDate));
  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Crianças</h1>
            <p className="text-muted-foreground mt-1">Gerir perfis e acompanhar cada criança.</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Adicionar Criança</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-heading text-xl">Nova Criança</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome completo" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data de nascimento *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.birthDate && "text-muted-foreground")}>
                          <CalendarIcon className="h-4 w-4" />
                          {form.birthDate ? format(form.birthDate, "dd/MM/yyyy") : "Selecionar"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={form.birthDate} onSelect={(d) => setForm({ ...form, birthDate: d })} disabled={(date) => date > new Date()} initialFocus className="p-3 pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Ano escolar *</Label>
                    <Select value={form.schoolYear} onValueChange={(v) => setForm({ ...form, schoolYear: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                      <SelectContent>
                        {["Pré-escolar", "1º ano", "2º ano", "3º ano", "4º ano", "5º ano", "6º ano"].map((y) => (
                          <SelectItem key={y} value={y}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Escola / Agrupamento</Label>
                  <Input value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} placeholder="Nome da escola ou agrupamento" />
                </div>
                <div className="space-y-2">
                  <Label>Currículo</Label>
                  <Select value={form.curriculum} onValueChange={(v) => setForm({ ...form, curriculum: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecionar currículo" /></SelectTrigger>
                    <SelectContent>
                      {["Nacional", "Nacional adaptado", "Internacional", "Waldorf", "Montessori", "Personalizado"].map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Manuais</Label>
                  <Textarea value={form.manuals} onChange={(e) => setForm({ ...form, manuals: e.target.value })} placeholder="Manuais utilizados (opcional)" rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Interesses</Label>
                  <TagInput value={form.interests} onChange={(tags) => setForm({ ...form, interests: tags })} placeholder="Escreve um interesse e pressiona Enter" />
                </div>
                <div className="space-y-2">
                  <Label>Preferências de aprendizagem</Label>
                  <Select value={form.learningPreferences} onValueChange={(v) => setForm({ ...form, learningPreferences: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                    <SelectContent>
                      {["Visual", "Auditivo", "Cinestésico", "Visual e prático", "Misto"].map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ritmo de aprendizagem</Label>
                  <Select value={form.learningPace} onValueChange={(v) => setForm({ ...form, learningPace: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                    <SelectContent>
                      {["Rápido", "Moderado", "Calmo", "Variável"].map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="ghost" onClick={() => { resetForm(); setDialogOpen(false); }}>Cancelar</Button>
                  <Button type="submit" disabled={createChild.isPending}>
                    {createChild.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar Perfil"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {children.map((child, i) => (
              <motion.div key={child.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.4 }}>
                <Card className="shadow-card hover:shadow-elevated transition-all duration-300 border-border/60 hover:-translate-y-0.5 overflow-hidden">
                  <CardContent className="p-0">
                    <div className={`h-2 ${avatarColors[i % avatarColors.length]}`} />
                    <div className="p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-full ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-sm font-bold text-white shrink-0`}>
                          {getInitials(child.name)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-heading font-bold text-foreground truncate">{child.name}</h3>
                          <p className="text-sm text-muted-foreground">{getAge(child.birth_date)} anos · {child.school_year}</p>
                        </div>
                      </div>
                      {child.interests.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {child.interests.map((interest) => (
                            <Badge key={interest} variant="secondary" className="gap-1 text-xs font-medium">
                              {interestIcons[interest] || null}{interest}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        Entrar no Perfil <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
