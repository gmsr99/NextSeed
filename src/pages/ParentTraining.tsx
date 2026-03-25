import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Heart, Lightbulb, Sun, ChevronRight, BookOpen, Check, ArrowLeft } from "lucide-react";
import {
  categories,
  contentLibrary,
  getContentForDay,
  getContentByCategory,
  getTypeLabel,
  getTypeColor,
  type ContentCategory,
  type TrainingContent,
  type CategoryInfo,
} from "@/lib/parentTrainingContent";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.35 },
};

function HighlightCard({ content, accent, icon }: { content: TrainingContent | null; accent: string; icon: React.ReactNode }) {
  if (!content) return null;
  return (
    <Card className={`border-0 shadow-card overflow-hidden ${accent}`}>
      <CardContent className="p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="shrink-0 mt-1">{icon}</div>
          <div className="space-y-2 min-w-0">
            <Badge className={getTypeColor(content.type)} variant="secondary">{getTypeLabel(content.type)}</Badge>
            <h3 className="text-lg font-heading font-semibold text-foreground">{content.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{content.body}</p>
            {content.items && (
              <ul className="mt-3 space-y-1.5">
                {content.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <Check className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ContentCard({ content }: { content: TrainingContent }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div layout>
      <Card
        className="border border-border/50 shadow-soft hover:shadow-card transition-shadow cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <Badge className={getTypeColor(content.type)} variant="secondary">{getTypeLabel(content.type)}</Badge>
              </div>
              <h4 className="font-heading font-semibold text-foreground">{content.title}</h4>
              <p className={`text-sm text-muted-foreground leading-relaxed ${!expanded ? "line-clamp-2" : ""}`}>{content.body}</p>
            </div>
            <ChevronRight className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${expanded ? "rotate-90" : ""}`} />
          </div>
          <AnimatePresence>
            {expanded && content.items && (
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-1.5 overflow-hidden"
              >
                {content.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <Check className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ParentTraining() {
  const [selectedCategories, setSelectedCategories] = useState<ContentCategory[]>(categories.map((c) => c.id));
  const [viewCategory, setViewCategory] = useState<CategoryInfo | null>(null);

  const toggleCategory = (id: ContentCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const { weeklyTip, weekendSuggestion } = getContentForDay(selectedCategories);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-10 pb-12">
        {/* Header */}
        <motion.div {...fadeUp} className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground tracking-tight">
            Formação para Pais
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            Pequenos conteúdos semanais para crescer ao lado dos teus filhos. Escolhe os temas que mais te tocam.
          </p>
        </motion.div>

        {/* Category Selection */}
        <motion.section {...fadeUp} transition={{ delay: 0.05 }}>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Os meus interesses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((cat) => {
              const active = selectedCategories.includes(cat.id);
              return (
                <label
                  key={cat.id}
                  className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                    active ? "border-primary/40 bg-primary/5" : "border-border/50 bg-card hover:border-border"
                  }`}
                >
                  <Checkbox
                    checked={active}
                    onCheckedChange={() => toggleCategory(cat.id)}
                    className="mt-0.5"
                  />
                  <div className="min-w-0">
                    <span className="font-medium text-foreground text-sm">{cat.icon} {cat.label}</span>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{cat.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </motion.section>

        <Separator />

        {/* Highlights */}
        <AnimatePresence mode="wait">
          {!viewCategory ? (
            <motion.div key="home" {...fadeUp} className="space-y-8">
              {/* Weekly Tip */}
              <section className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" /> Dica da Semana
                </h2>
                <HighlightCard
                  content={weeklyTip}
                  accent="bg-primary/[0.04]"
                  icon={<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><Lightbulb className="h-5 w-5 text-primary" /></div>}
                />
              </section>

              {/* Weekend Suggestion */}
              <section className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Sun className="h-4 w-4" /> Sugestão para o Fim de Semana
                </h2>
                <HighlightCard
                  content={weekendSuggestion}
                  accent="bg-accent/[0.04]"
                  icon={<div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center"><Sun className="h-5 w-5 text-accent" /></div>}
                />
              </section>

              <Separator />

              {/* Category Library */}
              <section className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Biblioteca por Categoria
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categories
                    .filter((c) => selectedCategories.includes(c.id))
                    .map((cat) => {
                      const count = getContentByCategory(cat.id).length;
                      return (
                        <Card
                          key={cat.id}
                          className="border border-border/50 shadow-soft hover:shadow-card transition-all cursor-pointer group"
                          onClick={() => setViewCategory(cat)}
                        >
                          <CardContent className="p-5 flex items-center gap-4">
                            <span className="text-2xl">{cat.icon}</span>
                            <div className="min-w-0 flex-1">
                              <p className="font-heading font-semibold text-foreground text-sm">{cat.label}</p>
                              <p className="text-xs text-muted-foreground">{count} conteúdos</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div key={viewCategory.id} {...fadeUp} className="space-y-6">
              <Button variant="ghost" size="sm" onClick={() => setViewCategory(null)} className="gap-1.5 text-muted-foreground">
                <ArrowLeft className="h-4 w-4" /> Voltar
              </Button>
              <div className="space-y-1">
                <h2 className="text-2xl font-heading font-bold text-foreground">{viewCategory.icon} {viewCategory.label}</h2>
                <p className="text-muted-foreground">{viewCategory.description}</p>
              </div>
              <div className="space-y-3">
                {getContentByCategory(viewCategory.id).map((content) => (
                  <ContentCard key={content.id} content={content} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
