import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Download, AlertTriangle } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import { useIsTeamAdmin } from "@/hooks/useIsTeamAdmin";

// ─── Tipos locais ─────────────────────────────────────────────────────────────
interface Submission {
  id: string;
  user_id: string;
  instrument: string;
  status: string;
  evento_gatilho: string | null;
  ecra_origem: string | null;
  app_version: string | null;
  created_at: string;
}
interface Answer {
  submission_id: string;
  question_key: string;
  value: unknown;
}

// Torna um valor jsonb de resposta legível.
function renderAnswer(value: unknown): string {
  if (value == null) return "";
  if (typeof value !== "object") return String(value);
  const v = value as Record<string, unknown>;
  if (typeof v.text === "string") return v.text;
  if (typeof v.choice === "string") return v.choice;
  if (Array.isArray(v.choices)) {
    const base = (v.choices as string[]).join(", ");
    return v.other ? `${base} (Outra: ${v.other})` : base;
  }
  if (typeof v.number === "number") return `${v.number} €`;
  if (typeof v.screenshot_path === "string") return "[screenshot]";
  return JSON.stringify(value);
}

function csvEscape(s: string): string {
  return `"${s.replace(/"/g, '""')}"`;
}

const INSTRUMENT_LABELS: Record<string, string> = {
  A: "A — Boas-vindas", B1: "B1 — Pós-plano", B2: "B2 — Fim de semana",
  B3: "B3 — Documento", B4: "B4 — Ideias IA", B5: "B5 — Comunidade",
  C: "C — Pulso mensal", D: "D — Conta-nos",
};

