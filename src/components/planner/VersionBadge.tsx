import { useState, useEffect, useRef } from "react";
import { History, ChevronRight, Loader2, RotateCcw } from "lucide-react";

export interface VersionBadgeProps {
  version: number;
  history: Array<{ id: string; version: number; generated_at: string | null }>;
  isUnsaved: boolean;
  onRestore: (id: string) => Promise<void>;
}

export function VersionBadge({ version, history, isUnsaved, onRestore }: VersionBadgeProps) {
  const [open, setOpen] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (isUnsaved) {
    return (
      <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
        Plano ainda não guardado — clica em <strong>Guardar</strong> para criar a versão.
      </div>
    );
  }

  if (history.length === 0) return null;

  const hasOlderVersions = history.length > 1;

  const formatTs = (ts: string | null) => {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => hasOlderVersions && setOpen((v) => !v)}
        className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 border transition-colors ${
          hasOlderVersions
            ? "text-muted-foreground bg-muted/40 border-border/60 hover:bg-muted cursor-pointer"
            : "text-muted-foreground bg-muted/20 border-border/40 cursor-default"
        }`}
      >
        <History className="h-3.5 w-3.5 shrink-0" />
        <span>
          Versão <strong>{version}</strong>
          {history.length > 1 && <span className="ml-1">de {history.length}</span>}
          {history[0]?.generated_at && (
            <span className="ml-2 opacity-70">· {formatTs(history[0].generated_at)}</span>
          )}
        </span>
        {hasOlderVersions && (
          <ChevronRight className={`h-3 w-3 ml-auto transition-transform ${open ? "rotate-90" : ""}`} />
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-20 w-80 rounded-xl border border-border bg-popover shadow-lg p-2 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground px-2 pb-1">Histórico de versões</p>
          {history.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                entry.version === version
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <span className="shrink-0 w-16">Versão {entry.version}</span>
              <span className="flex-1 text-xs text-muted-foreground">{formatTs(entry.generated_at)}</span>
              {entry.version !== version && (
                <button
                  disabled={restoring !== null}
                  onClick={async () => {
                    setRestoring(entry.id);
                    await onRestore(entry.id);
                    setRestoring(null);
                    setOpen(false);
                  }}
                  className="flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50"
                >
                  {restoring === entry.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <RotateCcw className="h-3 w-3" />
                  )}
                  Restaurar
                </button>
              )}
              {entry.version === version && (
                <span className="text-xs text-primary/60">Atual</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
