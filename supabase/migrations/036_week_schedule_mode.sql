-- 036 — Horário com ou sem horas (P-27, plano essencial; aprovado pelo Elton a 26 nov)
--
-- "blocos" (por omissão): o horário mostra a ordem dos blocos e a duração de
-- cada atividade pela idade; as horas ficam com a família.
-- "horas": o horário sugere horas, como antes.
-- Sem linha em family_week_routines, a app usa "blocos".
-- Idempotente. Aplicar dentro de begin; … commit; a partir do main.

alter table family_week_routines
  add column if not exists schedule_mode text not null default 'blocos';

do $$ begin
  alter table family_week_routines
    add constraint family_week_routines_schedule_mode_check check (schedule_mode in ('blocos', 'horas'));
exception when duplicate_object then null; end $$;
