import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTour } from "@/contexts/TourContext";
import { useIsMobile } from "@/hooks/use-mobile";

// ─── TourOverlay ──────────────────────────────────────────────────────────────
// Camada de walkthrough: escurece o ecrã, recorta um "spotlight" à volta do
// elemento [data-tour="…"] do passo atual e mostra um cartão com o conteúdo.
// O spotlight desliza de passo para passo (framer-motion). Alvos que não
// aparecem a tempo (página lenta, elemento ausente) são saltados sem bloquear.

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** Margem do recorte à volta do elemento destacado. */
const SPOT_PADDING = 8;
/** Tempo máximo à espera que o alvo de um passo apareça no DOM. */
const RESOLVE_TIMEOUT_MS = 4000;
const RESOLVE_INTERVAL_MS = 100;
const CARD_WIDTH = 340;
/** Altura estimada do cartão, para decidir se cabe abaixo/acima do alvo. */
const CARD_ESTIMATE_H = 240;

const BACKDROP = "rgba(30, 24, 15, 0.55)";

function toRect(r: DOMRect): Rect {
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

export default function TourOverlay() {
  const { activeTour, steps, stepIndex, nextStep, prevStep, endTour } = useTour();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const step = activeTour ? steps[stepIndex] : undefined;
  const isLast = stepIndex === steps.length - 1;

  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [resolving, setResolving] = useState(false);
  const targetElRef = useRef<HTMLElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Resolve o elemento-alvo do passo atual (com polling — dá tempo a páginas
  // lazy e a dados assíncronos). Alvos em falta saltam o passo.
  useEffect(() => {
    targetElRef.current = null;
    if (!activeTour) {
      setTargetRect(null);
      return;
    }
    if (!step?.target) {
      // Passo centrado — sem alvo.
      setTargetRect(null);
      setResolving(false);
      return;
    }
    setResolving(true);
    let cancelled = false;
    let tries = 0;
    const maxTries = Math.ceil(RESOLVE_TIMEOUT_MS / RESOLVE_INTERVAL_MS);

    const attempt = () => {
      if (cancelled) return;
      const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
      if (el && el.getClientRects().length > 0) {
        targetElRef.current = el;
        el.scrollIntoView({ block: "center", inline: "nearest" });
        requestAnimationFrame(() => {
          if (cancelled) return;
          setTargetRect(toRect(el.getBoundingClientRect()));
          setResolving(false);
        });
      } else if (++tries < maxTries) {
        setTimeout(attempt, RESOLVE_INTERVAL_MS);
      } else {
        nextStep(); // alvo nunca apareceu — segue em frente sem bloquear
      }
    };
    attempt();
    return () => {
      cancelled = true;
    };
  }, [activeTour, step, nextStep]);

  // Mantém o spotlight alinhado em scroll/resize.
  useEffect(() => {
    const update = () => {
      if (targetElRef.current) setTargetRect(toRect(targetElRef.current.getBoundingClientRect()));
    };
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, []);

  // Teclado: Esc sai, setas navegam.
  useEffect(() => {
    if (!activeTour) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") endTour("dismissed");
      else if (e.key === "ArrowRight") nextStep();
      else if (e.key === "ArrowLeft") prevStep();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeTour, nextStep, prevStep, endTour]);

  // Foco no cartão a cada passo (leitores de ecrã e teclado).
  useEffect(() => {
    if (!resolving) cardRef.current?.focus({ preventScroll: true });
  }, [stepIndex, resolving]);

  const finishWithCta = useCallback(() => {
    const route = activeTour?.finishCta?.route;
    endTour("completed");
    if (route) navigate(route);
  }, [activeTour, endTour, navigate]);

  if (!activeTour || !step) return null;

  const spot =
    step.target && targetRect
      ? {
          top: targetRect.top - SPOT_PADDING,
          left: targetRect.left - SPOT_PADDING,
          width: targetRect.width + SPOT_PADDING * 2,
          height: targetRect.height + SPOT_PADDING * 2,
        }
      : null;

  // Posição do cartão: abaixo do alvo; acima se não couber; centrado em baixo
  // para alvos gigantes; centrado no ecrã para passos sem alvo. Em mobile fica
  // sempre fixo em baixo — o spotlight indica o alvo.
  let cardStyle: React.CSSProperties;
  if (isMobile) {
    cardStyle = { bottom: 12, left: 12, right: 12 };
  } else if (!spot) {
    cardStyle = { top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: CARD_WIDTH };
  } else {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const left = clamp(spot.left + spot.width / 2 - CARD_WIDTH / 2, 12, vw - CARD_WIDTH - 12);
    const spaceBelow = vh - (spot.top + spot.height);
    if (spaceBelow >= CARD_ESTIMATE_H) {
      cardStyle = { top: spot.top + spot.height + 12, left, width: CARD_WIDTH };
    } else if (spot.top >= CARD_ESTIMATE_H) {
      cardStyle = { bottom: vh - spot.top + 12, left, width: CARD_WIDTH };
    } else {
      cardStyle = { bottom: 16, left: "50%", transform: "translateX(-50%)", width: CARD_WIDTH };
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100]"
      role="dialog"
      aria-modal="true"
      aria-label={`${activeTour.name} — passo ${stepIndex + 1} de ${steps.length}`}
      data-tour-overlay
    >
      {/* Backdrop com recorte: o box-shadow gigante escurece tudo menos o alvo. */}
      {spot ? (
        <motion.div
          className="absolute rounded-2xl ring-2 ring-white/60 pointer-events-none"
          initial={false}
          animate={{ top: spot.top, left: spot.left, width: spot.width, height: spot.height }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          style={{ boxShadow: `0 0 0 200vmax ${BACKDROP}` }}
        />
      ) : (
        <div className="absolute inset-0" style={{ background: BACKDROP }} />
      )}

      <AnimatePresence mode="wait">
        {!resolving && (
          <motion.div
            key={`${activeTour.id}-${stepIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="absolute bg-card text-card-foreground rounded-2xl border shadow-elevated p-5"
            style={cardStyle}
          >
          {/* O ref de foco vive num filho: AnimatePresence lê o ref do elemento
              filho direto e dispararia o warning de `element.ref` do React 18.3. */}
          <div ref={cardRef} tabIndex={-1} className="outline-none">
            <p className="text-xs font-semibold text-primary mb-1.5">
              {activeTour.name} · {stepIndex + 1}/{steps.length}
            </p>
            <h2 className="font-heading font-bold text-lg leading-snug">{step.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mt-1.5">{step.body}</p>

            {/* Progresso */}
            <div className="flex items-center gap-1.5 mt-4">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === stepIndex ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/25"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between gap-2 mt-4">
              {!isLast ? (
                <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => endTour("dismissed")}>
                  Sair
                </Button>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-2">
                {stepIndex > 0 && (
                  <Button variant="outline" size="sm" onClick={prevStep}>
                    Anterior
                  </Button>
                )}
                {!isLast ? (
                  <Button size="sm" onClick={nextStep}>
                    Seguinte
                  </Button>
                ) : activeTour.finishCta ? (
                  <>
                    <Button variant="outline" size="sm" onClick={() => endTour("completed")}>
                      Concluir
                    </Button>
                    <Button size="sm" onClick={finishWithCta}>
                      {activeTour.finishCta.label}
                    </Button>
                  </>
                ) : (
                  <Button size="sm" onClick={() => endTour("completed")}>
                    Concluir
                  </Button>
                )}
              </div>
            </div>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
