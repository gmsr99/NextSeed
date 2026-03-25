import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Rocket, TreePine, Hammer, FlaskConical, Palette, Star, Filter, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

const typeConfig: Record<string, { icon: typeof TreePine; color: string; bg: string }> = {
  Natureza: { icon: TreePine, color: "text-accent", bg: "bg-accent/10" },
  Construção: { icon: Hammer, color: "text-primary", bg: "bg-primary/10" },
  Ciência: { icon: FlaskConical, color: "text-destructive", bg: "bg-destructive/10" },
  Arte: { icon: Palette, color: "text-[hsl(var(--nexseed-orange))]", bg: "bg-[hsl(var(--nexseed-orange))]/10" },
};

const difficultyStars: Record<string, number> = { Fácil: 1, Médio: 2, Avançado: 3 };

const projects = [
  {
    id: 1, title: "Horta Vertical com Garrafas", type: "Natureza", difficulty: "Fácil",
    areas: ["Ciências", "Matemática", "Expressão Plástica"],
    description: "Construir uma horta vertical reutilizando garrafas PET. Medir, plantar e observar o crescimento.",
  },
  {
    id: 2, title: "Vulcão em Erupção", type: "Ciência", difficulty: "Médio",
    areas: ["Ciências", "Expressão Plástica"],
    description: "Criar um modelo de vulcão e simular uma erupção com bicarbonato e vinagre.",
  },
  {
    id: 3, title: "Ponte de Palitos de Gelado", type: "Construção", difficulty: "Avançado",
    areas: ["Matemática", "Engenharia", "Expressão Plástica"],
    description: "Projetar e construir uma ponte resistente usando apenas palitos e cola.",
  },
  {
    id: 4, title: "Pintura com Elementos Naturais", type: "Arte", difficulty: "Fácil",
    areas: ["Expressão Plástica", "Ciências"],
    description: "Criar obras de arte usando folhas, flores, terra e materiais encontrados na natureza.",
  },
  {
    id: 5, title: "Estação Meteorológica Caseira", type: "Ciência", difficulty: "Avançado",
    areas: ["Ciências", "Matemática", "Tecnologia"],
    description: "Construir instrumentos simples para medir temperatura, vento e chuva.",
  },
  {
    id: 6, title: "Casa para Insetos", type: "Natureza", difficulty: "Médio",
    areas: ["Ciências", "Expressão Plástica"],
    description: "Criar um refúgio para insetos usando materiais naturais: paus, pinhas e folhas.",
  },
  {
    id: 7, title: "Robot com Materiais Reciclados", type: "Construção", difficulty: "Médio",
    areas: ["Tecnologia", "Expressão Plástica", "Matemática"],
    description: "Construir um robot criativo reutilizando caixas, tampas e rolos de papel.",
  },
  {
    id: 8, title: "Mural de Land Art", type: "Arte", difficulty: "Fácil",
    areas: ["Expressão Plástica", "Ciências"],
    description: "Criar composições artísticas ao ar livre utilizando pedras, folhas e ramos.",
  },
];

const Projects = () => {
  const [typeFilter, setTypeFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  const filtered = projects.filter(
    (p) =>
      (typeFilter === "all" || p.type === typeFilter) &&
      (difficultyFilter === "all" || p.difficulty === difficultyFilter)
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-9 w-9 rounded-xl gradient-warmth flex items-center justify-center">
                <Rocket className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-heading font-bold">Projetos STEAM</h1>
            </div>
            <p className="text-muted-foreground">Biblioteca de projetos para explorar, criar e aprender.</p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px] h-9 text-sm"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="Natureza">Natureza</SelectItem>
                <SelectItem value="Construção">Construção</SelectItem>
                <SelectItem value="Ciência">Ciência</SelectItem>
                <SelectItem value="Arte">Arte</SelectItem>
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-[140px] h-9 text-sm"><SelectValue placeholder="Dificuldade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="Fácil">Fácil</SelectItem>
                <SelectItem value="Médio">Médio</SelectItem>
                <SelectItem value="Avançado">Avançado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((project, i) => {
            const cfg = typeConfig[project.type];
            const Icon = cfg.icon;
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="h-full flex flex-col hover:shadow-elevated transition-shadow duration-300 group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className={`h-10 w-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`h-5 w-5 ${cfg.color}`} />
                      </div>
                      <Badge variant="secondary" className="text-[10px] font-medium shrink-0">
                        {project.type}
                      </Badge>
                    </div>
                    <h3 className="font-heading font-bold text-base leading-tight mt-2 group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                  </CardHeader>

                  <CardContent className="flex-1 pb-3 space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {project.areas.map((a) => (
                        <Badge key={a} variant="outline" className="text-[10px] px-1.5 py-0">
                          {a}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 pt-1">
                      {Array.from({ length: 3 }).map((_, s) => (
                        <Star
                          key={s}
                          className={`h-3.5 w-3.5 ${s < difficultyStars[project.difficulty] ? "text-primary fill-primary" : "text-muted-foreground/30"}`}
                        />
                      ))}
                      <span className="text-xs text-muted-foreground ml-1">{project.difficulty}</span>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0">
                    <Button
                      size="sm"
                      variant="warmth"
                      className="w-full gap-1.5"
                      onClick={() =>
                        toast({
                          title: "Projeto iniciado! 🚀",
                          description: `"${project.title}" foi adicionado aos teus projetos ativos.`,
                        })
                      }
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Iniciar Projeto
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Rocket className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-heading font-semibold">Nenhum projeto encontrado</p>
            <p className="text-sm">Tenta ajustar os filtros.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Projects;
