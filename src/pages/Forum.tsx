import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageCircle,
  Plus,
  Search,
  ThumbsUp,
  ArrowLeft,
  Clock,
  User,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

// --- Types ---
type Reply = {
  id: string;
  author: string;
  content: string;
  date: Date;
  likes: number;
};

type Topic = {
  id: string;
  title: string;
  author: string;
  content: string;
  date: Date;
  lastActivity: Date;
  tags: string[];
  discipline: string;
  ageRange: string;
  replies: Reply[];
};

// --- Mock data ---
const mockTopics: Topic[] = [
  {
    id: "1",
    title: "Como introduzir frações com materiais naturais?",
    author: "Ana Ferreira",
    content:
      "Olá a todos! Tenho procurado formas práticas de ensinar frações usando materiais que encontramos na natureza. Alguém já experimentou usar pedras, folhas ou frutos para este conceito? Gostava de ouvir as vossas experiências e ideias.\n\nO meu filho de 7 anos tem dificuldade com o conceito abstrato e pensei que algo mais tátil pudesse ajudar.",
    date: new Date(2026, 1, 10),
    lastActivity: new Date(2026, 1, 18),
    tags: ["Matemática", "Natureza", "Materiais"],
    discipline: "Matemática",
    ageRange: "6-9",
    replies: [
      {
        id: "r1",
        author: "Miguel Santos",
        content:
          "Nós usámos fatias de maçã e funcionou muito bem! A criança vê a maçã inteira e depois as partes — 1/2, 1/4, etc. Simples e eficaz.",
        date: new Date(2026, 1, 12),
        likes: 5,
      },
      {
        id: "r2",
        author: "Clara Mendes",
        content:
          "Experimentem com pedras de rio de tamanhos diferentes. Agrupar e dividir em conjuntos ajuda a visualizar. Temos fotos no nosso portfólio se quiserem ver!",
        date: new Date(2026, 1, 18),
        likes: 3,
      },
    ],
  },
  {
    id: "2",
    title: "Rotina diária: como organizam o vosso dia?",
    author: "Pedro Almeida",
    content:
      "Estou a começar o ensino doméstico e estou um pouco perdido na organização do dia. Como estruturam as vossas manhãs e tardes? Têm horários fixos ou é mais flexível?\n\nAgradecia partilha de exemplos reais.",
    date: new Date(2026, 1, 14),
    lastActivity: new Date(2026, 1, 17),
    tags: ["Organização", "Rotinas", "Iniciantes"],
    discipline: "Geral",
    ageRange: "Todas",
    replies: [
      {
        id: "r3",
        author: "Sofia Duarte",
        content:
          "Nós fazemos blocos de 45 min com pausas ao ar livre. Manhã para matérias mais concentradas, tarde para projetos criativos. Funciona bem com crianças dos 5 aos 10.",
        date: new Date(2026, 1, 17),
        likes: 8,
      },
    ],
  },
  {
    id: "3",
    title: "Recursos para literacia digital responsável",
    author: "Joana Ribeiro",
    content:
      "Procuro sugestões de recursos (sites, livros, atividades) para ensinar literacia digital de forma responsável a crianças de 10-12 anos. Quero que aprendam a usar a tecnologia de forma consciente e segura.",
    date: new Date(2026, 1, 16),
    lastActivity: new Date(2026, 1, 16),
    tags: ["Digital", "Segurança", "Adolescentes"],
    discipline: "Literacia Digital",
    ageRange: "10-12",
    replies: [],
  },
  {
    id: "4",
    title: "Projetos de ciência com materiais caseiros",
    author: "Rui Carvalho",
    content:
      "Compilei uma lista de 15 experiências científicas que podem ser feitas com materiais que já temos em casa. Desde vulcões de bicarbonato a circuitos simples com limões. Partilho aqui para quem quiser!",
    date: new Date(2026, 1, 8),
    lastActivity: new Date(2026, 1, 19),
    tags: ["Ciências", "DIY", "Experiências"],
    discipline: "Ciências",
    ageRange: "6-12",
    replies: [
      {
        id: "r4",
        author: "Marta Costa",
        content: "Adorámos o vulcão! As crianças pediram para repetir três vezes. Obrigada pela partilha!",
        date: new Date(2026, 1, 15),
        likes: 12,
      },
      {
        id: "r5",
        author: "Ana Ferreira",
        content: "O circuito com limões é genial. Juntámos ao nosso projeto de eletricidade. Muito obrigada!",
        date: new Date(2026, 1, 19),
        likes: 4,
      },
    ],
  },
];

