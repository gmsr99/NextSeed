import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { type Mission } from "@/lib/worldMissionsContent";
import { type MissionPoints } from "@/hooks/useWorldMissions";

const FEELINGS = [
  { emoji: "😊", label: "Feliz" },
  { emoji: "💪", label: "Orgulhoso" },
  { emoji: "😌", label: "Tranquilo" },
  { emoji: "🤔", label: "Pensativo" },
  { emoji: "😅", label: "Desafiado" },
  { emoji: "🌟", label: "Inspirado" },
];

interface Child {
  id: string;
  name: string;
}

interface ReflectionDialogProps {
  mission: Mission | null;
  open: boolean;
  onClose: () => void;
  onComplete: (childId: string, feeling: string, learning: string) => void;
  previewPoints: MissionPoints | null;
  children: Child[];
}

export function ReflectionDialog({
  mission,
  open,
  onClose,
  onComplete,
  previewPoints,
  children,
}: ReflectionDialogProps) {
  const [step, setStep] = useState<"reflect" | "done">("reflect");
  const [selectedChild, setSelectedChild] = useState(children[0]?.id ?? "");
  const [selectedFeeling, setSelectedFeeling] = useState("");
  const [learning, setLearning] = useState("");
  const [earnedPoints, setEarnedPoints] = useState<MissionPoints | null>(null);

  const handleSubmit = () => {
    onComplete(selectedChild, selectedFeeling, learning);
    setEarnedPoints(previewPoints);
    setStep("done");
  };

  const handleClose = () => {
    setStep("reflect");
    setSelectedChild(children[0]?.id ?? "");
    setSelectedFeeling("");
    setLearning("");
    setEarnedPoints(null);
    onClose();
  };

  if (!mission) return null;

  const totalEarned = earnedPoints
    ? Object.values(earnedPoints).reduce((a, b) => a + b, 0)
    : 0;

  const canSubmit = selectedChild && selectedFeeling;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md rounded-3xl border-border p-0 overflow-hidden shadow-elevated">
        <AnimatePresence mode="wait">
          {step === "reflect" ? (
            <motion.div
              key="reflect"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="p-6 space-y-5"
            >
              {/* Header */}
              <div className="text-center space-y-1.5">
                <span className="text-4xl">{mission.icon}</span>
                <h2 className="font-heading text-xl font-bold text-foreground">
                  Missão concluída!
                </h2>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{mission.name}</span>
                </p>
              </div>

              {/* Child selector */}
              {children.length > 1 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Quem fez a missão?</p>
                  <div className="flex gap-2">
                    {children.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedChild(c.id)}
                        className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                          selectedChild === c.id
                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                            : "border-border bg-card text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        {c.name.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Feeling */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Como te sentiste?</p>
                <div className="grid grid-cols-3 gap-2">
                  {FEELINGS.map((f) => (
                    <button
                      key={f.label}
                      onClick={() => setSelectedFeeling(f.label)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-medium transition-all duration-200 ${
                        selectedFeeling === f.label
                          ? "border-primary bg-primary/10 text-primary shadow-sm scale-105"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-muted"
                      }`}
                    >
                      <span className="text-2xl">{f.emoji}</span>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Learning */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  O que aprendeste? <span className="text-muted-foreground font-normal">(opcional)</span>
                </p>
                <textarea
                  value={learning}
                  onChange={(e) => setLearning(e.target.value)}
                  placeholder="Escreve aqui o que descobriste…"
                  rows={3}
                  className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none transition"
                />
              </div>

              {/* Points preview */}
              {previewPoints && (
                <div className="bg-muted/40 rounded-2xl p-3 flex items-center gap-3">
                  <span className="text-2xl">✨</span>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Vais ganhar {Object.values(previewPoints).reduce((a, b) => a + b, 0)} pontos
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Responsabilidade · Autonomia · Cooperação
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 rounded-xl border border-border py-2.5 text-sm text-muted-foreground hover:bg-muted transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="flex-1 rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-semibold hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Concluir missão
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center space-y-5"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                className="text-6xl"
              >
                🌟
              </motion.div>
              <div className="space-y-1">
                <h2 className="font-heading text-2xl font-bold text-foreground">Fantástico!</h2>
                <p className="text-muted-foreground text-sm">
                  Cada missão que completas muda o teu mundo um pouco mais.
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-primary/10 rounded-2xl p-4"
              >
                <p className="font-heading text-3xl font-bold text-primary">
                  +{totalEarned} pontos
                </p>
                <p className="text-xs text-muted-foreground mt-1">adicionados ao portfólio</p>
              </motion.div>

              <button
                onClick={handleClose}
                className="w-full rounded-xl bg-foreground text-background py-2.5 text-sm font-semibold hover:opacity-90 transition"
              >
                Continuar
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
