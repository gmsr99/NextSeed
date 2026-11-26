// Início (DASH, spec claude/DASH_Redesenho_Inicio.md v3.1).
// Hoje em cima, sem cor; por baixo, duas caixas: A semana e O ano.
// Três momentos: dias de aulas, sexta (fechar a semana) e fim de semana sem
// plano (a próxima semana). Missões ficam na página delas (D-DASH-3).
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, differenceInYears, parseISO, addDays } from 'date-fns';
import { pt } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CalendarCheck, ChevronDown, Plus, Star, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/components/AppLayout';
import WeekCloseDialog, { closeShownKey } from '@/components/WeekCloseDialog';
import { useTodayDashboard, type TodayPlanItem } from '@/hooks/useTodayDashboard';
import { useChildren } from '@/hooks/useChildren';
import { useChildMilestones, MILESTONE_CATEGORIES } from '@/hooks/useChildMilestones';
import { useDashboardYear } from '@/hooks/useDashboardYear';
import { useWeekFocus } from '@/hooks/useAnnualPlan';
import { useFamilyTradition } from '@/hooks/useFamilyTradition';
import { isOptional } from '@/lib/essentialPlan';
import { GC_DISCIPLINE_LABELS } from '@/lib/gcConstants';
import { DISCIPLINE_LABELS } from '@/lib/planGenerator';
import { cn } from '@/lib/utils';
import {
  weekSummary, paceState, paceSentence, PACE_LABEL, shouldOfferClose,
  type PaceState, type WeekState,
} from '@/lib/dashboard';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 19) return 'Boa tarde';
  return 'Boa noite';
}

const DAY_SHORT = ['seg', 'ter', 'qua', 'qui', 'sex'];

const WEEK_LABEL: Record<WeekState, string> = {
  em_dia: 'Em dia',
  quase: 'Quase lá',
  por_preparar: 'Por preparar',
  preparada: 'Preparada',
};

const WEEK_TONE: Record<WeekState, string> = {
  em_dia: 'border-emerald-200 bg-emerald-50/70 text-emerald-900',
  quase: 'border-amber-200 bg-amber-50/70 text-amber-900',
  por_preparar: 'border-border bg-card text-foreground',
  preparada: 'border-border bg-card text-foreground',
};

const PACE_TONE: Record<PaceState, string> = {
  bom: 'border-emerald-200 bg-emerald-50/70 text-emerald-900',
  folga: 'border-amber-200 bg-amber-50/70 text-amber-900',
  ajuste: 'border-rose-200 bg-rose-50/70 text-rose-900',
  a_ganhar: 'border-border bg-card text-foreground',
  sem_marcas: 'border-border bg-card text-foreground',
};

const BAR_TONE: Record<PaceState, string> = {
  bom: 'bg-emerald-500',
  folga: 'bg-amber-500',
  ajuste: 'bg-rose-500',
  a_ganhar: 'bg-primary/60',
  sem_marcas: 'bg-primary/60',
};

const labelOf = (d: string) => GC_DISCIPLINE_LABELS[d] ?? d;

function readFlag(key: string): boolean {
  try { return localStorage.getItem(key) === '1'; } catch { return false; }
}
function writeFlag(key: string) {
  try { localStorage.setItem(key, '1'); } catch { /* sem armazenamento */ }
}

