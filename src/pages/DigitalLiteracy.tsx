import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Monitor,
  PenTool,
  Film,
  Clapperboard,
  BrainCircuit,
  Blocks,
  ArrowRight,
  Clock,
  Signal,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

const sections = [
  {
    key: "content",
    label: "Criação de Conteúdo",
    icon: PenTool,
    items: [
      { title: "Blog Pessoal", description: "Planear, escrever e publicar um artigo sobre um tema à escolha.", level: "Iniciante", duration: "45 min" },
      { title: "Podcast em Família", description: "Gravar um episódio curto: escolher tema, preparar guião e editar áudio.", level: "Intermédio", duration: "60 min" },
      { title: "Infografia Visual", description: "Transformar dados ou factos em gráficos visuais claros e apelativos.", level: "Intermédio", duration: "40 min" },
      { title: "Newsletter Semanal", description: "Criar uma newsletter familiar com notícias, reflexões e aprendizagens da semana.", level: "Iniciante", duration: "30 min" },
    ],
  },
  {
    key: "storyboard",
    label: "Storyboard",
    icon: Clapperboard,
    items: [
      { title: "Storyboard de uma Aventura", description: "Desenhar cena a cena uma história original com personagens e diálogos.", level: "Iniciante", duration: "50 min" },
      { title: "Adaptar um Conto", description: "Transformar um conto tradicional num storyboard visual moderno.", level: "Intermédio", duration: "60 min" },
      { title: "Documentário Curto", description: "Planear visualmente um mini-documentário sobre o bairro ou a natureza local.", level: "Avançado", duration: "90 min" },
    ],
  },
  {
    key: "video",
    label: "Vídeo",
    icon: Film,
    items: [
      { title: "Stop Motion Básico", description: "Criar uma animação frame a frame usando objetos do dia-a-dia.", level: "Iniciante", duration: "60 min" },
      { title: "Vlog de Aprendizagem", description: "Filmar e editar um vídeo curto sobre algo aprendido recentemente.", level: "Intermédio", duration: "45 min" },
      { title: "Efeitos e Transições", description: "Explorar ferramentas de edição para adicionar efeitos visuais e transições.", level: "Avançado", duration: "70 min" },
    ],
  },
  {
    key: "ai",
    label: "IA Básica",
    icon: BrainCircuit,
    items: [
      { title: "O que é a IA?", description: "Compreender o conceito de inteligência artificial e onde a encontramos no quotidiano.", level: "Iniciante", duration: "25 min" },
      { title: "Conversar com IA", description: "Aprender a fazer boas perguntas a assistentes de IA e avaliar as respostas.", level: "Iniciante", duration: "30 min" },
      { title: "IA e Criatividade", description: "Usar ferramentas de IA para gerar ideias, imagens ou textos criativos.", level: "Intermédio", duration: "40 min" },
      { title: "Ética e IA", description: "Refletir sobre os limites, enviesamentos e responsabilidades do uso de IA.", level: "Avançado", duration: "35 min" },
    ],
  },
  {
    key: "code",
    label: "Programação Lógica",
    icon: Blocks,
    items: [
      { title: "Sequências e Padrões", description: "Resolver desafios de lógica identificando e continuando padrões.", level: "Iniciante", duration: "20 min" },
      { title: "Blocos de Código", description: "Construir programas visuais com blocos lógicos tipo Scratch.", level: "Iniciante", duration: "40 min" },
      { title: "Algoritmos do Dia-a-dia", description: "Transformar tarefas reais em instruções passo a passo, como um computador.", level: "Intermédio", duration: "30 min" },
      { title: "Jogo com Lógica", description: "Criar um jogo simples aplicando condições, ciclos e variáveis.", level: "Avançado", duration: "60 min" },
    ],
  },
];

const levelColor: Record<string, string> = {
  Iniciante: "bg-accent/15 text-accent",
  Intermédio: "bg-primary/15 text-primary",
  Avançado: "bg-destructive/15 text-destructive",
};

const DigitalLiteracy = () => {
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
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full gap-1.5"
                          onClick={() =>
                            toast({ title: "Atividade iniciada 🚀", description: `"${item.title}" está pronta para explorar.` })
                          }
                        >
                          Começar <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
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