const disciplines = ["Todas", "Matemática", "Ciências", "Geral", "Literacia Digital", "Artes", "Português", "História"];
const ageRanges = ["Todas", "3-5", "6-9", "10-12", "13+"];
const sortOptions = [
  { value: "recent", label: "Mais recentes" },
  { value: "popular", label: "Mais populares" },
  { value: "active", label: "Última atividade" },
];

const Forum = () => {
  const [topics, setTopics] = useState<Topic[]>(mockTopics);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [disciplineFilter, setDisciplineFilter] = useState("Todas");
  const [ageFilter, setAgeFilter] = useState("Todas");
  const [sortBy, setSortBy] = useState("recent");
  const [createOpen, setCreateOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [likedReplies, setLikedReplies] = useState<Set<string>>(new Set());

  // New topic form
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newDiscipline, setNewDiscipline] = useState("Geral");
  const [newAge, setNewAge] = useState("Todas");
  const [newTags, setNewTags] = useState("");

  // Filter & sort
  const filtered = topics
    .filter((t) => {
      const matchSearch =
        searchQuery === "" ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchDisc = disciplineFilter === "Todas" || t.discipline === disciplineFilter;
      const matchAge = ageFilter === "Todas" || t.ageRange === ageFilter;
      return matchSearch && matchDisc && matchAge;
    })
    .sort((a, b) => {
      if (sortBy === "popular") return b.replies.length - a.replies.length;
      if (sortBy === "active") return b.lastActivity.getTime() - a.lastActivity.getTime();
      return b.date.getTime() - a.date.getTime();
    });

  const handleCreate = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast({ title: "Preencha o título e o conteúdo.", variant: "destructive" });
      return;
    }
    const topic: Topic = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      author: "Família Malta",
      content: newContent.trim(),
      date: new Date(),
      lastActivity: new Date(),
      tags: newTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      discipline: newDiscipline,
      ageRange: newAge,
      replies: [],
    };
    setTopics((prev) => [topic, ...prev]);
    setNewTitle("");
    setNewContent("");
    setNewTags("");
    setCreateOpen(false);
    toast({ title: "Tópico criado com sucesso!" });
  };

  const handleReply = () => {
    if (!replyText.trim() || !selectedTopic) return;
    const reply: Reply = {
      id: Date.now().toString(),
      author: "Família Malta",
      content: replyText.trim(),
      date: new Date(),
      likes: 0,
    };
    setTopics((prev) =>
      prev.map((t) =>
        t.id === selectedTopic.id
          ? { ...t, replies: [...t.replies, reply], lastActivity: new Date() }
          : t
      )
    );
    setSelectedTopic((prev) =>
      prev ? { ...prev, replies: [...prev.replies, reply], lastActivity: new Date() } : null
    );
    setReplyText("");
    toast({ title: "Resposta publicada!" });
  };

  const toggleLike = (replyId: string) => {
    setLikedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(replyId)) next.delete(replyId);
      else next.add(replyId);
      return next;
    });
    const updateReplies = (replies: Reply[]) =>
      replies.map((r) =>
        r.id === replyId
          ? { ...r, likes: r.likes + (likedReplies.has(replyId) ? -1 : 1) }
          : r
      );
    setTopics((prev) =>
      prev.map((t) => ({ ...t, replies: updateReplies(t.replies) }))
    );
    if (selectedTopic) {
      setSelectedTopic((prev) =>
        prev ? { ...prev, replies: updateReplies(prev.replies) } : null
      );
    }
  };

  // --- Topic Detail View ---
  if (selectedTopic) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto space-y-6">
          <button
            onClick={() => setSelectedTopic(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao fórum
          </button>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="space-y-1 mb-2">
              <div className="flex flex-wrap gap-1.5">
                {selectedTopic.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs font-normal">
                    {tag}
                  </Badge>
                ))}
              </div>
              <h1 className="text-2xl font-heading font-bold">{selectedTopic.title}</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {selectedTopic.author}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {format(selectedTopic.date, "d MMM yyyy", { locale: pt })}
                </span>
              </div>
            </div>

            <Card className="border-border/60">
              <CardContent className="p-6">
                <p className="text-foreground/90 leading-relaxed whitespace-pre-line">
                  {selectedTopic.content}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Replies */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {selectedTopic.replies.length} resposta{selectedTopic.replies.length !== 1 && "s"}
            </h2>

            <AnimatePresence>
              {selectedTopic.replies.map((reply, i) => (
                <motion.div
                  key={reply.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="border-border/40">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                            {reply.author.charAt(0)}
                          </div>
                          <span className="font-medium text-foreground">{reply.author}</span>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-muted-foreground">
                            {format(reply.date, "d MMM", { locale: pt })}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleLike(reply.id)}
                          className={`flex items-center gap-1 text-xs transition-colors ${
                            likedReplies.has(reply.id)
                              ? "text-primary font-semibold"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                          {reply.likes}
                        </button>
                      </div>
                      <p className="text-foreground/85 text-sm leading-relaxed">{reply.content}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Reply input */}
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="space-y-3">
                <Textarea
                  placeholder="Escreva a sua resposta..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="min-h-[100px] resize-none border-border/40 focus-visible:ring-primary/30"
                />
                <div className="flex justify-end">
                  <Button onClick={handleReply} disabled={!replyText.trim()} size="sm">
                    <Send className="h-4 w-4 mr-1" />
                    Responder
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // --- Topic List View ---
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-9 w-9 rounded-xl gradient-forest flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-accent-foreground" />
              </div>
              <h1 className="text-3xl font-heading font-bold">Fórum</h1>
            </div>
            <p className="text-muted-foreground">Partilha e aprende em conjunto.</p>
          </div>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Criar novo tópico
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Novo tópico</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <Input
                  placeholder="Título do tópico"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Conteúdo..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Select value={newDiscipline} onValueChange={setNewDiscipline}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Disciplina" />
                    </SelectTrigger>
                    <SelectContent>
                      {disciplines.slice(1).map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={newAge} onValueChange={setNewAge}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Faixa etária" />
                    </SelectTrigger>
                    <SelectContent>
                      {ageRanges.map((a) => (
                        <SelectItem key={a} value={a}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  placeholder="Tags (separadas por vírgula)"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button onClick={handleCreate}>Publicar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar tópicos ou tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={disciplineFilter} onValueChange={setDisciplineFilter}>
            <SelectTrigger className="w-[150px] h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {disciplines.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={ageFilter} onValueChange={setAgeFilter}>
            <SelectTrigger className="w-[120px] h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ageRanges.map((a) => (
                <SelectItem key={a} value={a}>{a === "Todas" ? "Todas idades" : a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[150px] h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Topics */}
        <div className="space-y-2">
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              Nenhum tópico encontrado.
            </p>
          )}
          {filtered.map((topic, i) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card
                className="border-border/40 hover:border-border/70 transition-colors cursor-pointer"
                onClick={() => setSelectedTopic(topic)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <h3 className="font-semibold text-foreground leading-snug">
                        {topic.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{topic.author}</span>
                        <span>·</span>
                        <span>{format(topic.date, "d MMM", { locale: pt })}</span>
                        {topic.replies.length > 0 && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(topic.lastActivity, "d MMM", { locale: pt })}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {topic.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px] font-normal px-2 py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-sm shrink-0 pt-1">
                      <MessageCircle className="h-4 w-4" />
                      <span className="font-medium">{topic.replies.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Forum;
