import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Target, Lightbulb, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

interface Objective {
  id: string;
  text: string;
  code: string;
}

interface Subtopic {
  title: string;
  objectives: Objective[];
}

interface Theme {
  title: string;
  icon: React.ReactNode;
  subtopics: Subtopic[];
}

interface SubjectData {
  label: string;
  color: string;
  themes: Theme[];
}

const subjects: Record<string, SubjectData> = {
  portugues: {
    label: "Português",
    color: "bg-primary/15 text-primary",
    themes: [
      {
        title: "Oralidade",
        icon: <Lightbulb className="h-4 w-4" />,
        subtopics: [
          {
            title: "Compreensão do Oral",
            objectives: [
              { id: "PT1", code: "O1", text: "Escutar discursos breves para aprender e construir conhecimentos." },
              { id: "PT2", code: "O2", text: "Identificar a informação essencial de um texto ouvido." },
              { id: "PT3", code: "O3", text: "Reconhecer padrões de entoação e ritmo." },
            ],
          },
          {
            title: "Expressão Oral",
            objectives: [
              { id: "PT4", code: "O4", text: "Produzir um discurso oral com correção e clareza." },
              { id: "PT5", code: "O5", text: "Apresentar ideias e opiniões de forma organizada." },
            ],
          },
        ],
      },
      {
        title: "Leitura e Escrita",
        icon: <BookOpen className="h-4 w-4" />,
        subtopics: [
          {
            title: "Fluência de Leitura",
            objectives: [
              { id: "PT6", code: "LE1", text: "Ler textos diversos com fluência e expressividade." },
              { id: "PT7", code: "LE2", text: "Compreender o sentido global de textos narrativos e informativos." },
            ],
          },
          {
            title: "Produção Escrita",
            objectives: [
              { id: "PT8", code: "LE3", text: "Planificar, redigir e rever textos com coerência." },
              { id: "PT9", code: "LE4", text: "Escrever textos de diferentes géneros (narrativo, descritivo, carta)." },
            ],
          },
        ],
      },
      {
        title: "Gramática",
        icon: <GraduationCap className="h-4 w-4" />,
        subtopics: [
          {
            title: "Classes de Palavras",
            objectives: [
              { id: "PT10", code: "G1", text: "Identificar e classificar nomes, adjetivos e verbos." },
              { id: "PT11", code: "G2", text: "Aplicar regras de concordância em género e número." },
            ],
          },
        ],
      },
    ],
  },
  matematica: {
    label: "Matemática",
    color: "bg-accent/15 text-accent-foreground",
    themes: [
      {
        title: "Números e Operações",
        icon: <Target className="h-4 w-4" />,
        subtopics: [
          {
            title: "Números Naturais",
            objectives: [
              { id: "MA1", code: "NO1", text: "Ler, representar e ordenar números até 10 000." },
              { id: "MA2", code: "NO2", text: "Compor e decompor números na base 10." },
            ],
          },
          {
            title: "Operações com Números Naturais",
            objectives: [
              { id: "MA3", code: "NO3", text: "Resolver problemas envolvendo adição, subtração e multiplicação." },
              { id: "MA4", code: "NO4", text: "Compreender e aplicar a tabuada." },
              { id: "MA5", code: "NO5", text: "Iniciar a divisão inteira com compreensão do resto." },
            ],
          },
        ],
      },
      {
        title: "Geometria e Medida",
        icon: <Lightbulb className="h-4 w-4" />,
        subtopics: [
          {
            title: "Figuras Geométricas",
            objectives: [
              { id: "MA6", code: "GM1", text: "Identificar e classificar figuras geométricas planas." },
              { id: "MA7", code: "GM2", text: "Reconhecer propriedades de sólidos geométricos." },
            ],
          },
          {
            title: "Medida",
            objectives: [
              { id: "MA8", code: "GM3", text: "Medir comprimentos, massas e capacidades com unidades convencionais." },
              { id: "MA9", code: "GM4", text: "Resolver problemas envolvendo dinheiro e tempo." },
            ],
          },
        ],
      },
      {
        title: "Organização e Tratamento de Dados",
        icon: <GraduationCap className="h-4 w-4" />,
        subtopics: [
          {
            title: "Recolha e Representação de Dados",
            objectives: [
              { id: "MA10", code: "OTD1", text: "Recolher e organizar dados em tabelas e gráficos de barras." },
              { id: "MA11", code: "OTD2", text: "Interpretar informação a partir de gráficos simples." },
            ],
          },
        ],
      },
    ],
  },
  estudo_meio: {
    label: "Estudo do Meio",
    color: "bg-nexseed-moss/15 text-foreground",
    themes: [
      {
        title: "Natureza e Ambiente",
        icon: <Lightbulb className="h-4 w-4" />,
        subtopics: [
          {
            title: "Seres Vivos",
            objectives: [
              { id: "EM1", code: "NA1", text: "Identificar características dos seres vivos e seus habitats." },
              { id: "EM2", code: "NA2", text: "Compreender cadeias alimentares simples." },
            ],
          },
          {
            title: "Meio Físico",
            objectives: [
              { id: "EM3", code: "NA3", text: "Reconhecer estados físicos da água e o ciclo da água." },
              { id: "EM4", code: "NA4", text: "Identificar tipos de solo e rochas do meio local." },
            ],
          },
        ],
      },
      {
        title: "Sociedade e Território",
        icon: <GraduationCap className="h-4 w-4" />,
        subtopics: [
          {
            title: "O Passado do Meio Local",
            objectives: [
              { id: "EM5", code: "ST1", text: "Conhecer factos e datas da história local e nacional." },
              { id: "EM6", code: "ST2", text: "Localizar no mapa os principais rios e serras de Portugal." },
            ],
          },
          {
            title: "Instituições e Comunidade",
            objectives: [
              { id: "EM7", code: "ST3", text: "Reconhecer a importância das instituições locais e nacionais." },
              { id: "EM8", code: "ST4", text: "Compreender direitos e deveres dos cidadãos." },
            ],
          },
        ],
      },
      {
        title: "Tecnologia e Bem-Estar",
        icon: <Target className="h-4 w-4" />,
        subtopics: [
          {
            title: "Saúde e Segurança",
            objectives: [
              { id: "EM9", code: "TB1", text: "Identificar hábitos de vida saudável e regras de segurança." },
              { id: "EM10", code: "TB2", text: "Compreender a importância da vacinação e higiene." },
            ],
          },
        ],
      },
    ],
  },
};

