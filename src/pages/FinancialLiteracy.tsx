import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Landmark,
  Target,
  BookOpen,
  Zap,
  TrendingUp,
  PiggyBank,
  ShoppingCart,
  HandCoins,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  Lock,
  CircleDollarSign,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

const missions = [
  {
    id: 1, title: "Poupar com Propósito", description: "Definir um objetivo de poupança e criar um plano para o alcançar em 4 semanas.",
    icon: PiggyBank, progress: 65, status: "active", reward: "Certificado de Poupança",
  },
  {
    id: 2, title: "Orçamento Familiar", description: "Simular a gestão de um orçamento mensal, tomando decisões sobre despesas e prioridades.",
    icon: TrendingUp, progress: 30, status: "active", reward: "Gestor Financeiro Jr.",
  },
  {
    id: 3, title: "Necessidade vs. Desejo", description: "Classificar itens do dia-a-dia e aprender a distinguir o essencial do supérfluo.",
    icon: ShoppingCart, progress: 100, status: "completed", reward: "Consumidor Consciente",
  },
  {
    id: 4, title: "Empreender com Valor", description: "Criar um pequeno projeto de venda ou troca, calculando custos e lucro.",
    icon: HandCoins, progress: 0, status: "locked", reward: "Empreendedor Iniciante",
  },
];

const stories = [
  {
    id: 1, title: "A Viagem da Moeda", summary: "Acompanha o percurso de uma moeda desde a sua criação até chegar à tua mão.",
    theme: "Economia", duration: "8 min",
  },
  {
    id: 2, title: "O Mercado da Aldeia", summary: "Como funcionavam as trocas antes do dinheiro existir? Uma história sobre valor e confiança.",
    theme: "História", duration: "6 min",
  },
  {
    id: 3, title: "A Fábrica de Escolhas", summary: "Cada decisão financeira tem consequências. Explora cenários e descobre o impacto das tuas escolhas.",
    theme: "Decisão", duration: "10 min",
  },
  {
    id: 4, title: "Investir no Futuro", summary: "O que significa fazer o dinheiro crescer? Conceitos simples sobre juros e investimento.",
    theme: "Investimento", duration: "7 min",
  },
];

const challenges = [
  {
    id: 1, title: "7 Dias sem Gastos Extra", description: "Regista todas as despesas durante uma semana e identifica o que podes eliminar.",
    difficulty: "Iniciante", duration: "7 dias", icon: Target,
  },
  {
    id: 2, title: "Caça ao Melhor Preço", description: "Compara preços de 5 produtos em diferentes lojas e calcula a poupança total.",
    difficulty: "Intermédio", duration: "3 dias", icon: CircleDollarSign,
  },
  {
    id: 3, title: "Plano de Negócio em Família", description: "Desenvolver uma ideia de negócio sustentável em conjunto, com plano de custos.",
    difficulty: "Avançado", duration: "2 semanas", icon: Lightbulb,
  },
];

const statusIcon = (status: string) => {
  if (status === "completed") return <CheckCircle2 className="h-4 w-4 text-accent" />;
  if (status === "locked") return <Lock className="h-4 w-4 text-muted-foreground/40" />;
  return null;
};

const FinancialLiteracy = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl gradient-forest flex items-center justify-center">
            <Landmark className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold">Literacia Financeira</h1>
            <p className="text-muted-foreground">Missões, histórias e desafios para construir competências financeiras.</p>
          </div>
        </div>

        <Tabs defaultValue="missions" className="space-y-5">
          <TabsList className="bg-muted/60">
            <TabsTrigger value="missions" className="gap-1.5"><Target className="h-4 w-4" />Missões</TabsTrigger>
            <TabsTrigger value="stories" className="gap-1.5"><BookOpen className="h-4 w-4" />Histórias</TabsTrigger>
            <TabsTrigger value="challenges" className="gap-1.5"><Zap className="h-4 w-4" />Desafios</TabsTrigger>
          </TabsList>

          {/* Missions */}
          <TabsContent value="missions" className="space-y-4">
            {missions.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                <Card className={`transition-shadow hover:shadow-elevated ${m.status === "locked" ? "opacity-50" : ""}`}>
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className={`h-12 w-12 rounded-xl shrink-0 flex items-center justify-center ${m.status === "completed" ? "bg-accent/15" : "bg-primary/10"}`}>
                      <m.icon className={`h-6 w-6 ${m.status === "completed" ? "text-accent" : "text-primary"}`} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading font-bold text-sm">{m.title}</h3>
                        {statusIcon(m.status)}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{m.description}</p>
                      {m.status !== "locked" && (
                        <div className="flex items-center gap-3">
                          <Progress value={m.progress} className="h-1.5 flex-1" />
                          <span className="text-xs font-semibold text-muted-foreground">{m.progress}%</span>
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 text-right space-y-1">
                      <Badge variant="outline" className="text-[10px]">{m.reward}</Badge>
                      {m.status === "active" && (
                        <Button size="sm" variant="ghost" className="text-xs gap-1 mt-1"
                          onClick={() => toast({ title: "Missão retomada ✨", description: `Continua "${m.title}".` })}>
                          Continuar <ArrowRight className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Stories */}
          <TabsContent value="stories">
            <div className="grid gap-4 sm:grid-cols-2">
              {stories.map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card className="h-full hover:shadow-elevated transition-shadow group cursor-pointer"
                    onClick={() => toast({ title: `A abrir "${s.title}"…`, description: "Boa leitura!" })}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-[10px]">{s.theme}</Badge>
                        <span className="text-[10px] text-muted-foreground">{s.duration}</span>
                      </div>
                      <h3 className="font-heading font-bold mt-2 group-hover:text-primary transition-colors">{s.title}</h3>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">{s.summary}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Challenges */}
          <TabsContent value="challenges">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {challenges.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card className="h-full flex flex-col hover:shadow-elevated transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <c.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-right space-y-1">
                          <Badge variant="outline" className="text-[10px]">{c.difficulty}</Badge>
                          <p className="text-[10px] text-muted-foreground">{c.duration}</p>
                        </div>
                      </div>
                      <h3 className="font-heading font-bold text-sm mt-2">{c.title}</h3>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-sm text-muted-foreground leading-relaxed">{c.description}</p>
                    </CardContent>
                    <div className="p-5 pt-0">
                      <Button size="sm" variant="forest" className="w-full"
                        onClick={() => toast({ title: "Desafio aceite! 💪", description: `"${c.title}" adicionado aos teus desafios.` })}>
                        Aceitar Desafio
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default FinancialLiteracy;
