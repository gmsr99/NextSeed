-- 033 — Lembrete de domingo (DASH fase 5, P-26)
--
-- Ao domingo às 20h (hora de Lisboa), se a família ainda não tem plano para a
-- semana seguinte, sai um email para o responsável da conta (families.email).
-- Uma vez por semana. Desligável em Definições. Não sai em pausas.
--
-- family_notification_prefs: a escolha da família. Sem linha = ligado.
-- sunday_reminders_sent: registo dos envios (um por família e semana), para
-- nunca enviar duas vezes. Só a função escreve (service role); a família só lê.

create table if not exists family_notification_prefs (
  family_id        uuid primary key references families(id) on delete cascade,
  sunday_reminder  boolean not null default true,
  updated_at       timestamptz not null default now()
);

alter table family_notification_prefs enable row level security;

create policy "family_notification_prefs_own" on family_notification_prefs
  using (family_id = my_family_id())
  with check (family_id = my_family_id());

create table if not exists sunday_reminders_sent (
  family_id   uuid not null references families(id) on delete cascade,
  week_start  date not null,
  sent_at     timestamptz not null default now(),
  primary key (family_id, week_start)
);

alter table sunday_reminders_sent enable row level security;

-- A família pode ver os seus envios (exportação de dados); escrever, só a função
create policy "sunday_reminders_sent_read_own" on sunday_reminders_sent
  for select using (family_id = my_family_id());

-- ─── Agendamento (correr à parte, depois de publicar a função) ────────────────
-- Precisa das extensões pg_cron e pg_net (Database › Extensions) e de dois
-- segredos no Vault (Project Settings › Vault):
--   project_url       = https://<ref>.supabase.co
--   service_role_key  = a service role key (legacy, em formato JWT)
--
-- O pg_cron trabalha em UTC. Lisboa está em UTC no inverno e UTC+1 no verão,
-- por isso corre às 19h e às 20h UTC de domingo e a função só envia quando em
-- Lisboa são 20h.
--
-- select cron.schedule(
--   'lembrete-domingo',
--   '0 19,20 * * 0',
--   $$
--   select net.http_post(
--     url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/send-sunday-reminder',
--     headers := jsonb_build_object(
--       'Content-Type', 'application/json',
--       'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key')
--     ),
--     body := '{}'::jsonb
--   );
--   $$
-- );