const Curriculum = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>("portugues");

  const subject = subjects[selectedSubject];

  const handleCreateActivity = (objective: Objective) => {
    console.log("Criar atividade para:", objective);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">Currículo & Planeamento</h1>
            <p className="text-muted-foreground mt-1">
              Explorar áreas curriculares, temas e objetivos de aprendizagem.
            </p>
          </div>
          <div className="w-full sm:w-64">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar área" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(subjects).map(([key, s]) => (
                  <SelectItem key={key} value={key}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Subject Badge */}
        <motion.div
          key={selectedSubject}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Badge variant="secondary" className={`text-sm px-3 py-1 ${subject.color}`}>
            <BookOpen className="h-3.5 w-3.5 mr-1.5" />
            {subject.label}
          </Badge>
        </motion.div>

        {/* Themes */}
        <motion.div
          key={`themes-${selectedSubject}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="space-y-4"
        >
          {subject.themes.map((theme, ti) => (
            <Card key={ti} className="shadow-soft">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  {theme.icon}
                  {theme.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {theme.subtopics.map((sub, si) => (
                    <AccordionItem key={si} value={`${ti}-${si}`}>
                      <AccordionTrigger className="text-sm font-medium hover:no-underline">
                        {sub.title}
                        <Badge variant="outline" className="ml-auto mr-2 text-xs font-normal">
                          {sub.objectives.length} objetivo{sub.objectives.length !== 1 ? "s" : ""}
                        </Badge>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-3">
                          {sub.objectives.map((obj) => (
                            <li
                              key={obj.id}
                              className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 p-3"
                            >
                              <div className="flex items-start gap-2 min-w-0">
                                <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5 py-0.5 mt-0.5">
                                  {obj.code}
                                </Badge>
                                <span className="text-sm leading-relaxed">{obj.text}</span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="shrink-0 text-xs gap-1"
                                onClick={() => handleCreateActivity(obj)}
                              >
                                <Plus className="h-3 w-3" />
                                <span className="hidden sm:inline">Criar Atividade</span>
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Curriculum;
