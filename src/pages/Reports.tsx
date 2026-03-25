import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, FileDown, BookOpen, FolderOpen, Image, Activity, TrendingUp, Award } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

const children = [
  { id: "1", name: "Bryan Malta", schoolYear: "2º ano" },
  { id: "2", name: "Noa Malta", schoolYear: "Pré-escolar" },
];

const periods = [
  { id: "week", label: "Esta semana" },
  { id: "month", label: "Este mês" },
  { id: "quarter", label: "Este trimestre" },
];

interface ReportData {
  totalActivities: number;
  totalEvidences: number;
  totalProjects: number;
  subjectBreakdown: { name: string; count: number; color: string; percentage: number }[];
  projects: { name: string; activities: number; status: string }[];
  weeklyTrend: number[];
  highlights: string[];
}

const reportByPeriod: Record<string, ReportData> = {
  week: {
    totalActivities: 5, totalEvidences: 8, totalProjects: 2,
    subjectBreakdown: [
      { name: "Português", count: 2, color: "bg-blue-500", percentage: 40 },
      { name: "Matemática", count: 1, color: "bg-amber-500", percentage: 20 },
      { name: "Estudo do Meio", count: 1, color: "bg-emerald-500", percentage: 20 },
      { name: "Expressões", count: 1, color: "bg-pink-500", percentage: 20 },
    ],
    projects: [
      { name: "Projeto Leitura", activities: 2, status: "Em curso" },
      { name: "Projeto Natureza", activities: 1, status: "Em curso" },
    ],
    weeklyTrend: [1, 0, 2, 1, 1],
    highlights: ["Escrita criativa com 8 frases completas", "Primeira pintura com aguarelas"],
  },
  month: {
    totalActivities: 18, totalEvidences: 27, totalProjects: 3,
    subjectBreakdown: [
      { name: "Português", count: 6, color: "bg-blue-500", percentage: 33 },
      { name: "Matemática", count: 5, color: "bg-amber-500", percentage: 28 },
      { name: "Estudo do Meio", count: 4, color: "bg-emerald-500", percentage: 22 },
      { name: "Expressões", count: 3, color: "bg-pink-500", percentage: 17 },
    ],
    projects: [
      { name: "Projeto Leitura", activities: 7, status: "Em curso" },
      { name: "Projeto Natureza", activities: 5, status: "Em curso" },
      { name: "Projeto Comunidade", activities: 2, status: "Planeado" },
    ],
    weeklyTrend: [3, 5, 4, 6],
    highlights: ["Leitura autónoma de 3 livros", "Resolução de problemas com trocos", "Caderno de campo da natureza iniciado"],
  },
  quarter: {
    totalActivities: 52, totalEvidences: 78, totalProjects: 4,
    subjectBreakdown: [
      { name: "Português", count: 18, color: "bg-blue-500", percentage: 35 },
      { name: "Matemática", count: 14, color: "bg-amber-500", percentage: 27 },
      { name: "Estudo do Meio", count: 11, color: "bg-emerald-500", percentage: 21 },
      { name: "Expressões", count: 9, color: "bg-pink-500", percentage: 17 },
    ],
    projects: [
      { name: "Projeto Leitura", activities: 18, status: "Concluído" },
      { name: "Projeto Natureza", activities: 14, status: "Em curso" },
      { name: "Projeto Comunidade", activities: 8, status: "Em curso" },
      { name: "Projeto Corpo Humano", activities: 4, status: "Planeado" },
    ],
    weeklyTrend: [3, 4, 5, 4, 3, 5, 6, 4, 5, 4, 3, 6],
    highlights: ["Projeto Leitura concluído com sucesso", "52 atividades registadas", "78 evidências no portfólio"],
  },
};

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }) };

const Reports = () => {
  const [selectedChild, setSelectedChild] = useState("1");
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const data = reportByPeriod[selectedPeriod];
  const maxTrend = Math.max(...data.weeklyTrend);

  const handleExport = () => {
    toast({ title: "A preparar exportação… 📄", description: "O PDF será gerado em breve." });
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-7 w-7 text-primary" /> Relatórios
            </h1>
            <p className="text-muted-foreground mt-1">Visão geral do percurso de aprendizagem.</p>
          </div>
          <Button variant="warmth" onClick={handleExport} className="gap-2">
            <FileDown className="h-4 w-4" /> Exportar PDF
          </Button>
        </div>

        {/* Selectors */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} className="flex flex-wrap gap-3">
          <Select value={selectedChild} onValueChange={setSelectedChild}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {children.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {periods.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </motion.div>

        {/* KPI cards */}
        <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Atividades", value: data.totalActivities, icon: Activity, color: "text-primary" },
            { label: "Evidências", value: data.totalEvidences, icon: Image, color: "text-accent" },
            { label: "Projetos", value: data.totalProjects, icon: FolderOpen, color: "text-secondary" },
            { label: "Áreas cobertas", value: data.subjectBreakdown.length, icon: BookOpen, color: "text-primary" },
          ].map((kpi) => (
            <Card key={kpi.label} className="border-primary/10">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subject breakdown */}
          <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
            <Card className="border-primary/10 h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-heading flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" /> Áreas Curriculares
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.subjectBreakdown.map((s) => (
                  <div key={s.name} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">{s.name}</span>
                      <span className="text-muted-foreground">{s.count} ativ. · {s.percentage}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <motion.div className={`h-full rounded-full ${s.color}`} initial={{ width: 0 }} animate={{ width: `${s.percentage}%` }} transition={{ duration: 0.8, delay: 0.3 }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Activity trend */}
          <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}>
            <Card className="border-primary/10 h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-heading flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Tendência de Atividade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-1.5 h-32">
                  {data.weeklyTrend.map((val, i) => (
                    <motion.div key={i} className="flex-1 rounded-t-md gradient-warmth min-w-[12px]" initial={{ height: 0 }} animate={{ height: `${maxTrend > 0 ? (val / maxTrend) * 100 : 0}%` }} transition={{ duration: 0.6, delay: 0.4 + i * 0.05 }} />
                  ))}
                </div>
                <div className="flex gap-1.5 mt-1.5">
                  {data.weeklyTrend.map((_, i) => (
                    <p key={i} className="flex-1 text-center text-[10px] text-muted-foreground">S{i + 1}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Projects */}
          <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp}>
            <Card className="border-primary/10 h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-heading flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-primary" /> Projetos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.projects.map((p) => (
                  <div key={p.name} className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.activities} atividades</p>
                    </div>
                    <Badge variant={p.status === "Concluído" ? "default" : "outline"} className="text-xs">{p.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Highlights */}
          <motion.div initial="hidden" animate="visible" custom={5} variants={fadeUp}>
            <Card className="border-primary/10 h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-heading flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" /> Destaques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg bg-primary/5 px-4 py-3">
                    <span className="text-lg mt-0.5">🌟</span>
                    <p className="text-sm text-foreground">{h}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </AppLayout>
  );
};

export default Reports;
