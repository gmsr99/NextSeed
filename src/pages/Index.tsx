// src/pages/Index.tsx
import { useNavigate } from 'react-router-dom';
import { format, differenceInYears, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { CalendarCheck, Plus, ArrowRight, Trophy, BookOpen, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/components/AppLayout';
import { useTodayDashboard } from '@/hooks/useTodayDashboard';
import { useMissionRewards } from '@/hooks/useMissionRewards';
import { useChildMilestones, MILESTONE_CATEGORIES } from '@/hooks/useChildMilestones';

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
  const { milestones: recentMilestones } = useChildMilestones();

  // Children under 3 years old — milestone tracking focus
  const youngChildren = children.filter((c) => {
    if (!c.birth_date) return false;
    return differenceInYears(new Date(), parseISO(c.birth_date)) < 3;
  });

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
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 pb-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{greeting()}, família {familyName}! 🌱</h1>
          <p className="text-muted-foreground text-lg capitalize">{todayLabel}</p>
        </motion.div>

        {/* Bloco 1 — Hoje */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-xl flex items-center gap-2">
              <CalendarCheck className="w-6 h-6 text-primary animate-pulse-soft" /> Hoje
            </h2>
            {hasPlan && (
              <Button variant="ghost" size="sm" className="hover:bg-primary/10 transition-colors" onClick={() => navigate('/weekly-planner')}>
                Ver plano <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>

          {!hasPlan ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl p-8 text-center space-y-4 gradient-warmth shadow-glow text-white relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
              <div className="relative z-10 flex flex-col items-center justify-center">
                <h3 className="text-2xl font-bold mb-1">Prontos para uma nova semana?</h3>
                <p className="text-white/90 font-medium mb-5 text-lg">Ainda não há plano estruturado.</p>
                <Button variant="secondary" size="lg" className="font-semibold hover:scale-105 transition-transform shadow-elevated text-primary-foreground" onClick={() => navigate('/weekly-planner')}>
                  <Plus className="w-5 h-5 mr-2" /> Gerar plano semanal
                </Button>
              </div>
            </motion.div>
          ) : isWeekend ? (
            <div className="rounded-2xl p-6 bg-gradient-to-r from-muted/40 to-muted/20 backdrop-blur-sm text-center text-muted-foreground shadow-soft border border-white/40">
              <span className="text-lg font-medium">É fim de semana! Aproveita o descanso. 🌿</span>
            </div>
          ) : todayItems.length === 0 ? (
            <div className="rounded-2xl p-6 text-center text-muted-foreground shadow-soft bg-card/80 backdrop-blur-sm border-transparent">
              Sem atividades planeadas para hoje.
            </div>
          ) : (
            <div className="space-y-3">
              {todayItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -2, scale: 1.01 }}
                  className="flex items-center gap-4 bg-card shadow-soft rounded-2xl p-4 hover:shadow-elevated transition-all border border-transparent hover:border-primary/20"
                >
                  <div className="w-16 text-sm text-muted-foreground text-center font-mono shrink-0 bg-muted/30 py-1 px-2 rounded-lg">
                    {item.time_slot}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base truncate">{item.title}</p>
                    {item.discipline && (
                      <span className={`inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full font-medium shadow-sm ${disciplineColor(item.discipline)}`}>
                        {item.discipline}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 hover:shadow-glow hover:border-primary/50 transition-all"
                    onClick={() => navigate('/activities')}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Registar
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Bloco 1.5 — Marcos de bebés/crianças pequenas */}
        {youngChildren.length > 0 && (
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-xl flex items-center gap-2">
                <Star className="w-6 h-6 text-amber-400 animate-float" fill="currentColor" /> Marcos recentes
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/portfolio')}>
                Ver todos <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="grid gap-3">
              {youngChildren.map((child) => {
                const childMilestones = recentMilestones
                  .filter((m) => m.child_id === child.id)
                  .slice(0, 2);
                return (
                  <motion.div key={child.id} whileHover={{ y: -2 }} className="rounded-2xl p-5 space-y-3 bg-gradient-to-br from-amber-50/90 to-white/90 backdrop-blur-sm border border-amber-100/60 shadow-soft hover:shadow-elevated transition-all">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-base text-amber-950">{child.name}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 border-amber-200 bg-white/80 hover:bg-amber-100 hover:text-amber-900 transition-colors shadow-sm"
                        onClick={() => navigate('/portfolio')}
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Novo Marco
                      </Button>
                    </div>
                    {childMilestones.length === 0 ? (
                      <p className="text-sm text-amber-700/70 bg-amber-100/30 p-3 rounded-xl border border-amber-100/50">
                        Nenhum marco registado ainda. Regista o primeiro momento especial!
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {childMilestones.map((m) => {
                          const cat = MILESTONE_CATEGORIES.find((c) => c.key === m.category);
                          return (
                            <div key={m.id} className="flex items-center gap-3 text-sm bg-white/60 p-2.5 rounded-xl border border-amber-50 shadow-sm">
                              <span className="text-lg bg-amber-100/50 w-8 h-8 flex items-center justify-center rounded-full">{cat?.emoji ?? '⭐'}</span>
                              <span className="font-medium text-amber-950">{m.title}</span>
                              <span className="text-xs text-amber-700/80 ml-auto font-medium bg-amber-50 px-2 py-1 rounded-md">
                                {format(new Date(m.date + 'T00:00:00'), "d MMM", { locale: pt })}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Bloco 2 — Missões ativas */}
        {children.length > 0 && (
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-xl flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-500" /> Missões
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/world-missions')}>
                Ver missões <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {children.map(child => {
                const balance = getBalance(child.id);
                const nearest = rewards
                  .filter(r => r.is_active && balance < r.points_cost)
                  .sort((a, b) => (a.points_cost - balance) - (b.points_cost - balance))[0];
                const pct = nearest ? Math.min(100, Math.round((balance / nearest.points_cost) * 100)) : 100;
                return (
                  <motion.div key={child.id} whileHover={{ y: -2 }} className="rounded-2xl p-5 space-y-4 bg-card shadow-soft hover:shadow-elevated transition-all border border-transparent">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-base">{child.name}</p>
                      <Badge variant="secondary" className="text-sm px-2.5 py-0.5 shadow-sm bg-amber-100 text-amber-900 hover:bg-amber-200">{balance} pts</Badge>
                    </div>
                    {nearest ? (
                      <div className="space-y-1.5">
                        <div className="w-full bg-muted/60 rounded-full h-2.5 shadow-inner overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${pct}%` }} 
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="gradient-warmth h-full rounded-full shadow-sm" 
                          />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                          <span>{nearest.emoji ?? ''} {nearest.title}</span>
                          <span className="text-xs">faltam {nearest.points_cost - balance}</span>
                        </p>
                      </div>
                    ) : rewards.length === 0 ? (
                      <p className="text-sm text-muted-foreground bg-muted/20 p-3 rounded-xl">
                        <Button variant="link" className="h-auto p-0 text-sm font-semibold text-primary" onClick={() => navigate('/world-missions')}>Cria uma recompensa</Button> para motivar!
                      </p>
                    ) : (
                      <p className="text-sm text-green-600 font-semibold bg-green-50 p-3 rounded-xl border border-green-100 flex items-center gap-2">
                        🎉 Pode resgatar recompensas!
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Bloco 3 — Esta semana */}
        <section className="space-y-4 pt-2">
          <h2 className="font-semibold text-xl flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" /> Esta semana
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <motion.div whileHover={{ scale: 1.02 }} className="rounded-2xl p-6 text-center bg-card shadow-soft hover:shadow-elevated transition-all border border-transparent flex flex-col justify-center">
              <p className="text-4xl font-black text-primary drop-shadow-sm">{totalRegistered}</p>
              <p className="text-sm font-medium text-muted-foreground mt-2">
                {hasPlan ? `de ${totalPlannedWeek} atividades` : 'registadas'}
              </p>
            </motion.div>
            
            {upcomingExtras.length > 0 && (
              <motion.div whileHover={{ scale: 1.02 }} className="rounded-2xl p-5 col-span-1 sm:col-span-2 bg-gradient-to-br from-card to-muted/10 shadow-soft hover:shadow-elevated transition-all border border-transparent">
                <p className="text-base font-semibold flex items-center gap-2 mb-3 text-foreground/90">
                  <Clock className="w-5 h-5 text-blue-500" /> Extracurriculares
                </p>
                <div className="space-y-2">
                  {upcomingExtras.slice(0, 3).map(e => (
                    <div key={e.id} className="flex items-center justify-between text-sm bg-white/50 px-3 py-2 rounded-lg border border-white/60 shadow-sm">
                      <span className="font-medium text-foreground/80">{e.name}</span>
                      <span className="text-xs font-bold text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-md">{e.start_time?.slice(0, 5)}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Ações rápidas */}
        <section className="flex flex-wrap gap-3 pt-6 border-t border-border/50">
          <Button variant="default" className="shadow-elevated hover:shadow-glow hover:-translate-y-0.5 transition-all gradient-forest text-white" onClick={() => navigate('/activities')}>
            <Plus className="w-4 h-4 mr-2" /> Registar atividade
          </Button>
          <Button variant="outline" className="shadow-soft hover:shadow-elevated hover:-translate-y-0.5 transition-all bg-card" onClick={() => navigate('/calendar')}>
            Ver agenda
          </Button>
          <Button variant="outline" className="shadow-soft hover:shadow-elevated hover:-translate-y-0.5 transition-all bg-card" onClick={() => navigate('/portfolio')}>
            Ver portfólio
          </Button>
        </section>

      </div>
    </AppLayout>
  );
}

