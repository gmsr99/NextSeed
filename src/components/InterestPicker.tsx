import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Taxonomia de interesses ─────────────────────────────────────────────────
// Vocabulário controlado → a IA pode mapear estes termos de forma fiável para
// atividades de metodologia e domínios do DGE.

const CATEGORIES = [
  {
    label: "Natureza",
    interests: ["Animais", "Plantas", "Jardim", "Astronomia", "Oceanos", "Insetos", "Geologia", "Meteorologia"],
  },
  {
    label: "Arte & Criatividade",
    interests: ["Desenho", "Pintura", "Música", "Teatro", "Dança", "Escultura", "Fotografia", "Artesanato"],
  },
  {
    label: "Ciências",
    interests: ["Experiências", "Robótica", "Matemática", "Biologia", "Física", "Química"],
  },
  {
    label: "Corpo & Movimento",
    interests: ["Futebol", "Natação", "Ginástica", "Ciclismo", "Artes Marciais", "Yoga"],
  },
  {
    label: "Mundo & Cultura",
    interests: ["História", "Geografia", "Culinária", "Línguas", "Viagens", "Tradições", "Arqueologia"],
  },
  {
    label: "Tecnologia",
    interests: ["Programação", "Jogos Digitais", "Cinema & Vídeo", "3D & Impressão"],
  },
  {
    label: "Leitura & Escrita",
    interests: ["Leitura", "Escrita Criativa", "Poesia", "Banda Desenhada", "Storytelling"],
  },
  {
    label: "Social",
    interests: ["Jogos de Tabuleiro", "LEGO & Construção", "Voluntariado", "Cuidar de Animais"],
  },
] as const;

const ALL_CURATED = CATEGORIES.flatMap((c) => c.interests as unknown as string[]);

// ─── Componente ──────────────────────────────────────────────────────────────

interface InterestPickerProps {
  value: string[];
  onChange: (interests: string[]) => void;
}

export default function InterestPicker({ value, onChange }: InterestPickerProps) {
  const [activeCategory, setActiveCategory] = useState<string>("Todos");
  const [customInput, setCustomInput] = useState("");

  const toggle = (interest: string) => {
    onChange(
      value.includes(interest)
        ? value.filter((i) => i !== interest)
        : [...value, interest]
    );
  };

  const remove = (interest: string) => onChange(value.filter((i) => i !== interest));

  const addCustom = () => {
    const trimmed = customInput.trim();
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed]);
    setCustomInput("");
  };

  const visibleInterests =
    activeCategory === "Todos"
      ? ALL_CURATED
      : (CATEGORIES.find((c) => c.label === activeCategory)?.interests as unknown as string[]) ?? [];

  return (
    <div className="space-y-3">
      {/* Interesses selecionados */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((interest) => (
            <Badge
              key={interest}
              className="gap-1 pr-1 gradient-warmth text-white border-0 text-xs font-medium"
            >
              {interest}
              <button
                type="button"
                onClick={() => remove(interest)}
                className="ml-0.5 rounded-full hover:bg-white/25 p-0.5 transition-colors"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Filtro por categoria */}
      <div className="flex flex-wrap gap-1.5">
        {["Todos", ...CATEGORIES.map((c) => c.label)].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "text-xs px-2.5 py-1 rounded-full border font-medium transition-all duration-150",
              activeCategory === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grelha de chips */}
      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
        {visibleInterests.map((interest) => {
          const selected = value.includes(interest);
          return (
            <button
              key={interest}
              type="button"
              onClick={() => toggle(interest)}
              className={cn(
                "text-xs px-2.5 py-1 rounded-full border flex items-center gap-1 transition-all duration-150",
                selected
                  ? "bg-primary/10 border-primary text-primary font-semibold"
                  : "border-border text-foreground hover:border-primary/40 hover:bg-accent"
              )}
            >
              {selected && <Check className="h-2.5 w-2.5 shrink-0" />}
              {interest}
            </button>
          );
        })}
      </div>

      {/* Interesse personalizado */}
      <div className="flex gap-2">
        <Input
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          placeholder="Outro interesse..."
          className="h-8 text-sm"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addCustom}
          disabled={!customInput.trim()}
          className="h-8 px-2.5"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
