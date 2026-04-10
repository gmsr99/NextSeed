// src/pages/Index.tsx
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { CalendarCheck, Plus, ArrowRight, Trophy, BookOpen, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/components/AppLayout';
import { useTodayDashboard } from '@/hooks/useTodayDashboard';
import { useMissionRewards } from '@/hooks/useMissionRewards';

const DISCIPLINE_COLORS: Record<string, string> = {
  'Português': 'bg-blue-100 text-blue-800',
  'Matemática': 'bg-purple-100 text-purple-800',
  'Estudo do Meio': 'bg-green-100 text-green-800',
  'Inglês': 'bg-yellow-100 text-yellow-800',
  'Ed. Artística': 'bg-pink-100 text-pink-800',
  'Ed. Física': 'bg-orange-100 text-orange-800',
  'Cidadania': 'bg-teal-100 text-teal-800',
};

function disciplineColor(d: string) {
  return DISCIPLINE_COLORS[d] ?? 'bg-gray-100 text-gray-800';
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 19) return 'Boa tarde';
  return 'Boa noite';
}

export default function Index() {
  const navigate = useNavigate();
  const {
    isLoading, hasPlan, todayItems, totalRegistered, totalPlannedWeek,
    children, upcomingExtras, isWeekend, familyName,
  } = useTodayDashboard();
  const { rewards, getBalance } = useMissionRewards();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64 text-muted-foreground">A carregar...</div>
      </AppLayout>
    );
  }

  const todayLabel = format(new Date(), "EEEE, d 'de' MMMM", { locale: pt });

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <h1 className="text-2xl font-bold">{greeting()}, família {familyName}! 🌱</h1>
          <p className="text-muted-foreground capitalize">{todayLabel}</p>
        </motion.div>

        {/* Bloco 1 — Hoje */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-primary" /> Hoje
            </h2>
            {hasPlan && (
              <Button variant="ghost" size="sm" onClick={() => navigate('/weekly-planner')}>
                Ver plano completo <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>

          {!hasPlan ? (
            <div className="border-2 border-dashed rounded-xl p-6 text-center space-y-3">
              <p className="text-muted-foreground">Não há plano para esta semana.</p>
              <Button onClick={() => navigate('/weekly-planner')}>
                <Plus className="w-4 h-4 mr-2" /> Gerar plano semanal
              </Button>
            </div>
          ) : isWeekend ? (
            <div className="border rounded-xl p-4 bg-muted/30 text-center text-muted-foreground">
              É fim de semana! Aproveita o descanso. 🌿
            </div>
          ) : todayItems.length === 0 ? (
            <div className="border rounded-xl p-4 text-center text-muted-foreground">
              Sem atividades planeadas para hoje.
            </div>
          ) : (
            <div className="space-y-2">
              {todayItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 border rounded-xl p-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="w-16 text-xs text-muted-foreground text-center font-mono shrink-0">
                    {item.time_slot}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    {item.discipline && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${disciplineColor(item.discipline)}`}>
                        {item.discipline}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => navigate('/activities')}
                  >
                    <Plus className="w-3 h-3 mr-1" /> Registar
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Bloco 2 — Missões ativas */}
        {children.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" /> Missões
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/world-missions')}>
                Ver missões <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {children.map(child => {
                const balance = getBalance(child.id);
                const nearest = rewards
                  .filter(r => r.is_active && balance < r.points_cost)
                  .sort((a, b) => (a.points_cost - balance) - (b.points_cost - balance))[0];
                const pct = nearest ? Math.min(100, Math.round((balance / nearest.points_cost) * 100)) : 100;
                return (
                  <div key={child.id} className="border rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{child.name}</p>
                      <Badge variant="secondary">{balance} pts</Badge>
                    </div>
                    {nearest ? (
                      <>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div className="bg-amber-400 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {nearest.emoji ?? ''} {nearest.title} — faltam {nearest.points_cost - balance} pts
                        </p>
                      </>
                    ) : rewards.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        <Button variant="link" className="h-auto p-0 text-xs" onClick={() => navigate('/world-missions')}>Cria uma recompensa</Button> para motivar!
                      </p>
                    ) : (
                      <p className="text-xs text-green-600 font-medium">🎉 Pode resgatar recompensas!</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Bloco 3 — Esta semana */}
        <section className="space-y-3">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> Esta semana
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="border rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-primary">{totalRegistered}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {hasPlan ? `de ${totalPlannedWeek} atividades` : 'atividades registadas'}
              </p>
            </div>
            {upcomingExtras.length > 0 && (
              <div className="border rounded-xl p-4 col-span-1 sm:col-span-2 space-y-1">
                <p className="text-sm font-medium flex items-center gap-1">
                  <Clock className="w-4 h-4" /> Próximos extracurriculares
                </p>
                {upcomingExtras.slice(0, 3).map(e => (
                  <p key={e.id} className="text-xs text-muted-foreground">{e.name} — {e.start_time?.slice(0, 5)}</p>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Ações rápidas */}
        <section className="flex flex-wrap gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/activities')}>
            <Plus className="w-4 h-4 mr-1" /> Registar atividade
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/calendar')}>
            Ver agenda
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/portfolio')}>
            Ver portfólio
          </Button>
        </section>

      </div>
    </AppLayout>
  );
}
