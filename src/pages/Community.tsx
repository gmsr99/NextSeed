import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  Share2,
  MessageCircle,
  Users,
  Sparkles,
  TreePine,
  FlaskConical,
  Palette,
  Hammer,
  Shield,
  Plus,
  Eye,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

const typeIcons: Record<string, typeof TreePine> = {
  Natureza: TreePine,
  Ciência: FlaskConical,
  Arte: Palette,
  Construção: Hammer,
};

const feedPosts = [
  {
    id: 1,
    family: "Família Oliveira",
    initials: "FO",
    gradient: "gradient-warmth",
    time: "Há 2 horas",
    title: "Horta Vertical com Garrafas PET",
    type: "Natureza",
    description: "Construímos uma horta vertical com os miúdos! Já temos alface e salsa a crescer. O Tomás mediu tudo sozinho 📏🌱",
    areas: ["Ciências", "Matemática"],
    likes: 12,
    comments: 3,
  },
  {
    id: 2,
    family: "Família Santos",
    initials: "FS",
    gradient: "gradient-forest",
    time: "Há 5 horas",
    title: "Vulcão em Erupção — Experiência",
    type: "Ciência",
    description: "A reação do bicarbonato com o vinagre foi um sucesso! A Mariana ficou fascinada com a 'lava'. Repetimos 4 vezes 😄",
    areas: ["Ciências", "Expressão Plástica"],
    likes: 24,
    comments: 7,
  },
  {
    id: 3,
    family: "Família Rodrigues",
    initials: "FR",
    gradient: "gradient-warmth",
    time: "Ontem",
    title: "Mural de Land Art no Parque",
    type: "Arte",
    description: "Passámos a tarde no parque a criar composições com folhas e pedras. Resultado incrível e sem gastar nada!",
    areas: ["Expressão Plástica", "Ciências"],
    likes: 31,
    comments: 5,
  },
  {
    id: 4,
    family: "Família Costa",
    initials: "FC",
    gradient: "gradient-forest",
    time: "Há 2 dias",
    title: "Robot com Materiais Reciclados",
    type: "Construção",
    description: "O Pedro construiu um robot com caixas de cereais e tampas. Já tem nome: RoboMax! Trabalhámos proporções e simetria.",
    areas: ["Tecnologia", "Matemática"],
    likes: 18,
    comments: 4,
  },
];

const families = [
  { name: "Família Oliveira", initials: "FO", gradient: "gradient-warmth", projects: 8, location: "Lisboa", joined: "Jan 2025" },
  { name: "Família Santos", initials: "FS", gradient: "gradient-forest", projects: 12, location: "Porto", joined: "Nov 2024" },
  { name: "Família Rodrigues", initials: "FR", gradient: "gradient-warmth", projects: 5, location: "Braga", joined: "Mar 2025" },
  { name: "Família Costa", initials: "FC", gradient: "gradient-forest", projects: 15, location: "Coimbra", joined: "Set 2024" },
  { name: "Família Ferreira", initials: "FF", gradient: "gradient-warmth", projects: 3, location: "Faro", joined: "Mai 2025" },
  { name: "Família Pereira", initials: "FP", gradient: "gradient-forest", projects: 9, location: "Aveiro", joined: "Dez 2024" },
];

const Community = () => {
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>(
    Object.fromEntries(feedPosts.map((p) => [p.id, p.likes]))
  );

  const toggleLike = (id: number) => {
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
    setLikeCounts((prev) => ({
      ...prev,
      [id]: likedPosts[id] ? prev[id] - 1 : prev[id] + 1,
    }));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-9 w-9 rounded-xl gradient-forest flex items-center justify-center">
                <Users className="h-5 w-5 text-accent-foreground" />
              </div>
              <h1 className="text-3xl font-heading font-bold">Comunidade</h1>
            </div>
            <p className="text-muted-foreground">
              Um espaço seguro para partilhar projetos e inspirar outras famílias.
            </p>
          </div>
          <Button
            variant="warmth"
            className="gap-2"
            onClick={() =>
              toast({
                title: "Partilhar projeto 🌟",
                description: "Seleciona um projeto do teu portfólio para partilhar com a comunidade.",
              })
            }
          >
            <Plus className="h-4 w-4" />
            Partilhar Projeto
          </Button>
        </div>

        {/* Privacy notice */}
        <div className="flex items-center gap-2 rounded-xl bg-accent/10 border border-accent/20 px-4 py-3 text-sm text-muted-foreground">
          <Shield className="h-4 w-4 text-accent shrink-0" />
          <span>
            Ambiente moderado e seguro. A partilha de projetos e perfil é sempre <strong className="text-foreground">opcional</strong>.
          </span>
        </div>

        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="bg-muted/60">
            <TabsTrigger value="feed" className="gap-1.5">
              <Sparkles className="h-4 w-4" />
              Feed
            </TabsTrigger>
            <TabsTrigger value="families" className="gap-1.5">
              <Users className="h-4 w-4" />
              Famílias
            </TabsTrigger>
          </TabsList>

          {/* Feed Tab */}
          <TabsContent value="feed" className="space-y-4">
            {feedPosts.map((post, i) => {
              const TypeIcon = typeIcons[post.type] || Sparkles;
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Card className="hover:shadow-elevated transition-shadow duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className={`${post.gradient} text-white text-xs font-bold`}>
                            {post.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{post.family}</p>
                          <p className="text-xs text-muted-foreground">{post.time}</p>
                        </div>
                        <Badge variant="secondary" className="gap-1 text-[10px] shrink-0">
                          <TypeIcon className="h-3 w-3" />
                          {post.type}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="pb-3 space-y-3">
                      <h3 className="font-heading font-bold text-base">{post.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{post.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {post.areas.map((a) => (
                          <Badge key={a} variant="outline" className="text-[10px] px-1.5 py-0">
                            {a}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>

                    <CardFooter className="pt-0 gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`gap-1.5 ${likedPosts[post.id] ? "text-destructive" : "text-muted-foreground"}`}
                        onClick={() => toggleLike(post.id)}
                      >
                        <Heart className={`h-4 w-4 ${likedPosts[post.id] ? "fill-destructive" : ""}`} />
                        <span className="text-xs">{likeCounts[post.id]}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-xs">{post.comments}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-muted-foreground ml-auto"
                        onClick={() => toast({ title: "Link copiado!", description: "Partilha este projeto com quem quiseres." })}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>

          {/* Families Tab */}
          <TabsContent value="families">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {families.map((fam, i) => (
                <motion.div
                  key={fam.name}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="hover:shadow-elevated transition-shadow duration-300 group">
                    <CardContent className="pt-6 text-center space-y-3">
                      <Avatar className="h-16 w-16 mx-auto">
                        <AvatarFallback className={`${fam.gradient} text-white text-lg font-bold`}>
                          {fam.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-heading font-bold group-hover:text-primary transition-colors">{fam.name}</p>
                        <p className="text-xs text-muted-foreground">{fam.location} · Desde {fam.joined}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {fam.projects} projetos partilhados
                      </Badge>
                    </CardContent>
                    <CardFooter className="justify-center pt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => toast({ title: `Perfil de ${fam.name}`, description: "A ver projetos partilhados..." })}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Ver Perfil
                      </Button>
                    </CardFooter>
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

export default Community;
