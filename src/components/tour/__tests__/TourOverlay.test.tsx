import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TourProvider, useTour } from "@/contexts/TourContext";
import TourOverlay from "../TourOverlay";
import { getSeenTours, markTourSeen } from "@/lib/tours";
import { track } from "@/lib/analytics";

vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user-tour-test" },
    family: { id: "fam-1", onboarding_completed_at: "2026-01-01T00:00:00Z" },
  }),
}));

// jsdom não implementa APIs de layout usadas pelo overlay.
beforeEach(() => {
  localStorage.clear();
  vi.mocked(track).mockClear();
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.getClientRects = vi
    .fn()
    .mockReturnValue([{ width: 100, height: 40 }] as unknown as DOMRectList);
  window.requestAnimationFrame = (cb: FrameRequestCallback) =>
    setTimeout(() => cb(performance.now()), 0) as unknown as number;
});

function StartButton() {
  const { startTour, startTourIfUnseen, activeTour } = useTour();
  return (
    <div>
      <button onClick={() => startTour("diario")}>arrancar-tour</button>
      <button onClick={() => startTourIfUnseen("diario")}>arrancar-se-novo</button>
      <span data-testid="active">{activeTour?.id ?? "nenhum"}</span>
    </div>
  );
}

/** Página fictícia com as âncoras do tour do Diário. */
function Harness() {
  return (
    <MemoryRouter initialEntries={["/settings"]}>
      <TourProvider>
        <StartButton />
        <div data-tour="diario-form">form</div>
        <div data-tour="diario-fotos">fotos</div>
        <div data-tour="diario-guardar">guardar</div>
        <TourOverlay />
      </TourProvider>
    </MemoryRouter>
  );
}

describe("motor das visitas guiadas (TourProvider + TourOverlay)", () => {
  it("arranca, avança, recua e conclui — marcando o tour como visto", async () => {
    render(<Harness />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("arrancar-tour"));

    // Passo 1 — centrado, sem alvo
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("O Diário 📔")).toBeInTheDocument();
    expect(track).toHaveBeenCalledWith("tour_started", { tour: "diario" });
    // Visto logo no arranque — um tour interrompido não volta a impor-se
    expect(Object.keys(getSeenTours("user-tour-test"))).toContain("diario");

    // Passo 2 — ancorado a [data-tour="diario-form"]
    fireEvent.click(screen.getByText("Seguinte"));
    expect(await screen.findByText("Registo rápido")).toBeInTheDocument();

    // Recuar volta ao passo 1
    fireEvent.click(screen.getByText("Anterior"));
    expect(await screen.findByText("O Diário 📔")).toBeInTheDocument();

    // Até ao fim: 4 passos
    fireEvent.click(screen.getByText("Seguinte"));
    await screen.findByText("Registo rápido");
    fireEvent.click(screen.getByText("Seguinte"));
    await screen.findByText("Fotos valem ouro");
    fireEvent.click(screen.getByText("Seguinte"));
    await screen.findByText("Direto ao Portfólio");

    fireEvent.click(screen.getByText("Concluir"));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(track).toHaveBeenCalledWith("tour_completed", {
      tour: "diario",
      step: 4,
      total_steps: 4,
    });
  });

  it("Escape sai do tour e regista tour_dismissed", async () => {
    render(<Harness />);
    fireEvent.click(screen.getByText("arrancar-tour"));
    await screen.findByRole("dialog");

    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(track).toHaveBeenCalledWith(
      "tour_dismissed",
      expect.objectContaining({ tour: "diario" }),
    );
  });

  it("startTourIfUnseen não repete um tour já visto", async () => {
    markTourSeen("user-tour-test", "diario");
    render(<Harness />);

    fireEvent.click(screen.getByText("arrancar-se-novo"));
    expect(screen.getByTestId("active")).toHaveTextContent("nenhum");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // O arranque manual (menu de ajuda) continua a funcionar
    fireEvent.click(screen.getByText("arrancar-tour"));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });
});
