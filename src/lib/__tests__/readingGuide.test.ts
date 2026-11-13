import { describe, it, expect } from "vitest";
import { splitInlineQuestion } from "@/components/pdf/ReadingGuidePDF";

describe("splitInlineQuestion", () => {
  it("tira a pergunta repetida do fim do texto", () => {
    expect(splitInlineQuestion("A Sofia saltou. | Pergunta: Quem saltou?")).toEqual(["A Sofia saltou.", "Quem saltou?"]);
  });
  it("deixa o texto normal intacto", () => {
    expect(splitInlineQuestion("A Sofia saltou.")).toEqual(["A Sofia saltou.", ""]);
  });
});
