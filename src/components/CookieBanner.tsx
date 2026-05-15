import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

const STORAGE_KEY = "nexseed_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: true, at: new Date().toISOString() }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-3xl mx-auto bg-card border rounded-xl shadow-lg p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Cookie className="h-5 w-5 text-primary shrink-0 mt-0.5 sm:mt-0" />
        <p className="text-sm text-muted-foreground flex-1 leading-relaxed">
          Utilizamos cookies estritamente necessários para manter a tua sessão e preferências.
          Não usamos cookies de rastreamento ou publicidade. Ao continuar, aceitas o uso destes
          cookies conforme descrito na nossa{" "}
          <Link to="/privacidade" className="text-primary underline">
            Política de Privacidade
          </Link>.
        </p>
        <Button size="sm" onClick={accept} className="shrink-0">
          Aceitar
        </Button>
      </div>
    </div>
  );
}
