import { describe, it, expect } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import InterestPicker from "../InterestPicker";

function Harness({ initial = [] as string[] }) {
  const [value, setValue] = useState<string[]>(initial);
  return (
    <>
      <InterestPicker value={value} onChange={setValue} />
      <output data-testid="value">{value.join("|")}</output>
    </>
  );
}

describe("InterestPicker", () => {
  it("permite escolher vários interesses da lista", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Animais" }));
    fireEvent.click(screen.getByRole("button", { name: "Desenho" }));
    fireEvent.click(screen.getByRole("button", { name: "Futebol" }));
    expect(screen.getByTestId("value").textContent).toBe("Animais|Desenho|Futebol");
  });
});
