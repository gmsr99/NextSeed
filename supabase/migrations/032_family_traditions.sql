-- 032 — Tradição da família (I-08, fase 1) e funcionalidades em piloto
--
-- family_traditions: a família ligou a "Tradição da família" (por agora só a
-- católica). Guarda só, ao nível da família (nunca por criança), a tradição, o
-- calendário escolhido e o registo do consentimento explícito. Convicção
-- religiosa é categoria especial (Art. 9.º RGPD): desligar apaga a linha.
-- Nada disto é enviado à IA. Não aparece em portefólios, relatórios nem em
-- partilhas: é visível só para a própria família (RLS).
--
-- pilot_features: funcionalidades em piloto ligadas a uma família concreta. Só
-- se escreve por SQL (equipa); a família só lê a sua. Para o piloto da F-01:
--   insert into pilot_features (family_id, feature) values ('<id da família>', 'tradicao');

create table if not exists pilot_features (
  family_id   uuid not null references families(id) on delete cascade,
  feature     text not null,
  created_at  timestamptz not null default now(),
  primary key (family_id, feature)
);

alter table pilot_features enable row level security;

create policy "pilot_features_read_own" on pilot_features
  for select using (family_id = my_family_id());

create table if not exists family_traditions (
  family_id        uuid primary key references families(id) on delete cascade,
  tradition        text not null check (tradition in ('catolica')),
  calendar         text not null default 'atual' check (calendar in ('atual', 'tradicional')),
  proprio_pt       boolean not null default true,
  consent_version  text not null,
  consented_at     timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table family_traditions enable row level security;

create policy "family_traditions_own" on family_traditions
  using (family_id = my_family_id())
  with check (family_id = my_family_id());
