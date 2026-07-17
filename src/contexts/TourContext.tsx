import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { track } from "@/lib/analytics";
import {
  TOURS,
  getTour,
  getSeenTours,
  markTourSeen,
  type TourDef,
  type TourId,
  type TourStep,
} from "@/lib/tours";

// ─── TourProvider ─────────────────────────────────────────────────────────────
// Orquestra as visitas guiadas: arranque automático na primeira visita a cada
// página (depois do onboarding), arranque manual via menu de ajuda, avanço/recuo
// de passos e persistência do que já foi visto (localStorage por utilizador).
// O rendering do spotlight vive em TourOverlay.

interface TourContextValue {
  activeTour: TourDef | null;
  /** Passos efetivos do tour ativo (os desktopOnly são filtrados em mobile). */
  steps: TourStep[];
  stepIndex: number;
  /** Arranque manual (menu de ajuda) — navega para a rota do tour se preciso. */
  startTour: (id: TourId) => void;
  /** Arranque automático — só se o utilizador ainda não viu este tour. */
  startTourIfUnseen: (id: TourId) => void;
  nextStep: () => void;
  prevStep: () => void;
  endTour: (reason: "completed" | "dismissed") => void;
  /** Consulta estável (via ref) para código com closures antigas (FeedbackContext). */
  isTourActive: () => boolean;
}

const TourContext = createContext<TourContextValue | null>(null);

/** Delay antes do arranque automático — deixa a página assentar (dados, layout). */
const AUTO_START_DELAY_MS = 900;

interface ActiveState {
  tour: TourDef;
  steps: TourStep[];
}

export function TourProvider({ children }: { children: React.ReactNode }) {
  const { user, family } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [active, setActive] = useState<ActiveState | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  // Refs espelho — evitam closures obsoletas em timeouts e callbacks estáveis.
  const activeRef = useRef<ActiveState | null>(null);
  activeRef.current = active;
  const stepIndexRef = useRef(0);
  stepIndexRef.current = stepIndex;

  const isTourActive = useCallback(() => activeRef.current !== null, []);

  const startTour = useCallback(
    (id: TourId) => {
      const tour = getTour(id);
      if (!tour) return;
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      const steps = tour.steps.filter((s) => !(s.desktopOnly && isMobile));
      if (steps.length === 0) return;
      // Marcado como visto logo no arranque: um tour interrompido a meio
      // (reload, back) não volta a impor-se sozinho.
      if (user) markTourSeen(user.id, id);
      if (location.pathname !== tour.route) navigate(tour.route);
      setActive({ tour, steps });
      setStepIndex(0);
      track("tour_started", { tour: id });
    },
    [user, location.pathname, navigate],
  );

  const startTourIfUnseen = useCallback(
    (id: TourId) => {
      if (!user || activeRef.current) return;
      if (getSeenTours(user.id)[id]) return;
      startTour(id);
    },
    [user, startTour],
  );

  const endTour = useCallback((reason: "completed" | "dismissed") => {
    const cur = activeRef.current;
    if (!cur) return;
    track(reason === "completed" ? "tour_completed" : "tour_dismissed", {
      tour: cur.tour.id,
      step: stepIndexRef.current + 1,
      total_steps: cur.steps.length,
    });
    setActive(null);
    setStepIndex(0);
  }, []);

  const nextStep = useCallback(() => {
    const cur = activeRef.current;
    if (!cur) return;
    if (stepIndexRef.current >= cur.steps.length - 1) endTour("completed");
    else setStepIndex((i) => i + 1);
  }, [endTour]);

  const prevStep = useCallback(() => {
    if (!activeRef.current) return;
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  // Arranque automático na primeira visita a rotas com tour autoStart.
  // Os tours do planeador arrancam a partir da própria página (dependem do
  // estado form/preview), via startTourIfUnseen.
  useEffect(() => {
    if (!user || !family?.onboarding_completed_at) return;
    if (activeRef.current) return;
    const tour = TOURS.find((t) => t.autoStart && t.route === location.pathname);
    if (!tour || getSeenTours(user.id)[tour.id]) return;
    const timer = setTimeout(() => {
      if (!activeRef.current) startTour(tour.id);
    }, AUTO_START_DELAY_MS);
    return () => clearTimeout(timer);
  }, [location.pathname, user, family, startTour]);

  return (
    <TourContext.Provider
      value={{
        activeTour: active?.tour ?? null,
        steps: active?.steps ?? [],
        stepIndex,
        startTour,
        startTourIfUnseen,
        nextStep,
        prevStep,
        endTour,
        isTourActive,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used inside TourProvider");
  return ctx;
}
