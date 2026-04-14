import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, BookHeart } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { useMethodologies } from "@/hooks/useMethodologies";
import { MethodologyCard } from "@/components/methodology/MethodologyCard";
import { SelectedMethodologies } from "@/components/methodology/SelectedMethodologies";
import { useToast } from "@/hooks/use-toast";
import { CATEGORY_LABELS } from "@/components/methodology/constants";
import type { MethodologyCategory } from "@/lib/types";

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as MethodologyCategory[];

export default function Metodologias() {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<MethodologyCategory | "todas">("todas");

  const {
    allMethodologies,
    familyMethodologies,
    compatibility,
    isLoading,
    select,
    deselect,
    moveUp,
    moveDown,
    getFamilyMethodology,
  } = useMethodologies();

  const isPending =
    select.isPending ||
    deselect.isPending ||
    moveUp.isPending ||
    moveDown.isPending;

  const filtered =
    activeCategory === "todas"
      ? allMethodologies
      : allMethodologies.filter((m) => m.category === activeCategory);

  function handleSelect(methodologyId: string) {
    select.mutate(methodologyId, {
      onError: () =>
        toast({ title: "Erro ao selecionar metodologia.", variant: "destructive" }),
    });
  }

  function handleDeselect(familyMethodologyId: string) {
    deselect.mutate(familyMethodologyId, {
      onError: () =>
        toast({ title: "Erro ao remover metodologia.", variant: "destructive" }),
    });
  }

  function handleMoveUp(familyMethodologyId: string) {
    moveUp.mutate(familyMethodologyId, {
      onError: () =>
        toast({ title: "Erro ao reordenar.", variant: "destructive" }),
    });
  }

  function handleMoveDown(familyMethodologyId: string) {
    moveDown.mutate(familyMethodologyId, {
      onError: () =>
        toast({ title: "Erro ao reordenar.", variant: "destructive" }),
    });
  }

  return (
    <AppLayout>
      <div className="space-y-10">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl gradient-forest flex items-center justify-center">
              <BookHeart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold leading-tight">
                Metodologias
              </h1>
              <p className="text-muted-foreground text-sm">
                Escolhe as abordagens pedagógicas que guiam a educação da tua família.
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-16 justify-center">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>A carregar metodologias…</span>
          </div>
        ) : (
          <>
            {/* ── Selecionadas ─────────────────────────────────────────── */}
            <section>
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="text-lg font-heading font-semibold">
                  As nossas metodologias
                </h2>
                {familyMethodologies.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {familyMethodologies.length} selecionada{familyMethodologies.length !== 1 ? "s" : ""}
                    &nbsp;·&nbsp;ordenadas por prioridade
                  </span>
                )}
              </div>

              <SelectedMethodologies
                familyMethodologies={familyMethodologies}
                onDeselect={handleDeselect}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                isPending={isPending}
              />
            </section>

            {/* ── Explorar ─────────────────────────────────────────────── */}
            <section>
              <h2 className="text-lg font-heading font-semibold mb-4">
                Explorar metodologias
              </h2>

              {/* Category filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => setActiveCategory("todas")}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    activeCategory === "todas"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Todas
                </button>
                {ALL_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                      activeCategory === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>

              {/* Cards grid */}
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {filtered.map((methodology) => {
                  const fm = getFamilyMethodology(methodology.id);
                  return (
                    <MethodologyCard
                      key={methodology.id}
                      methodology={methodology}
                      familyMethodology={fm}
                      familyMethodologies={familyMethodologies}
                      compatibility={compatibility}
                      onSelect={() => handleSelect(methodology.id)}
                      onDeselect={() => fm && handleDeselect(fm.methodology_id)}
                      isPending={isPending}
                    />
                  );
                })}
              </motion.div>
            </section>
          </>
        )}
      </div>
    </AppLayout>
  );
}
