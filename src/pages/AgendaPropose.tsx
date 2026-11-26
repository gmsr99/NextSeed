// Propor um evento ou encontro para a Agenda (I-03a). Qualquer conta, grátis ou paga.
// Fica pendente até a equipa o publicar. Com ?editar=<id>, edita a própria proposta
// (o servidor volta a pô-la em triagem). Sem imagens nem anexos.
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useCommunityEvent, useCommunityEventMutations, type CommunityEventInput } from "@/hooks/useCommunityEvents";
import { CATEGORIES, type EventKind } from "@/lib/agenda";
import MunicipalityPicker from "@/components/agenda/MunicipalityPicker";
import { KIND_STYLE, localIsoDate, localTime } from "@/components/agenda/agendaUi";

interface FormState {
  kind: EventKind;
  title: string;
  description: string;
  organizer_name: string;
  municipality_code: string | null;
  venue: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  weekly: boolean;
  recurrence_until: string;
  all_ages: boolean;
  age_min: string;
  age_max: string;
  categories: string[];
  is_free: boolean;
  price_text: string;
  url: string;
  public_contact: string;
  declaration: boolean;
}

const EMPTY: FormState = {
  kind: "evento", title: "", description: "", organizer_name: "", municipality_code: null, venue: "",
  start_date: "", start_time: "", end_date: "", end_time: "", weekly: false, recurrence_until: "",
  all_ages: true, age_min: "", age_max: "", categories: [], is_free: true, price_text: "", url: "",
  public_contact: "", declaration: false,
};

function addMonths(iso: string, n: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setMonth(d.getMonth() + n);
  return localIsoDate(d);
}

/** Valida e converte o formulário. Devolve a lista de problemas ou os dados prontos. */
function toInput(f: FormState): { errors: string[]; input?: CommunityEventInput } {
  const errors: string[] = [];
  if (f.title.trim().length < 3) errors.push("Falta o título.");
  if (!f.description.trim()) errors.push("Falta uma descrição curta.");
  if (f.organizer_name.trim().length < 2) errors.push("Falta quem organiza.");
  if (!f.municipality_code) errors.push("Falta o concelho.");
  if (!f.start_date) errors.push("Falta a data.");
  if (f.categories.length === 0) errors.push("Escolham pelo menos uma categoria.");
  if (!f.declaration) errors.push("Falta confirmar a declaração no fim.");

  const allDay = !f.start_time;
  const endDate = f.end_date || f.start_date;
  const start = f.start_date ? new Date(`${f.start_date}T${allDay ? "00:00" : f.start_time}:00`) : null;
  const end = f.start_date ? new Date(`${endDate}T${allDay || !f.end_time ? (allDay ? "23:59" : f.start_time) : f.end_time}:00`) : null;
  if (start && end && end < start) errors.push("O fim é antes do início.");

  if (f.weekly) {
    if (!f.recurrence_until) errors.push("Digam até quando se repete.");
    else if (f.start_date && f.recurrence_until < f.start_date) errors.push("A repetição acaba antes de começar.");
    else if (f.start_date && f.recurrence_until > addMonths(f.start_date, 6)) errors.push("A repetição pode ir até 6 meses. Depois, é só voltar a propor.");
  }

  let ageMin: number | null = null;
  let ageMax: number | null = null;
  if (!f.all_ages) {
    ageMin = f.age_min === "" ? null : Number(f.age_min);
    ageMax = f.age_max === "" ? null : Number(f.age_max);
    const bad = (n: number | null) => n !== null && (!Number.isInteger(n) || n < 0 || n > 18);
    if (bad(ageMin) || bad(ageMax)) errors.push("As idades vão de 0 a 18.");
    if (ageMin !== null && ageMax !== null && ageMin > ageMax) errors.push("A idade mínima é maior do que a máxima.");
  }

  let url = f.url.trim();
  if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`;
  if (url.startsWith("http://")) url = `https://${url.slice(7)}`;
  if (url) {
    try {
      new URL(url);
    } catch {
      errors.push("A ligação não parece válida.");
    }
  }

  if (errors.length || !start || !end) return { errors };
  return {
    errors,
    input: {
      kind: f.kind,
      title: f.title.trim(),
      description: f.description.trim(),
      organizer_name: f.organizer_name.trim(),
      municipality_code: f.municipality_code!,
      venue: f.venue.trim() || null,
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      all_day: allDay,
      recurrence: f.weekly ? "weekly" : "none",
      recurrence_until: f.weekly ? f.recurrence_until : null,
      age_min: ageMin,
      age_max: ageMax,
      categories: f.categories,
      is_free: f.is_free,
      price_text: f.is_free ? null : f.price_text.trim() || null,
      url: url || null,
      public_contact: f.public_contact.trim() || null,
      source_url: null,
    },
  };
}

