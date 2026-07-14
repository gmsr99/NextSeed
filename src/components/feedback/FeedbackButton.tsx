import { MessageCircle } from "lucide-react";

// Botão flutuante permanente (Instrumento D). z-40 fica por baixo do
// CookieBanner (z-50), que só aparece até ser aceite.
export default function FeedbackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Conta-nos"
      className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition h-12 w-12 sm:w-auto sm:px-4 justify-center"
    >
      <MessageCircle className="h-5 w-5 shrink-0" />
      <span className="hidden sm:inline text-sm font-semibold pr-1">Conta-nos</span>
    </button>
  );
}
