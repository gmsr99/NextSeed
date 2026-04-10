import { useState } from 'react';
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Monitor,
  PenTool,
  Film,
  Clapperboard,
  BrainCircuit,
  Blocks,
  Clock,
  Signal,
  Check,
  PlayCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useChildren } from '@/hooks/useChildren';
import { useLiteracyProgress } from '@/hooks/useLiteracyProgress';
import { ALL_DIGITAL_MODULES } from '@/lib/literacyContent';
import type { LiteracyStatus } from '@/lib/types';

const sections = [
  {
    key: "content",
    label: "Criação de Conteúdo",
    icon: PenTool,
    items: [
      { title: "Blog Pessoal", description: "Planear, escrever e publicar um artigo sobre um tema à escolha.", level: "Iniciante", duration: "45 min", moduleId: "blog-pessoal" },
      { title: "Podcast em Família", description: "Gravar um episódio curto: escolher tema, preparar guião e editar áudio.", level: "Intermédio", duration: "60 min", moduleId: "podcast-episodio" },
      { title: "Infografia Visual", description: "Transformar dados ou factos em gráficos visuais claros e apelativos.", level: "Intermédio", duration: "40 min", moduleId: "infografia" },
      { title: "Newsletter Semanal", description: "Criar uma newsletter familiar com notícias, reflexões e aprendizagens da semana.", level: "Iniciante", duration: "30 min", moduleId: "newsletter" },
    ],
  },
  {
    key: "storyboard",
    label: "Storyboard",
    icon: Clapperboard,
    items: [
      { title: "Storyboard de uma Aventura", description: "Desenhar cena a cena uma história original com personagens e diálogos.", level: "Iniciante", duration: "50 min", moduleId: "storyboard-aventura" },
      { title: "Adaptar um Conto", description: "Transformar um conto tradicional num storyboard visual moderno.", level: "Intermédio", duration: "60 min", moduleId: "storyboard-adaptar-conto" },
      { title: "Documentário Curto", description: "Planear visualmente um mini-documentário sobre o bairro ou a natureza local.", level: "Avançado", duration: "90 min", moduleId: "storyboard-documentario" },
    ],
  },
  {
    key: "video",
    label: "Vídeo",
    icon: Film,
    items: [
      { title: "Stop Motion Básico", description: "Criar uma animação frame a frame usando objetos do dia-a-dia.", level: "Iniciante", duration: "60 min", moduleId: "stop-motion" },
      { title: "Vlog de Aprendizagem", description: "Filmar e editar um vídeo curto sobre algo aprendido recentemente.", level: "Intermédio", duration: "45 min", moduleId: "vlog" },
      { title: "Efeitos e Transições", description: "Explorar ferramentas de edição para adicionar efeitos visuais e transições.", level: "Avançado", duration: "70 min", moduleId: "efeitos-especiais" },
    ],
  },
  {
    key: "ai",
    label: "IA Básica",
    icon: BrainCircuit,
    items: [
      { title: "O que é a IA?", description: "Compreender o conceito de inteligência artificial e onde a encontramos no quotidiano.", level: "Iniciante", duration: "25 min", moduleId: "o-que-e-ia" },
      { title: "Conversar com IA", description: "Aprender a fazer boas perguntas a assistentes de IA e avaliar as respostas.", level: "Iniciante", duration: "30 min", moduleId: "chat-com-ia" },
      { title: "IA e Criatividade", description: "Usar ferramentas de IA para gerar ideias, imagens ou textos criativos.", level: "Intermédio", duration: "40 min", moduleId: "ia-e-criatividade" },
      { title: "Ética e IA", description: "Refletir sobre os limites, enviesamentos e responsabilidades do uso de IA.", level: "Avançado", duration: "35 min", moduleId: "etica-da-ia" },
    ],
  },
  {
    key: "code",
    label: "Programação Lógica",
    icon: Blocks,
    items: [
      { title: "Sequências e Padrões", description: "Resolver desafios de lógica identificando e continuando padrões.", level: "Iniciante", duration: "20 min", moduleId: "sequencias" },
      { title: "Blocos de Código", description: "Construir programas visuais com blocos lógicos tipo Scratch.", level: "Iniciante", duration: "40 min", moduleId: "blocos-de-codigo" },
      { title: "Algoritmos do Dia-a-dia", description: "Transformar tarefas reais em instruções passo a passo, como um computador.", level: "Intermédio", duration: "30 min", moduleId: "algoritmos" },
      { title: "Jogo com Lógica", description: "Criar um jogo simples aplicando condições, ciclos e variáveis.", level: "Avançado", duration: "60 min", moduleId: "criar-jogo" },
    ],
  },
];

const levelColor: Record<string, string> = {
  Iniciante: "bg-accent/15 text-accent",
  Intermédio: "bg-primary/15 text-primary",
  Avançado: "bg-destructive/15 text-destructive",
};

const DigitalLiteracy = () => {
  const { children } = useChildren();
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const { getStatus, completionPct, setStatus } = useLiteracyProgress(selectedChildId || null, 'digital');
  const totalPct = completionPct(ALL_DIGITAL_MODULES);

  function StatusButton({ moduleId }: { moduleId: string }) {
    const status: LiteracyStatus = getStatus(moduleId);
    if (status === 'completed') {
      return (
        <Button size="sm" variant="ghost" className="w-full text-green-600 gap-1.5"
          disabled={!selectedChildId}
          onClick={() => setStatus.mutate({ moduleId, status: 'not_started' })}>
          <Check className="h-4 w-4" /> Concluído
        </Button>
      );
    }
    if (status === 'in_progress') {
      return (
        <Button size="sm" variant="outline" className="w-full gap-1.5"
          disabled={!selectedChildId}
          onClick={() => setStatus.mutate({ moduleId, status: 'completed' })}>
          Marcar concluído
        </Button>
      );
    }
    return (
      <Button size="sm" variant="outline" className="w-full gap-1.5"
        disabled={!selectedChildId}
        onClick={() => setStatus.mutate({ moduleId, status: 'in_progress' })}>
        <PlayCircle className="h-4 w-4" /> Começar
      </Button>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-foreground/10 flex items-center justify-center">
            <Monitor className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold">Literacia Digital</h1>
            <p className="text-muted-foreground">Criar, explorar e pensar no mundo digital com confiança.</p>
          </div>
        </div>

        {/* Child selector */}
        <div className="flex items-center gap-3">
          <Select value={selectedChildId} onValueChange={setSelectedChildId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecionar criança" />
            </SelectTrigger>
            <SelectContent>
              {children.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {selectedChildId && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-24 bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${totalPct}%` }} />
              </div>
              <span>{totalPct}% concluído</span>
            </div>
          )}
        </div>

        <Tabs defaultValue="content" className="space-y-5">
          <TabsList className="bg-muted/60 flex-wrap h-auto gap-1 p-1">
            {sections.map((s) => (
              <TabsTrigger key={s.key} value={s.key} className="gap-1.5 text-xs sm:text-sm">
                <s.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{s.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {sections.map((section) => (
            <TabsContent key={section.key} value={section.key}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {section.items.map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Card className="h-full flex flex-col hover:shadow-elevated transition-shadow group">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Badge className={`text-[10px] border-0 ${levelColor[item.level]}`}>
                            <Signal className="h-3 w-3 mr-1" />
                            {item.level}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.duration}
                          </span>
                        </div>
                        <h3 className="font-heading font-bold text-sm mt-2 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col justify-between gap-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                        <StatusButton moduleId={item.moduleId} />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default DigitalLiteracy;