export default function AgendaPropose() {
  const [params] = useSearchParams();
  const editId = params.get("editar");
  const navigate = useNavigate();
  const { toast } = useToast();
  const existing = useCommunityEvent(editId);
  const { propose, update } = useCommunityEventMutations();
  const [f, setF] = useState<FormState>(EMPTY);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    const ev = existing.data;
    if (!ev) return;
    const s = new Date(ev.starts_at);
    const e = new Date(ev.ends_at);
    setF({
      kind: ev.kind, title: ev.title, description: ev.description, organizer_name: ev.organizer_name,
      municipality_code: ev.municipality_code, venue: ev.venue ?? "",
      start_date: localIsoDate(s), start_time: ev.all_day ? "" : localTime(s),
      end_date: localIsoDate(e), end_time: ev.all_day ? "" : localTime(e),
      weekly: ev.recurrence === "weekly", recurrence_until: ev.recurrence_until ?? "",
      all_ages: ev.age_min == null && ev.age_max == null,
      age_min: ev.age_min?.toString() ?? "", age_max: ev.age_max?.toString() ?? "",
      categories: ev.categories, is_free: ev.is_free, price_text: ev.price_text ?? "", url: ev.url ?? "",
      public_contact: ev.public_contact ?? "", declaration: false,
    });
  }, [existing.data]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((p) => ({ ...p, [k]: v }));
  const { errors, input } = useMemo(() => toInput(f), [f]);
  const saving = propose.isPending || update.isPending;

  const toggleCategory = (id: string, on: boolean) =>
    set("categories", on ? [...f.categories, id].slice(0, 3) : f.categories.filter((c) => c !== id));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!input) return;
    try {
      if (editId) await update.mutateAsync({ id: editId, ...input });
      else await propose.mutateAsync(input);
      toast({ title: "Obrigado!", description: "Vamos ver a proposta nos próximos dias e avisamos aqui, em \"As nossas propostas\"." });
      navigate("/agenda/propostas");
    } catch {
      toast({ title: "Não foi possível enviar", description: "Tentem outra vez daqui a pouco.", variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <form onSubmit={submit} className="mx-auto max-w-2xl space-y-6">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
            <Link to="/calendar?separador=perto"><ArrowLeft className="h-4 w-4 mr-1" />Agenda</Link>
          </Button>
          <h1 className="text-2xl font-heading font-bold">{editId ? "Editar a proposta" : "Propor um evento"}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {editId
              ? "Ao guardar, a proposta volta a ser vista pela equipa antes de aparecer na Agenda."
              : "Um grupo de famílias, uma oficina, uma hora do conto: tudo o que é para crianças e famílias. A equipa vê cada proposta antes de a publicar."}
          </p>
        </div>

        {editId && existing.isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}

        <section className="space-y-3">
          <Label>O que é?</Label>
          <RadioGroup value={f.kind} onValueChange={(v) => set("kind", v as EventKind)} className="grid gap-2 sm:grid-cols-2">
            {(["encontro", "evento"] as const).map((k) => {
              const s = KIND_STYLE[k];
              const Icon = s.icon;
              return (
                <Label key={k} htmlFor={`kind-${k}`} className={`flex cursor-pointer items-start gap-3 rounded-lg border border-l-4 p-3 font-normal ${s.border}`}>
                  <RadioGroupItem id={`kind-${k}`} value={k} className="mt-0.5" />
                  <span>
                    <span className="flex items-center gap-1 font-medium"><Icon className="h-4 w-4" aria-hidden />{k === "encontro" ? "Encontro de comunidade" : "Evento"}</span>
                    <span className="block text-xs text-muted-foreground">
                      {k === "encontro" ? "Famílias que se juntam, muitas vezes todas as semanas." : "Uma atividade organizada: oficina, espetáculo, visita, hora do conto."}
                    </span>
                  </span>
                </Label>
              );
            })}
          </RadioGroup>
        </section>

        <section className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Título</Label>
            <Input id="title" maxLength={80} value={f.title} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição curta</Label>
            <Textarea id="description" maxLength={500} rows={4} value={f.description} onChange={(e) => set("description", e.target.value)}
              placeholder="O que vão fazer, o que levar, se é preciso inscrição." />
            <p className="text-xs text-muted-foreground text-right">{f.description.length}/500</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="organizer">Quem organiza</Label>
            <Input id="organizer" maxLength={120} value={f.organizer_name} onChange={(e) => set("organizer_name", e.target.value)}
              placeholder="Nome do grupo, da entidade ou da pessoa" />
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="concelho">Concelho</Label>
            <MunicipalityPicker id="concelho" value={f.municipality_code} onChange={(c) => set("municipality_code", c)} className="w-full" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="venue">Local</Label>
            <Input id="venue" maxLength={200} value={f.venue} onChange={(e) => set("venue", e.target.value)} placeholder="Ex.: Biblioteca municipal, parque da cidade" />
          </div>
        </section>

        <section className="space-y-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="start_date">Data de início</Label>
              <Input id="start_date" type="date" value={f.start_date} onChange={(e) => set("start_date", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="start_time">Hora de início <span className="text-muted-foreground font-normal">(opcional)</span></Label>
              <Input id="start_time" type="time" value={f.start_time} onChange={(e) => set("start_time", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end_date">Data de fim <span className="text-muted-foreground font-normal">(se durar vários dias)</span></Label>
              <Input id="end_date" type="date" value={f.end_date} min={f.start_date || undefined} onChange={(e) => set("end_date", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end_time">Hora de fim <span className="text-muted-foreground font-normal">(opcional)</span></Label>
              <Input id="end_time" type="time" value={f.end_time} disabled={!f.start_time} onChange={(e) => set("end_time", e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="weekly" checked={f.weekly} onCheckedChange={(v) => set("weekly", v)} />
            <Label htmlFor="weekly">Repete-se todas as semanas</Label>
          </div>
          {f.weekly && (
            <div className="space-y-1.5 sm:w-1/2">
              <Label htmlFor="until">Até quando (máximo 6 meses)</Label>
              <Input id="until" type="date" value={f.recurrence_until} min={f.start_date || undefined}
                max={f.start_date ? addMonths(f.start_date, 6) : undefined} onChange={(e) => set("recurrence_until", e.target.value)} />
            </div>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Switch id="all_ages" checked={f.all_ages} onCheckedChange={(v) => set("all_ages", v)} />
            <Label htmlFor="all_ages">Para todas as idades</Label>
          </div>
          {!f.all_ages && (
            <div className="grid grid-cols-2 gap-4 sm:w-1/2">
              <div className="space-y-1.5">
                <Label htmlFor="age_min">Dos (anos)</Label>
                <Input id="age_min" type="number" min={0} max={18} value={f.age_min} onChange={(e) => set("age_min", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="age_max">Aos (anos)</Label>
                <Input id="age_max" type="number" min={0} max={18} value={f.age_max} onChange={(e) => set("age_max", e.target.value)} />
              </div>
            </div>
          )}
        </section>

        <section className="space-y-2">
          <Label>Categorias <span className="text-muted-foreground font-normal">(1 a 3)</span></Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {CATEGORIES.map((c) => {
              const on = f.categories.includes(c.id);
              return (
                <label key={c.id} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={on} disabled={!on && f.categories.length >= 3} onCheckedChange={(v) => toggleCategory(c.id, v === true)} />
                  {c.label}
                </label>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Switch id="is_free" checked={f.is_free} onCheckedChange={(v) => set("is_free", v)} />
            <Label htmlFor="is_free">Grátis</Label>
          </div>
          {!f.is_free && (
            <div className="space-y-1.5 sm:w-1/2">
              <Label htmlFor="price">Preço</Label>
              <Input id="price" maxLength={80} value={f.price_text} onChange={(e) => set("price_text", e.target.value)} placeholder="Ex.: 5 € por criança" />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="url">Ligação para inscrição ou informação <span className="text-muted-foreground font-normal">(opcional)</span></Label>
            <Input id="url" inputMode="url" value={f.url} onChange={(e) => set("url", e.target.value)} placeholder="https://" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact">Contacto público <span className="text-muted-foreground font-normal">(opcional)</span></Label>
            <Input id="contact" maxLength={120} value={f.public_contact} onChange={(e) => set("public_contact", e.target.value)}
              placeholder="Email ou telefone da entidade" />
          </div>
        </section>

        <label className="flex items-start gap-2 rounded-lg border p-3 text-sm">
          <Checkbox checked={f.declaration} onCheckedChange={(v) => set("declaration", v === true)} className="mt-0.5" />
          A informação é pública ou tenho autorização para a divulgar. É para crianças e famílias.
        </label>

        {tried && errors.length > 0 && (
          <ul className="rounded-lg bg-muted p-3 text-sm space-y-1" role="alert">
            {errors.map((e) => <li key={e}>{e}</li>)}
          </ul>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            {editId ? "Guardar e enviar para a equipa" : "Enviar proposta"}
          </Button>
          <Button asChild type="button" variant="ghost"><Link to="/agenda/propostas">Cancelar</Link></Button>
        </div>
      </form>
    </AppLayout>
  );
}
