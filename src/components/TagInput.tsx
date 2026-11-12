import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

/** Separa "vulcões, Sonic; dinossauros" em ["vulcões", "Sonic", "dinossauros"]. */
export function splitTags(text: string): string[] {
  return text
    .split(/[,;\n]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Junta tags novas às existentes, sem repetidos (ignora maiúsculas). */
export function mergeTags(current: string[], incoming: string[]): string[] {
  const out = [...current];
  for (const tag of incoming) {
    if (!out.some((t) => t.toLowerCase() === tag.toLowerCase())) out.push(tag);
  }
  return out;
}

// Vários interesses: separar por vírgula, Enter, botão "+" ou simplesmente sair
// do campo. Em muitos teclados de telemóvel o Enter não chega à página, por isso
// o texto nunca pode ficar preso no campo sem ser guardado (feedback F-04, T-06).
const TagInput = ({ value, onChange, placeholder = "Escreve e pressiona Enter" }: TagInputProps) => {
  const [input, setInput] = useState("");

  const commit = (text: string) => {
    const tags = splitTags(text);
    if (tags.length) onChange(mergeTags(value, tags));
    setInput("");
  };

  const handleChange = (text: string) => {
    // Uma vírgula ou ponto e vírgula fecha o interesse escrito até aí
    if (/[,;]/.test(text)) {
      const parts = text.split(/[,;]/);
      const rest = parts.pop() ?? "";
      const tags = splitTags(parts.join(","));
      if (tags.length) onChange(mergeTags(value, tags));
      setInput(rest.trimStart());
      return;
    }
    setInput(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      commit(input);
    }
    if (e.key === "Backspace" && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 min-h-[40px]">
      {value.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1 text-xs">
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="hover:text-destructive"
            aria-label={`Remover ${tag}`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Input
        value={input}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => commit(input)}
        enterKeyHint="done"
        placeholder={value.length === 0 ? placeholder : ""}
        className="border-0 p-0 h-auto shadow-none focus-visible:ring-0 flex-1 min-w-[120px] text-sm"
      />
      {input.trim() && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-1.5"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => commit(input)}
          aria-label="Adicionar interesse"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
};

export default TagInput;
