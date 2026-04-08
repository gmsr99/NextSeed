import { ArrowUp, ArrowDown, X, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FamilyMethodology } from "@/lib/types";
import { PRIORITY_LABELS, CATEGORY_COLORS } from "./constants";
import { cn } from "@/lib/utils";

interface Props {
  familyMethodologies: FamilyMethodology[];
  onDeselect: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  isPending: boolean;
}

export function SelectedMethodologies({
  familyMethodologies,
  onDeselect,
  onMoveUp,
  onMoveDown,
  isPending,
}: Props) {
  if (familyMethodologies.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-card p-8 text-center">
        <Leaf className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm font-medium text-muted-foreground">
          Ainda não selecionaste nenhuma metodologia.
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Escolhe as metodologias que guiam a educação da tua família. A IA vai usá-las para gerar planos semanais.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {familyMethodologies.map((fm, idx) => {
        const m = fm.methodology;
        if (!m) return null;
        const catColors = CATEGORY_COLORS[m.category] ?? CATEGORY_COLORS['contemporaneo'];
        const isFirst = idx === 0;
        const isLast = idx === familyMethodologies.length - 1;

        return (
          <div
            key={fm.id}
            className={cn(
              "flex items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-all",
              fm.priority === 1 && "border-primary/30 bg-primary/5",
            )}
          >
            {/* Priority number */}
            <div className="h-7 w-7 rounded-full gradient-warmth text-white text-sm font-bold flex items-center justify-center shrink-0">
              {fm.priority}
            </div>

            {/* Name + priority label */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{m.name}</p>
              <p className="text-xs text-muted-foreground">
                {PRIORITY_LABELS[fm.priority]}&nbsp;·&nbsp;
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-1.5 py-px text-[10px] font-medium",
                    catColors.badge
                  )}
                >
                  {m.age_min}–{m.age_max} anos
                </span>
              </p>
            </div>

            {/* Reorder + Remove */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onMoveUp(fm.id)}
                disabled={isFirst || isPending}
                className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Mover para cima"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onMoveDown(fm.id)}
                disabled={isLast || isPending}
                className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Mover para baixo"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onDeselect(fm.id)}
                disabled={isPending}
                className="rounded-lg p-1.5 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 disabled:opacity-30 transition-colors"
                title="Remover"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}

      {familyMethodologies.length >= 3 && (
        <p className="text-xs text-muted-foreground/70 pt-1 pl-1">
          Com mais de 3 metodologias, a IA distribui o peso mais diluído. Recomendamos manter 1 a 3.
        </p>
      )}
    </div>
  );
}
