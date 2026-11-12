import { describe, it, expect } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TagInput, { splitTags, mergeTags } from "../TagInput";
import SchoolYearScopeNotice, { hasCurriculum } from "../SchoolYearScopeNotice";

function Harness() {
  const [value, setValue] = useState<string[]>([]);
  return (
    <>
      <TagInput value={value} onChange={setValue} placeholder="interesses" />
      <output data-testid="value">{value.join("|")}</output>
    </>
  );
}

describe("TagInput (T-06)", () => {
  it("separa por vírgulas e ignora repetidos", () => {
    expect(splitTags("vulcões, Sonic; dinossauros ,")).toEqual(["vulcões", "Sonic", "dinossauros"]);
    expect(mergeTags(["Sonic"], ["sonic", "Lego"])).toEqual(["Sonic", "Lego"]);
  });

  it("aceita vários interesses escritos com vírgulas", () => {
    render(<Harness />);
    const input = screen.getByPlaceholderText("interesses");
    fireEvent.change(input, { target: { value: "vulcões, Sonic," } });
    expect(screen.getByTestId("value").textContent).toBe("vulcões|Sonic");
  });

  it("guarda o que ficou escrito ao sair do campo (telemóveis sem Enter)", () => {
    render(<Harness />);
    const input = screen.getByPlaceholderText("interesses");
    fireEvent.change(input, { target: { value: "dinossauros" } });
    fireEvent.blur(input);
    expect(screen.getByTestId("value").textContent).toBe("dinossauros");
  });

  it("Enter continua a funcionar", () => {
    render(<Harness />);
    const input = screen.getByPlaceholderText("interesses");
    fireEvent.change(input, { target: { value: "Lego" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByTestId("value").textContent).toBe("Lego");
  });
});

describe("SchoolYearScopeNotice (T-09)", () => {
  it("só avisa para anos sem currículo", () => {
    expect(hasCurriculum("4º ano")).toBe(true);
    expect(hasCurriculum("5º ano")).toBe(false);
    const { container, rerender } = render(<SchoolYearScopeNotice schoolYear="2º ano" />);
    expect(container.textContent).toBe("");
    rerender(<SchoolYearScopeNotice schoolYear="6º ano" />);
    expect(container.textContent).toContain("6º ano");
  });
});
