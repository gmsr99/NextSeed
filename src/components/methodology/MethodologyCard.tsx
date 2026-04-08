import { useState } from "react";
import { ChevronDown, ChevronUp, Check, Plus, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Methodology, FamilyMethodology, MethodologyCompatibility } from "@/lib/types";
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  INTENSITY_LABELS,
  COST_LABELS,
  PRIORITY_LABELS,
  COMPATIBILITY_LABELS,
} from "./constants";
import { cn } from "@/lib/utils";

interface Props {
  methodology: Methodology;
  familyMethodology?: FamilyMethodology;  // defined = selected
  familyMethodologies: FamilyMethodology[]; // all selected, for compatibility display
  compatibility: MethodologyCompatibility[];
  onSelect: () => void;
  onDeselect: () => void;
  isPending: boolean;
}

export function MethodologyCard({
  methodology,
  familyMethodology,
  familyMethodologies,
  compatibility,
  onSelect,
  onDeselect,
  isPending,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const isSelected = !!familyMethodology;
  const priority = familyMethodology?.priority;

  const catColors = CATEGORY_COLORS[methodology.category] ?? CATEGORY_COLORS['contemporaneo'];

  // Compatibility with already-selected methodologies (excluding self)
  const compatibilityWithSelected = familyMethodologies
    .filter((fm) => fm.methodology_id !== methodology.id)
    .map((fm) => {
      const pair = compatibility.find(
        (c) =>
          (c.methodology_a_id === methodology.id && c.methodology_b_id === fm.methodology_id) ||
          (c.methodology_a_id === fm.methodology_id && c.methodology_b_id === methodology.id)
      );
      return { fm, pair };
    })
    .filter(({ pair }) => !!pair);

  return (
    <div
      className={cn(
        "rounded-2xl border bg-card transition-all duration-200",
        isSelected
          ? "ring-2 ring-primary shadow-md"
          : "hover:shadow-sm",
        !isSelected && catColors.card,
      )}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="p-5">
        {/* Top row: category + priority badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
              catColors.badge
            )}
          >
            {CATEGORY_LABELS[methodology.category]}
          </span>

          {isSelected && priority && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 text-xs font-semibold shrink-0">
              <span className="h-4 w-4 rounded-full gradient-warmth text-white text-[10px] flex items-center justify-center font-bold">
                {priority}
              </span>
              {PRIORITY_LABELS[priority]}
            </span>
          )}
        </div>

        {/* Name */}
        <h3 className="font-heading font-semibold text-base leading-snug mb-1">
          {methodology.name}
        </h3>

        {/* Short description */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
          {methodology.short_description}
        </p>

        {/* Chips: age, intensity, cost */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="text-xs rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
            {methodology.age_min}–{methodology.age_max} anos
          </span>
          <span className="text-xs rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
            {INTENSITY_LABELS[methodology.intensity]}
          </span>
          <span className="text-xs rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
            {COST_LABELS[methodology.materials_cost]}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isSelected ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onDeselect}
              disabled={isPending}
              className="text-muted-foreground border-muted-foreground/30 hover:border-destructive hover:text-destructive"
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              Selecionada
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onSelect}
              disabled={isPending}
              className="gradient-warmth text-white border-0 hover:opacity-90"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Selecionar
            </Button>
          )}

          <button
            onClick={() => setExpanded((v) => !v)}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            {expanded ? (
              <>Menos <ChevronUp className="h-3.5 w-3.5" /></>
            ) : (
              <>Saber mais <ChevronDown className="h-3.5 w-3.5" /></>
            )}
          </button>
        </div>
      </div>

      {/* ── Expanded content ────────────────────────────────────────────── */}
      {expanded && (
        <div className="border-t px-5 py-4 space-y-4">
          {/* Philosophy summary */}
          {methodology.philosophy_summary && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {methodology.philosophy_summary}
            </p>
          )}

          {/* Principles */}
          {methodology.methodology_principles &&
            methodology.methodology_principles.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Princípios
                </p>
                <ul className="space-y-2">
                  {methodology.methodology_principles
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((p) => (
                      <li key={p.id} className="text-sm">
                        <span className="font-medium">{p.title}</span>
                        {p.description && (
                          <span className="text-muted-foreground"> — {p.description}</span>
                        )}
                      </li>
                    ))}
                </ul>
              </div>
            )}

          {/* AI style preview */}
          {methodology.ai_generation_style && (
            <div className="rounded-xl bg-muted/60 px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <p className="text-xs font-semibold text-primary">Como a IA vai usar esta metodologia</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                {methodology.ai_generation_style}
              </p>
            </div>
          )}

          {/* Compatibility with selected */}
          {compatibilityWithSelected.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Compatibilidade com as tuas seleções
              </p>
              <div className="flex flex-wrap gap-2">
                {compatibilityWithSelected.map(({ fm, pair }) => {
                  const level = pair!.compatibility_level as keyof typeof COMPATIBILITY_LABELS;
                  const style = COMPATIBILITY_LABELS[level] ?? COMPATIBILITY_LABELS['media'];
                  const name = fm.methodology?.name ?? "Metodologia";
                  return (
                    <span
                      key={fm.id}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
                        style.color
                      )}
                    >
                      {name.split(" ")[0]} — {style.label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
