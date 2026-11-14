-- 028 — Registo de consentimentos (B-09, doc 04 §4: "quem consentiu, quando, a
-- quê e em que versão dos termos").
--
-- Registo só de acrescentar: cada aceitação ou recusa é uma linha nova; o estado
-- atual é a linha mais recente por finalidade. Ninguém altera nem apaga linhas
-- pela app; caem em cascata quando a conta é apagada.
--
-- Finalidades:
--   termos            aceitação dos Termos e da Política de Privacidade (versão)
--   melhoria_produto  registo de eventos de uso para melhorar a app (oposição)

create table if not exists public.user_consents (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  family_id     uuid references public.families(id) on delete cascade,
  purpose       text not null check (purpose in ('termos', 'melhoria_produto')),
  granted       boolean not null,
  terms_version text not null,
  created_at    timestamptz not null default now()
);

create index if not exists user_consents_user_purpose_idx
  on public.user_consents (user_id, purpose, created_at desc);

alter table public.user_consents enable row level security;

-- Cada pessoa vê e acrescenta só as suas linhas; sem update nem delete.
create policy "user_consents_select_own" on public.user_consents
  for select using (user_id = auth.uid());

create policy "user_consents_insert_own" on public.user_consents
  for insert with check (
    user_id = auth.uid()
    and (family_id is null or family_id = my_family_id())
  );