export default function AdminFeedback() {
  const { isAdmin, isLoading: adminLoading } = useIsTeamAdmin();
  const qc = useQueryClient();

  const [instrumentFilter, setInstrumentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [userFilter, setUserFilter] = useState<string>("all");

  const submissionsQ = useQuery({
    queryKey: ["admin-feedback-submissions"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data } = await supabase
        .from("feedback_submissions")
        .select("id, user_id, instrument, status, evento_gatilho, ecra_origem, app_version, created_at")
        .order("created_at", { ascending: false })
        .limit(2000);
      return (data ?? []) as Submission[];
    },
  });

  const answersQ = useQuery({
    queryKey: ["admin-feedback-answers"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data } = await supabase
        .from("feedback_answers")
        .select("submission_id, question_key, value")
        .limit(10000);
      return (data ?? []) as Answer[];
    },
  });

  const familiesQ = useQuery({
    queryKey: ["admin-feedback-families"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data } = await supabase.from("families").select("user_id, email, name");
      return (data ?? []) as { user_id: string; email: string | null; name: string | null }[];
    },
  });

  const metricsQ = useQuery({
    queryKey: ["admin-weekly-metrics"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data } = await supabase.rpc("admin_weekly_metrics", { p_weeks: 8 });
      return data ?? [];
    },
  });

  const funnelQ = useQuery({
    queryKey: ["admin-funnel"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data } = await supabase.rpc("admin_funnel");
      return (data ?? [])[0] ?? null;
    },
  });

  const configQ = useQuery({
    queryKey: ["admin-config-pricing"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data } = await supabase
        .from("feedback_config")
        .select("value")
        .eq("key", "pricing_question_active")
        .maybeSingle();
      return data?.value === true;
    },
  });

  const answersBySubmission = useMemo(() => {
    const map = new Map<string, Answer[]>();
    for (const a of answersQ.data ?? []) {
      const arr = map.get(a.submission_id) ?? [];
      arr.push(a);
      map.set(a.submission_id, arr);
    }
    return map;
  }, [answersQ.data]);

  const userLabel = useMemo(() => {
    const map = new Map<string, string>();
    for (const f of familiesQ.data ?? []) {
      if (f.user_id) map.set(f.user_id, f.email ?? f.name ?? f.user_id);
    }
    return map;
  }, [familiesQ.data]);

  const userOptions = useMemo(() => {
    const ids = new Set((submissionsQ.data ?? []).map((s) => s.user_id));
    return [...ids].map((id) => ({ id, label: userLabel.get(id) ?? id.slice(0, 8) }));
  }, [submissionsQ.data, userLabel]);

  const filtered = useMemo(() => {
    return (submissionsQ.data ?? []).filter((s) => {
      if (instrumentFilter !== "all" && s.instrument !== instrumentFilter) return false;
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (userFilter !== "all" && s.user_id !== userFilter) return false;
      if (fromDate && s.created_at < fromDate) return false;
      if (toDate && s.created_at > `${toDate}T23:59:59`) return false;
      return true;
    });
  }, [submissionsQ.data, instrumentFilter, statusFilter, userFilter, fromDate, toDate]);

  const alerts = useMemo(() => {
    return (submissionsQ.data ?? []).filter((s) => {
      const ans = answersBySubmission.get(s.id) ?? [];
      if (s.instrument === "A") {
        return ans.some((a) => a.question_key === "A_Q2" && renderAnswer(a.value) === "Tentei mas não consegui");
      }
      if (s.instrument === "D") {
        return ans.some((a) => a.question_key === "D_tipo" && renderAnswer(a.value) === "Algo não funciona");
      }
      return false;
    });
  }, [submissionsQ.data, answersBySubmission]);

  const exportCSV = () => {
    const header = ["submission_id", "instrumento", "estado", "utilizador", "data", "ecra", "gatilho", "versao", "pergunta", "resposta"];
    const rows: string[] = [header.map(csvEscape).join(",")];
    for (const s of filtered) {
      const ans = answersBySubmission.get(s.id) ?? [];
      const user = userLabel.get(s.user_id) ?? s.user_id;
      if (ans.length === 0) {
        rows.push([s.id, s.instrument, s.status, user, s.created_at, s.ecra_origem ?? "", s.evento_gatilho ?? "", s.app_version ?? "", "", ""].map((x) => csvEscape(String(x))).join(","));
      }
      for (const a of ans) {
        rows.push([s.id, s.instrument, s.status, user, s.created_at, s.ecra_origem ?? "", s.evento_gatilho ?? "", s.app_version ?? "", a.question_key, renderAnswer(a.value)].map((x) => csvEscape(String(x))).join(","));
      }
    }
    const blob = new Blob(["﻿" + rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `nexseed-feedback-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const togglePricing = async (on: boolean) => {
    await supabase.from("feedback_config").update({ value: on }).eq("key", "pricing_question_active");
    qc.invalidateQueries({ queryKey: ["admin-config-pricing"] });
  };

  if (adminLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </AppLayout>
    );
  }
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Feedback da equipa</h1>
          <p className="text-muted-foreground mt-1">Respostas dos instrumentos, alertas e métricas do piloto.</p>
        </div>

        <Tabs defaultValue="respostas">
          <TabsList>
            <TabsTrigger value="respostas">Respostas</TabsTrigger>
            <TabsTrigger value="alertas">Alertas {alerts.length > 0 && <Badge variant="destructive" className="ml-2">{alerts.length}</Badge>}</TabsTrigger>
            <TabsTrigger value="metricas">Métricas</TabsTrigger>
          </TabsList>

          {/* ─── Respostas ─── */}
          <TabsContent value="respostas" className="space-y-4">
            <div className="flex flex-wrap gap-2 items-end">
              <Select value={instrumentFilter} onValueChange={setInstrumentFilter}>
                <SelectTrigger className="w-44"><SelectValue placeholder="Instrumento" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os instrumentos</SelectItem>
                  {Object.entries(INSTRUMENT_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Estado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os estados</SelectItem>
                  <SelectItem value="shown">Mostrado</SelectItem>
                  <SelectItem value="partial">Parcial</SelectItem>
                  <SelectItem value="completed">Completo</SelectItem>
                  <SelectItem value="dismissed">Descartado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Utilizador" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os utilizadores</SelectItem>
                  {userOptions.map((u) => <SelectItem key={u.id} value={u.id}>{u.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-40" />
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-40" />
              <Button onClick={exportCSV} variant="outline" className="gap-2 ml-auto">
                <Download className="h-4 w-4" /> Exportar CSV
              </Button>
            </div>

            {submissionsQ.isLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <SubmissionsTable submissions={filtered} answersBySubmission={answersBySubmission} userLabel={userLabel} />
            )}
          </TabsContent>

          {/* ─── Alertas ─── */}
          <TabsContent value="alertas" className="space-y-4">
            {alerts.length === 0 ? (
              <Card><CardContent className="py-10 text-center text-muted-foreground">Sem alertas.</CardContent></Card>
            ) : (
              <SubmissionsTable submissions={alerts} answersBySubmission={answersBySubmission} userLabel={userLabel} highlight />
            )}
          </TabsContent>

          {/* ─── Métricas ─── */}
          <TabsContent value="metricas" className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <StatCard label="Registos" value={funnelQ.data?.registos ?? "—"} />
              <StatCard label="Com 1.º plano" value={funnelQ.data?.com_primeiro_plano ?? "—"} />
              <StatCard label="Mediana registo→1.º plano" value={funnelQ.data?.mediana_horas != null ? `${funnelQ.data.mediana_horas} h` : "—"} />
            </div>

            <Card>
              <CardContent className="pt-6 overflow-x-auto">
                <h3 className="font-heading font-semibold mb-3">Painel semanal</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Semana</TableHead>
                      <TableHead>Famílias ativas</TableHead>
                      <TableHead>Planos gerados</TableHead>
                      <TableHead>Consultados a meio da semana</TableHead>
                      <TableHead>Taxa de edição</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(metricsQ.data ?? []).map((m: Record<string, unknown>) => (
                      <TableRow key={String(m.week_start)}>
                        <TableCell>{String(m.week_start)}</TableCell>
                        <TableCell>{String(m.active_families)}</TableCell>
                        <TableCell>{String(m.plans_generated)}</TableCell>
                        <TableCell>{String(m.plans_viewed_midweek)}</TableCell>
                        <TableCell>{m.plan_edit_rate != null ? String(m.plan_edit_rate) : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-heading font-semibold">Pergunta de preço (C7)</h3>
                  <p className="text-sm text-muted-foreground">Mostra a pergunta de valor mensal 1× por utilizador, a partir de agora.</p>
                </div>
                <Switch checked={configQ.data ?? false} onCheckedChange={togglePricing} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-2xl font-heading font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}

function SubmissionsTable({
  submissions,
  answersBySubmission,
  userLabel,
  highlight,
}: {
  submissions: Submission[];
  answersBySubmission: Map<string, Answer[]>;
  userLabel: Map<string, string>;
  highlight?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Instrumento</TableHead>
            <TableHead>Utilizador</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Respostas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((s) => {
            const ans = answersBySubmission.get(s.id) ?? [];
            return (
              <TableRow key={s.id} className={highlight ? "bg-destructive/5" : undefined}>
                <TableCell className="whitespace-nowrap">
                  {highlight && <AlertTriangle className="inline h-3.5 w-3.5 text-destructive mr-1" />}
                  {INSTRUMENT_LABELS[s.instrument] ?? s.instrument}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{userLabel.get(s.user_id) ?? s.user_id.slice(0, 8)}</TableCell>
                <TableCell><Badge variant="outline">{s.status}</Badge></TableCell>
                <TableCell className="text-sm whitespace-nowrap">{new Date(s.created_at).toLocaleString("pt-PT")}</TableCell>
                <TableCell className="text-sm max-w-md">
                  {ans.length === 0 ? <span className="text-muted-foreground">—</span> : (
                    <ul className="space-y-0.5">
                      {ans.map((a) => (
                        <li key={a.question_key}>
                          <span className="text-muted-foreground">{a.question_key}:</span> {renderAnswer(a.value)}
                        </li>
                      ))}
                    </ul>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