export default function Index() {
  const navigate = useNavigate();
  const {
    isLoading, hasPlan, todayItems, allItems, nextWeekPlanned, todayDow, weekStart,
    familyName, toggleItemDone,
  } = useTodayDashboard();
  const { children } = useChildren();
  const { milestones: recentMilestones } = useChildMilestones();
  const today = useMemo(() => new Date(), []);
  const year = useDashboardYear(children, today);
  const nextMonday = useMemo(() => addDays(weekStart, 7), [weekStart]);
  const nextFocus = useWeekFocus(children, nextMonday);
  const fam = useFamilyTradition();
  const [traditionSeen, setTraditionSeen] = useState(() => readFlag('nexseed:tradicao-aviso'));
  const showTraditionNotice = fam.invited && !fam.tradition && !fam.isLoading && !traditionSeen;

  const [open, setOpen] = useState<'semana' | 'ano' | null>(null);
  const [closing, setClosing] = useState(false);
  const closedKey = closeShownKey(weekStart);
  const [closed, setClosed] = useState(() => readFlag(closedKey));

  const isWeekend = todayDow >= 6;
  const isFriday = todayDow === 5;

  // Popup à sexta, a partir das 12h, uma vez (D-DASH-6)
  useEffect(() => {
    if (isLoading || !hasPlan || closed) return;
    const shownKey = `${closedKey}:visto`;
    if (shouldOfferClose(new Date(), readFlag(shownKey))) {
      writeFlag(shownKey);
      setClosing(true);
    }
  }, [isLoading, hasPlan, closed, closedKey]);

  const youngChildren = children.filter((c) => c.birth_date && differenceInYears(new Date(), parseISO(c.birth_date)) < 3);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64 text-muted-foreground">A carregar...</div>
      </AppLayout>
    );
  }

  const todayLabel = format(new Date(), "EEEE, d 'de' MMMM", { locale: pt });
  // P-27: as atividades "se houver tempo" não contam para estar em dia
  const week = weekSummary(hasPlan ? allItems.filter((i) => !isOptional(i)) : null, todayDow, nextWeekPlanned);
  const clock = year.clock;
  const yearState: PaceState | null = clock && year.total.total > 0 ? paceState(year.total, clock) : null;
  const showCloseButton = hasPlan && !closed && (isFriday || isWeekend);

  // Itens de hoje por criança
  const byChild = new Map<string, TodayPlanItem[]>();
  for (const it of todayItems) byChild.set(it.child_id, [...(byChild.get(it.child_id) ?? []), it]);
  const childName = (id: string) => children.find((c) => c.id === id)?.name ?? '';

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{greeting()}, família {familyName}! 🌱</h1>
          <p className="text-muted-foreground text-lg capitalize">{todayLabel}</p>
        </motion.div>

        {/* ── Hoje (sem cor) ─────────────────────────────────────────── */}
        <section className="space-y-4" data-tour="dashboard-hoje">
          <h2 className="font-semibold text-xl flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-primary" /> {isWeekend && !nextWeekPlanned ? 'A próxima semana' : 'Hoje'}
          </h2>

          <div className="rounded-2xl bg-card shadow-soft p-5 space-y-4">
            {isWeekend ? (
              !nextWeekPlanned ? (
                <NextWeek focus={nextFocus} childName={childName} onGenerate={() => navigate('/weekly-planner')} />
              ) : (
                <div className="space-y-3">
                  <p className="text-muted-foreground">Fim de semana. A próxima semana já tem plano. 🌿</p>
                  <Button variant="outline" size="sm" onClick={() => navigate('/weekly-planner')}>Ver o plano <ArrowRight className="w-4 h-4 ml-1" /></Button>
                </div>
              )
            ) : !hasPlan ? (
              <div className="space-y-3">
                <p className="text-muted-foreground">Esta semana ainda não tem plano.</p>
                <Button onClick={() => navigate('/weekly-planner')}><Plus className="w-4 h-4 mr-2" /> Gerar o plano da semana</Button>
              </div>
            ) : todayItems.length === 0 ? (
              <p className="text-muted-foreground">Hoje não há atividades no plano.</p>
            ) : (
              <div className="space-y-4">
                {[...byChild.entries()].map(([childId, items]) => (
                  <div key={childId} className="space-y-2">
                    {byChild.size > 1 && <p className="font-semibold text-foreground">{childName(childId)}</p>}
                    <ul className="space-y-1.5">
                      {items.map((item) => {
                        const done = !!item.completed_at;
                        return (
                          <li key={item.id} className="flex items-start gap-3">
                            <Checkbox
                              id={`hoje-${item.id}`}
                              checked={done}
                              onCheckedChange={(c) => toggleItemDone.mutate({ itemId: item.id, done: c === true })}
                              className="mt-0.5 h-5 w-5 shrink-0"
                            />
                            <label htmlFor={`hoje-${item.id}`} className={cn('text-sm leading-snug cursor-pointer', done && 'line-through text-muted-foreground')}>
                              {item.discipline && <span className="font-medium">{DISCIPLINE_LABELS[item.discipline] ?? item.discipline} · </span>}
                              {item.title}
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {!isWeekend && hasPlan && (
              <div className="flex flex-wrap gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => navigate('/weekly-planner')}>Ver o dia <ArrowRight className="w-4 h-4 ml-1" /></Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/activities')}><Plus className="w-4 h-4 mr-1" /> Registar atividades</Button>
              </div>
            )}
            {showCloseButton && (
              <Button size="sm" onClick={() => setClosing(true)}><CheckCircle2 className="w-4 h-4 mr-1.5" /> Fechar a semana · 5 min</Button>
            )}
          </div>
        </section>

        {/* ── A semana · O ano ─────────────────────────────────────────── */}
        <section className="grid grid-cols-2 gap-3">
          <button
            type="button" onClick={() => setOpen(open === 'semana' ? null : 'semana')} aria-expanded={open === 'semana'}
            className={cn('rounded-2xl border p-4 text-left transition-shadow hover:shadow-soft', WEEK_TONE[week.state])}
          >
            <p className="text-xs font-medium uppercase tracking-wider opacity-70">A semana</p>
            <p className="mt-1 text-lg font-semibold">{WEEK_LABEL[week.state]}</p>
            <p className="text-sm opacity-80">
              {isWeekend || !hasPlan ? (nextWeekPlanned ? 'plano pronto' : 'sem plano ainda') : `${week.done} de ${week.total} atividades`}
            </p>
            <ChevronDown className={cn('mt-1 h-4 w-4 opacity-50 transition-transform', open === 'semana' && 'rotate-180')} />
          </button>
          <button
            type="button" onClick={() => setOpen(open === 'ano' ? null : 'ano')} aria-expanded={open === 'ano'}
            className={cn('rounded-2xl border p-4 text-left transition-shadow hover:shadow-soft', yearState ? PACE_TONE[yearState] : 'border-border bg-card')}
          >
            <p className="text-xs font-medium uppercase tracking-wider opacity-70">O ano</p>
            <p className="mt-1 text-lg font-semibold">{yearState ? PACE_LABEL[yearState] : 'Sem rumo'}</p>
            <p className="text-sm opacity-80">
              {clock ? (clock.current ? `semana ${clock.current} de ${clock.totalWeeks}` : 'semana de pausa') : 'falta o ano da criança'}
            </p>
            <ChevronDown className={cn('mt-1 h-4 w-4 opacity-50 transition-transform', open === 'ano' && 'rotate-180')} />
          </button>
        </section>

        <AnimatePresence initial={false}>
          {open === 'semana' && (
            <motion.section key="semana" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden">
              <div className="rounded-2xl bg-card shadow-soft p-5 space-y-4">
                {hasPlan ? (
                  <div className="grid grid-cols-5 gap-2">
                    {week.days.map((d) => (
                      <div key={d.day} className={cn('rounded-xl border p-2 text-center', d.day === todayDow && 'border-primary/40')}>
                        <p className="text-xs uppercase text-muted-foreground">{DAY_SHORT[d.day - 1]}</p>
                        <p className="text-sm font-semibold">{d.total ? `${d.done}/${d.total}` : '–'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Esta semana não tem plano.</p>
                )}
                <Attention rows={year.rows.map((r) => ({ name: r.child.name, n: r.steps.consolidating }))} />
                <p className="text-xs text-muted-foreground">O que não for dado passa para a semana seguinte.</p>
              </div>
            </motion.section>
          )}
          {open === 'ano' && (
            <motion.section key="ano" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden">
              <div className="rounded-2xl bg-card shadow-soft p-5 space-y-5">
                {!clock || year.rows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">O ritmo do ano aparece quando a criança tem o ano escolar definido ou um manual com índice.</p>
                ) : (
                  <>
                    {yearState === 'sem_marcas' ? (
                      <p className="text-sm text-muted-foreground">Ainda não há temas marcados como dados. Ao fechar a semana, o ritmo do ano aparece aqui.</p>
                    ) : yearState && <p className="text-sm text-foreground">{paceSentence(year.total, clock)}</p>}
                    {year.rows.map((r) => (
                      <div key={r.child.id} className="space-y-2">
                        {year.rows.length > 1 && <p className="font-semibold text-foreground">{r.child.name}</p>}
                        {r.disciplines.map((d) => {
                          const st = paceState(d, clock);
                          const pct = Math.round((d.given / d.total) * 100);
                          const mark = Math.min(100, Math.round((d.plannedByNow / d.total) * 100));
                          return (
                            <div key={d.discipline} className="space-y-1">
                              <div className="flex items-baseline justify-between gap-2 text-sm">
                                <span className="font-medium">{labelOf(d.discipline)}{d.manual ? <span className="text-muted-foreground font-normal"> · {d.manual}</span> : null}</span>
                                <span className="text-xs text-muted-foreground">{d.given} de {d.total} · {PACE_LABEL[st]}</span>
                              </div>
                              <div className="relative h-2 rounded-full bg-muted overflow-hidden" aria-hidden>
                                <div className={cn('h-full rounded-full', BAR_TONE[st])} style={{ width: `${pct}%` }} />
                                <div className="absolute top-0 h-full w-0.5 bg-foreground/40" style={{ left: `${mark}%` }} title="previsto até hoje" />
                              </div>
                            </div>
                          );
                        })}
                        {r.steps.consolidating > 0 && (
                          <p className="text-xs text-muted-foreground">a consolidar: {r.steps.consolidating} {r.steps.consolidating === 1 ? 'tema' : 'temas'}</p>
                        )}
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground">A barra é o que foi dado; o traço, o que o rumo previa até hoje.</p>
                    {yearState === 'ajuste' || year.rows.some((r) => r.disciplines.some((d) => paceState(d, clock) === 'ajuste')) ? (
                      <Button variant="outline" size="sm" onClick={() => navigate('/roteiro-anual')}>
                        Acertar o rumo <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => navigate('/roteiro-anual')}>
                        Ver o rumo do ano <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Convite discreto para a Tradição da família (I-08): uma vez, só a quem tem o convite */}
        {showTraditionNotice && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-dashed px-4 py-3 text-sm">
            <span className="text-muted-foreground">Têm disponível a Tradição da família, opcional.</span>
            <span className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => { writeFlag('nexseed:tradicao-aviso'); setTraditionSeen(true); navigate('/metodologias#tradicao'); }}>Ver</Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => { writeFlag('nexseed:tradicao-aviso'); setTraditionSeen(true); }}>Agora não</Button>
            </span>
          </div>
        )}

        {/* Marcos de bebés e crianças pequenas */}
        {youngChildren.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" fill="currentColor" /> Marcos recentes
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/portfolio')}>
                Ver todos <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            {youngChildren.map((child) => {
              const list = recentMilestones.filter((m) => m.child_id === child.id).slice(0, 2);
              return (
                <div key={child.id} className="rounded-2xl p-4 bg-card shadow-soft space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{child.name}</p>
                    <Button size="sm" variant="ghost" onClick={() => navigate('/portfolio')}><Plus className="w-3.5 h-3.5 mr-1" /> Novo marco</Button>
                  </div>
                  {list.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Ainda sem marcos. Regista o primeiro momento especial.</p>
                  ) : list.map((m) => {
                    const cat = MILESTONE_CATEGORIES.find((c) => c.key === m.category);
                    return (
                      <p key={m.id} className="text-sm flex items-center gap-2">
                        <span>{cat?.emoji ?? '⭐'}</span> {m.title}
                        <span className="ml-auto text-xs text-muted-foreground">{format(new Date(m.date + 'T00:00:00'), 'd MMM', { locale: pt })}</span>
                      </p>
                    );
                  })}
                </div>
              );
            })}
          </section>
        )}
      </div>

      <WeekCloseDialog
        open={closing}
        onClose={() => { setClosing(false); setClosed(readFlag(closedKey)); }}
        familyChildren={children}
        date={weekStart}
        proposeNext
      />
    </AppLayout>
  );
}

function NextWeek({ focus, childName, onGenerate }: {
  focus: ReturnType<typeof useWeekFocus>;
  childName: (id: string) => string;
  onGenerate: () => void;
}) {
  const entries = Object.entries(focus);
  return (
    <div className="space-y-4">
      {entries.length === 0 ? (
        <p className="text-muted-foreground">A semana que vem ainda não tem plano.</p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">A semana que vem já tem rumo:</p>
          {entries.map(([childId, f]) => (
            <div key={childId} className="space-y-1">
              {entries.length > 1 && <p className="font-semibold text-foreground">{childName(childId)}</p>}
              {Object.entries(f.focus).slice(0, 5).map(([d, list]) => (
                <p key={d} className="text-sm"><span className="font-medium">{labelOf(d)}</span> · {list[0]?.content}{list.length > 1 ? ` (+${list.length - 1})` : ''}</p>
              ))}
            </div>
          ))}
        </div>
      )}
      <Button onClick={onGenerate}><Sparkles className="w-4 h-4 mr-2" /> Gerar o plano da semana</Button>
    </div>
  );
}

function Attention({ rows }: { rows: { name: string; n: number }[] }) {
  const withAny = rows.filter((r) => r.n > 0);
  if (withAny.length === 0) return null;
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">Com atenção esta semana</p>
      {withAny.map((r) => (
        <p key={r.name} className="text-sm text-muted-foreground">
          {rows.length > 1 ? `${r.name}: ` : ''}{r.n} {r.n === 1 ? 'tema volta' : 'temas voltam'} em revisão curta
        </p>
      ))}
    </div>
  );
}
