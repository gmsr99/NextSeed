-- 041 · Agenda da comunidade (I-03a, fase 1B)
-- Spec: claude/AGENDA_Especificacao.md (v2, aprovada a 26 nov 2026)
--
-- Tabelas novas:
--   municipalities          os 308 concelhos com o centro de cada um (CAOP 2020, DGT; ver
--                           scripts/build-municipalities.py). Dados públicos, sem dados pessoais.
--   community_events        eventos e encontros propostos por qualquer conta; só ficam visíveis
--                           depois de a equipa (team_admins) os publicar.
--   family_event_settings   concelho guardado (opcional) e "O que preferimos" de cada família.
--                           Tabela à parte de families de propósito: a equipa lê families
--                           (families_select_admin, 017), mas não deve ler o concelho.
-- Coluna nova: calendar_events.community_event_id ("Juntar à nossa agenda").
--
-- Convenções: is_team_admin() (017) para a equipa; my_family_id() (014) para a família;
-- funções com search_path = ''. Nada aqui é enviado ao Gemini.

begin;

-- ─── 1. Concelhos ─────────────────────────────────────────────────────────────
create table if not exists public.municipalities (
  code     text primary key check (code ~ '^\d{4}$'),
  name     text not null,
  district text not null,
  lat      double precision not null check (lat between 30 and 43),
  lng      double precision not null check (lng between -32 and -6)
);
alter table public.municipalities enable row level security;
drop policy if exists municipalities_read on public.municipalities;
create policy municipalities_read on public.municipalities for select using (true);

-- ─── 2. Eventos da comunidade ─────────────────────────────────────────────────
create table if not exists public.community_events (
  id                   uuid primary key default gen_random_uuid(),
  kind                 text not null default 'evento' check (kind in ('encontro','evento')),
  title                text not null check (char_length(title) between 3 and 80),
  description          text not null check (char_length(description) between 1 and 500),
  organizer_name       text not null check (char_length(organizer_name) between 2 and 120),
  municipality_code    text not null references public.municipalities(code),
  venue                text check (char_length(venue) <= 200),
  starts_at            timestamptz not null,
  ends_at              timestamptz not null,
  all_day              boolean not null default false,
  recurrence           text not null default 'none' check (recurrence in ('none','weekly')),
  recurrence_until     date,
  age_min              smallint check (age_min between 0 and 18),
  age_max              smallint check (age_max between 0 and 18),
  categories           text[] not null check (
                         array_length(categories, 1) between 1 and 3
                         and categories <@ array['natureza','ciencia','arte_manuais','musica_danca',
                                                 'teatro_espetaculos','livros_historias','movimento',
                                                 'historia_patrimonio']::text[]),
  is_free              boolean not null,
  price_text           text check (char_length(price_text) <= 80),
  url                  text check (url is null or url ~ '^https://'),
  public_contact       text check (char_length(public_contact) <= 120),
  source               text not null default 'manual',
  source_url           text check (source_url is null or source_url ~ '^https://'),
  status               text not null default 'pendente'
                         check (status in ('pendente','publicado','recusado','cancelado')),
  rejection_reason     text check (rejection_reason in
                         ('nao_familias','incompleto','duplicado','publicidade','outro')),
  declaration_accepted boolean not null check (declaration_accepted),
  submitted_by         uuid default auth.uid() references auth.users(id) on delete set null,
  reviewed_by          uuid references auth.users(id) on delete set null,
  reviewed_at          timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  check (ends_at >= starts_at),
  check (age_min is null or age_max is null or age_min <= age_max),
  check (recurrence = 'none'
         or (recurrence_until is not null
             and recurrence_until >= starts_at::date
             and recurrence_until <= (starts_at::date + interval '6 months')::date))
);
create index if not exists community_events_status_idx
  on public.community_events (status, ends_at, recurrence_until);
create index if not exists community_events_submitted_by_idx
  on public.community_events (submitted_by);

alter table public.community_events enable row level security;

-- Ler: publicados e cancelados (para "Juntar à nossa agenda" mostrar o cancelamento),
-- as próprias propostas, e tudo para a equipa.
drop policy if exists ce_select on public.community_events;
create policy ce_select on public.community_events for select to authenticated
  using (status in ('publicado','cancelado')
         or submitted_by = auth.uid()
         or public.is_team_admin());

-- Propor: qualquer conta, sempre como pendente.
drop policy if exists ce_insert on public.community_events;
create policy ce_insert on public.community_events for insert to authenticated
  with check (submitted_by = auth.uid()
              and status = 'pendente'
              and reviewed_by is null and reviewed_at is null and rejection_reason is null);

drop policy if exists ce_update on public.community_events;
create policy ce_update on public.community_events for update to authenticated
  using (submitted_by = auth.uid() or public.is_team_admin())
  with check (submitted_by = auth.uid() or public.is_team_admin());

drop policy if exists ce_delete on public.community_events;
create policy ce_delete on public.community_events for delete to authenticated
  using (submitted_by = auth.uid() or public.is_team_admin());

-- Quem não é da equipa: qualquer edição volta a pendente (ou fica cancelada, se for
-- isso que pede), sem mexer no autor nem na revisão. A equipa fica registada ao rever.
create or replace function public.community_events_guard()
  returns trigger
  language plpgsql
  set search_path = ''
as $function$
begin
  new.updated_at := now();
  new.created_at := old.created_at;
  new.submitted_by := old.submitted_by;
  if not public.is_team_admin() then
    new.status := case when new.status = 'cancelado' then 'cancelado' else 'pendente' end;
    new.reviewed_by := null;
    new.reviewed_at := null;
    new.rejection_reason := null;
  elsif new.status is distinct from old.status then
    new.reviewed_by := auth.uid();
    new.reviewed_at := now();
    if new.status <> 'recusado' then
      new.rejection_reason := null;
    end if;
  end if;
  return new;
end
$function$;

drop trigger if exists community_events_guard on public.community_events;
create trigger community_events_guard
  before update on public.community_events
  for each row execute function public.community_events_guard();

-- ─── 3. Preferências e concelho da família ────────────────────────────────────
create table if not exists public.family_event_settings (
  family_id         uuid primary key references public.families(id) on delete cascade,
  municipality_code text references public.municipalities(code),
  preferences       jsonb not null default '{}'::jsonb check (jsonb_typeof(preferences) = 'object'),
  updated_at        timestamptz not null default now()
);
alter table public.family_event_settings enable row level security;
drop policy if exists family_event_settings_own on public.family_event_settings;
create policy family_event_settings_own on public.family_event_settings for all to authenticated
  using (family_id = public.my_family_id())
  with check (family_id = public.my_family_id());

-- ─── 4. Ligação da agenda da família ao evento original ───────────────────────
alter table public.calendar_events
  add column if not exists community_event_id uuid
    references public.community_events(id) on delete set null;

-- ─── 5. Dados dos concelhos (gerado por scripts/build-municipalities.py) ───────
insert into public.municipalities (code, name, district, lat, lng) values
  ('0101', 'Águeda', 'Aveiro', 40.586, -8.39563),
  ('0102', 'Albergaria-A-Velha', 'Aveiro', 40.7001, -8.49551),
  ('0103', 'Anadia', 'Aveiro', 40.45263, -8.44279),
  ('0104', 'Arouca', 'Aveiro', 40.92877, -8.2517),
  ('0105', 'Aveiro', 'Aveiro', 40.64218, -8.62825),
  ('0106', 'Castelo de Paiva', 'Aveiro', 41.01824, -8.30304),
  ('0107', 'Espinho', 'Aveiro', 40.99476, -8.62583),
  ('0108', 'Estarreja', 'Aveiro', 40.76155, -8.57574),
  ('0109', 'Santa Maria da Feira', 'Aveiro', 40.96695, -8.51054),
  ('0110', 'Ílhavo', 'Aveiro', 40.60617, -8.69986),
  ('0111', 'Mealhada', 'Aveiro', 40.35376, -8.44105),
  ('0112', 'Murtosa', 'Aveiro', 40.75774, -8.67344),
  ('0113', 'Oliveira de Azeméis', 'Aveiro', 40.84219, -8.4684),
  ('0114', 'Oliveira do Bairro', 'Aveiro', 40.51585, -8.55153),
  ('0115', 'Ovar', 'Aveiro', 40.87622, -8.61983),
  ('0116', 'São João da Madeira', 'Aveiro', 40.89563, -8.49037),
  ('0117', 'Sever do Vouga', 'Aveiro', 40.72408, -8.35201),
  ('0118', 'Vagos', 'Aveiro', 40.51545, -8.68954),
  ('0119', 'Vale de Cambra', 'Aveiro', 40.83323, -8.33623),
  ('0201', 'Aljustrel', 'Beja', 37.88784, -8.18812),
  ('0202', 'Almodôvar', 'Beja', 37.47495, -8.08449),
  ('0203', 'Alvito', 'Beja', 38.24404, -8.04149),
  ('0204', 'Barrancos', 'Beja', 38.14819, -7.0522),
  ('0205', 'Beja', 'Beja', 37.96241, -7.85593),
  ('0206', 'Castro Verde', 'Beja', 37.70469, -8.02826),
  ('0207', 'Cuba', 'Beja', 38.19273, -7.91352),
  ('0208', 'Ferreira do Alentejo', 'Beja', 38.08825, -8.18888),
  ('0209', 'Mértola', 'Beja', 37.64673, -7.7066),
  ('0210', 'Moura', 'Beja', 38.13339, -7.28734),
  ('0211', 'Odemira', 'Beja', 37.60715, -8.57687),
  ('0212', 'Ourique', 'Beja', 37.63976, -8.29108),
  ('0213', 'Serpa', 'Beja', 37.93286, -7.48959),
  ('0214', 'Vidigueira', 'Beja', 38.16884, -7.71704),
  ('0301', 'Amares', 'Braga', 41.65168, -8.34532),
  ('0302', 'Barcelos', 'Braga', 41.53667, -8.62372),
  ('0303', 'Braga', 'Braga', 41.54447, -8.42095),
  ('0304', 'Cabeceiras de Basto', 'Braga', 41.54017, -7.95393),
  ('0305', 'Celorico de Basto', 'Braga', 41.40129, -8.03964),
  ('0306', 'Esposende', 'Braga', 41.54692, -8.75799),
  ('0307', 'Fafe', 'Braga', 41.47723, -8.14827),
  ('0308', 'Guimarães', 'Braga', 41.46081, -8.31558),
  ('0309', 'Póvoa de Lanhoso', 'Braga', 41.58823, -8.25258),
  ('0310', 'Terras de Bouro', 'Braga', 41.73907, -8.19122),
  ('0311', 'Vieira do Minho', 'Braga', 41.63148, -8.10398),
  ('0312', 'Vila Nova de Famalicão', 'Braga', 41.40865, -8.50339),
  ('0313', 'Vila Verde', 'Braga', 41.68074, -8.44353),
  ('0314', 'Vizela', 'Braga', 41.37332, -8.29562),
  ('0401', 'Alfândega da Fé', 'Bragança', 41.34982, -6.95112),
  ('0402', 'Bragança', 'Bragança', 41.77079, -6.73529),
  ('0403', 'Carrazeda de Ansiães', 'Bragança', 41.228, -7.30801),
  ('0404', 'Freixo de Espada À Cinta', 'Bragança', 41.11349, -6.83282),
  ('0405', 'Macedo de Cavaleiros', 'Bragança', 41.54333, -6.90615),
  ('0406', 'Miranda do Douro', 'Bragança', 41.51054, -6.35859),
  ('0407', 'Mirandela', 'Bragança', 41.50836, -7.18774),
  ('0408', 'Mogadouro', 'Bragança', 41.33338, -6.6701),
  ('0409', 'Torre de Moncorvo', 'Bragança', 41.17258, -7.01678),
  ('0410', 'Vila Flor', 'Bragança', 41.32168, -7.15949),
  ('0411', 'Vimioso', 'Bragança', 41.5707, -6.53079),
  ('0412', 'Vinhais', 'Bragança', 41.83243, -7.04864),
  ('0501', 'Belmonte', 'Castelo Branco', 40.33075, -7.32969),
  ('0502', 'Castelo Branco', 'Castelo Branco', 39.85476, -7.50148),
  ('0503', 'Covilhã', 'Castelo Branco', 40.25672, -7.56276),
  ('0504', 'Fundão', 'Castelo Branco', 40.1215, -7.48253),
  ('0505', 'Idanha-A-Nova', 'Castelo Branco', 39.90016, -7.11305),
  ('0506', 'Oleiros', 'Castelo Branco', 39.94458, -7.87114),
  ('0507', 'Penamacor', 'Castelo Branco', 40.1765, -7.13679),
  ('0508', 'Proença-A-Nova', 'Castelo Branco', 39.73826, -7.85579),
  ('0509', 'Sertã', 'Castelo Branco', 39.82444, -8.0992),
  ('0510', 'Vila de Rei', 'Castelo Branco', 39.68311, -8.14431),
  ('0511', 'Vila Velha de Ródão', 'Castelo Branco', 39.68093, -7.66383),
  ('0601', 'Arganil', 'Coimbra', 40.22907, -7.98548),
  ('0602', 'Cantanhede', 'Coimbra', 40.35497, -8.63735),
  ('0603', 'Coimbra', 'Coimbra', 40.21613, -8.44617),
  ('0604', 'Condeixa-A-Nova', 'Coimbra', 40.09871, -8.49962),
  ('0605', 'Figueira da Foz', 'Coimbra', 40.16881, -8.80876),
  ('0606', 'Góis', 'Coimbra', 40.1025, -8.08944),
  ('0607', 'Lousã', 'Coimbra', 40.13176, -8.22838),
  ('0608', 'Mira', 'Coimbra', 40.43306, -8.75472),
  ('0609', 'Miranda do Corvo', 'Coimbra', 40.10484, -8.32739),
  ('0610', 'Montemor-O-Velho', 'Coimbra', 40.21466, -8.65846),
  ('0611', 'Oliveira do Hospital', 'Coimbra', 40.36842, -7.86372),
  ('0612', 'Pampilhosa da Serra', 'Coimbra', 40.0843, -7.91646),
  ('0613', 'Penacova', 'Coimbra', 40.29757, -8.26757),
  ('0614', 'Penela', 'Coimbra', 40.01011, -8.36983),
  ('0615', 'Soure', 'Coimbra', 40.06678, -8.61955),
  ('0616', 'Tábua', 'Coimbra', 40.33416, -8.01522),
  ('0617', 'Vila Nova de Poiares', 'Coimbra', 40.21693, -8.2504),
  ('0701', 'Alandroal', 'Évora', 38.61573, -7.38294),
  ('0702', 'Arraiolos', 'Évora', 38.78676, -7.91643),
  ('0703', 'Borba', 'Évora', 38.8165, -7.46937),
  ('0704', 'Estremoz', 'Évora', 38.84542, -7.61375),
  ('0705', 'Évora', 'Évora', 38.53311, -7.87021),
  ('0706', 'Montemor-O-Novo', 'Évora', 38.6485, -8.29612),
  ('0707', 'Mora', 'Évora', 38.9189, -8.08881),
  ('0708', 'Mourão', 'Évora', 38.31818, -7.27483),
  ('0709', 'Portel', 'Évora', 38.30184, -7.69665),
  ('0710', 'Redondo', 'Évora', 38.62556, -7.59878),
  ('0711', 'Reguengos de Monsaraz', 'Évora', 38.39607, -7.47745),
  ('0712', 'Vendas Novas', 'Évora', 38.655, -8.51486),
  ('0713', 'Viana do Alentejo', 'Évora', 38.38461, -8.12236),
  ('0714', 'Vila Viçosa', 'Évora', 38.7689, -7.35321),
  ('0801', 'Albufeira', 'Faro', 37.13372, -8.23266),
  ('0802', 'Alcoutim', 'Faro', 37.41983, -7.65199),
  ('0803', 'Aljezur', 'Faro', 37.29715, -8.80091),
  ('0804', 'Castro Marim', 'Faro', 37.29261, -7.51682),
  ('0805', 'Faro', 'Faro', 37.05561, -7.91824),
  ('0806', 'Lagoa', 'Faro', 37.12574, -8.45327),
  ('0807', 'Lagos', 'Faro', 37.15188, -8.72801),
  ('0808', 'Loulé', 'Faro', 37.22508, -8.04697),
  ('0809', 'Monchique', 'Faro', 37.31617, -8.59172),
  ('0810', 'Olhão', 'Faro', 37.06204, -7.81047),
  ('0811', 'Portimão', 'Faro', 37.19155, -8.58304),
  ('0812', 'São Brás de Alportel', 'Faro', 37.19567, -7.87865),
  ('0813', 'Silves', 'Faro', 37.27027, -8.34588),
  ('0814', 'Tavira', 'Faro', 37.22511, -7.73219),
  ('0815', 'Vila do Bispo', 'Faro', 37.08628, -8.88348),
  ('0816', 'Vila Real de Santo António', 'Faro', 37.19435, -7.51928),
  ('0901', 'Aguiar da Beira', 'Guarda', 40.78114, -7.52838),
  ('0902', 'Almeida', 'Guarda', 40.6229, -6.91402),
  ('0903', 'Celorico da Beira', 'Guarda', 40.62229, -7.38499),
  ('0904', 'Figueira de Castelo Rodrigo', 'Guarda', 40.88443, -6.95939),
  ('0905', 'Fornos de Algodres', 'Guarda', 40.65102, -7.50013),
  ('0906', 'Gouveia', 'Guarda', 40.50137, -7.58031),
  ('0907', 'Guarda', 'Guarda', 40.5195, -7.2451),
  ('0908', 'Manteigas', 'Guarda', 40.39114, -7.52009),
  ('0909', 'Mêda', 'Guarda', 40.93662, -7.2528),
  ('0910', 'Pinhel', 'Guarda', 40.74188, -7.11012),
  ('0911', 'Sabugal', 'Guarda', 40.3733, -7.03251),
  ('0912', 'Seia', 'Guarda', 40.37771, -7.71915),
  ('0913', 'Trancoso', 'Guarda', 40.79145, -7.33469),
  ('0914', 'Vila Nova de Foz Côa', 'Guarda', 41.05264, -7.16988),
  ('1001', 'Alcobaça', 'Leiria', 39.55233, -8.99043),
  ('1002', 'Alvaiázere', 'Leiria', 39.81924, -8.39543),
  ('1003', 'Ansião', 'Leiria', 39.93415, -8.43866),
  ('1004', 'Batalha', 'Leiria', 39.63705, -8.76551),
  ('1005', 'Bombarral', 'Leiria', 39.28408, -9.15792),
  ('1006', 'Caldas da Rainha', 'Leiria', 39.40756, -9.08816),
  ('1007', 'Castanheira de Pêra', 'Leiria', 40.01993, -8.19582),
  ('1008', 'Figueiró dos Vinhos', 'Leiria', 39.92515, -8.2821),
  ('1009', 'Leiria', 'Leiria', 39.78941, -8.80228),
  ('1010', 'Marinha Grande', 'Leiria', 39.78521, -8.95264),
  ('1011', 'Nazaré', 'Leiria', 39.59455, -9.04503),
  ('1012', 'Óbidos', 'Leiria', 39.36333, -9.18924),
  ('1013', 'Pedrógão Grande', 'Leiria', 39.93492, -8.1826),
  ('1014', 'Peniche', 'Leiria', 39.33869, -9.31942),
  ('1015', 'Pombal', 'Leiria', 39.92659, -8.6776),
  ('1016', 'Porto de Mós', 'Leiria', 39.5579, -8.817),
  ('1101', 'Alenquer', 'Lisboa', 39.09815, -9.03905),
  ('1102', 'Arruda dos Vinhos', 'Lisboa', 38.97466, -9.09421),
  ('1103', 'Azambuja', 'Lisboa', 39.13363, -8.89683),
  ('1104', 'Cadaval', 'Lisboa', 39.2349, -9.06756),
  ('1105', 'Cascais', 'Lisboa', 38.72497, -9.401),
  ('1106', 'Lisboa', 'Lisboa', 38.73767, -9.15679),
  ('1107', 'Loures', 'Lisboa', 38.86129, -9.15167),
  ('1108', 'Lourinhã', 'Lisboa', 39.2465, -9.26926),
  ('1109', 'Mafra', 'Lisboa', 38.96113, -9.30886),
  ('1110', 'Oeiras', 'Lisboa', 38.71699, -9.27632),
  ('1111', 'Sintra', 'Lisboa', 38.82303, -9.35765),
  ('1112', 'Sobral de Monte Agraço', 'Lisboa', 38.99514, -9.16073),
  ('1113', 'Torres Vedras', 'Lisboa', 39.10488, -9.26043),
  ('1114', 'Vila Franca de Xira', 'Lisboa', 38.92208, -8.98455),
  ('1115', 'Amadora', 'Lisboa', 38.75981, -9.2295),
  ('1116', 'Odivelas', 'Lisboa', 38.79792, -9.19928),
  ('1201', 'Alter do Chão', 'Portalegre', 39.21297, -7.72483),
  ('1202', 'Arronches', 'Portalegre', 39.11685, -7.24332),
  ('1203', 'Avis', 'Portalegre', 39.06968, -7.91289),
  ('1204', 'Campo Maior', 'Portalegre', 39.02617, -7.05047),
  ('1205', 'Castelo de Vide', 'Portalegre', 39.46454, -7.49334),
  ('1206', 'Crato', 'Portalegre', 39.31331, -7.64497),
  ('1207', 'Elvas', 'Portalegre', 38.91047, -7.22885),
  ('1208', 'Fronteira', 'Portalegre', 39.076, -7.62663),
  ('1209', 'Gavião', 'Portalegre', 39.43881, -7.89498),
  ('1210', 'Marvão', 'Portalegre', 39.40528, -7.3628),
  ('1211', 'Monforte', 'Portalegre', 39.04783, -7.43535),
  ('1212', 'Nisa', 'Portalegre', 39.52285, -7.66764),
  ('1213', 'Ponte de Sor', 'Portalegre', 39.18789, -8.08262),
  ('1214', 'Portalegre', 'Portalegre', 39.26925, -7.39953),
  ('1215', 'Sousel', 'Portalegre', 38.96154, -7.73949),
  ('1301', 'Amarante', 'Porto', 41.27253, -8.04207),
  ('1302', 'Baião', 'Porto', 41.15756, -7.98929),
  ('1303', 'Felgueiras', 'Porto', 41.3506, -8.20158),
  ('1304', 'Gondomar', 'Porto', 41.10959, -8.48295),
  ('1305', 'Lousada', 'Porto', 41.28552, -8.27513),
  ('1306', 'Maia', 'Porto', 41.24495, -8.60136),
  ('1307', 'Marco de Canaveses', 'Porto', 41.15556, -8.15834),
  ('1308', 'Matosinhos', 'Porto', 41.21297, -8.67142),
  ('1309', 'Paços de Ferreira', 'Porto', 41.28851, -8.38002),
  ('1310', 'Paredes', 'Porto', 41.18149, -8.39616),
  ('1311', 'Penafiel', 'Porto', 41.15061, -8.29386),
  ('1312', 'Porto', 'Porto', 41.1617, -8.62093),
  ('1313', 'Póvoa de Varzim', 'Porto', 41.41909, -8.71788),
  ('1314', 'Santo Tirso', 'Porto', 41.32087, -8.44406),
  ('1315', 'Valongo', 'Porto', 41.20668, -8.49418),
  ('1316', 'Vila do Conde', 'Porto', 41.33801, -8.68285),
  ('1317', 'Vila Nova de Gaia', 'Porto', 41.07444, -8.58052),
  ('1318', 'Trofa', 'Porto', 41.31137, -8.56726),
  ('1401', 'Abrantes', 'Santarém', 39.42622, -8.1578),
  ('1402', 'Alcanena', 'Santarém', 39.47235, -8.68931),
  ('1403', 'Almeirim', 'Santarém', 39.15894, -8.57997),
  ('1404', 'Alpiarça', 'Santarém', 39.24112, -8.57055),
  ('1405', 'Benavente', 'Santarém', 38.86772, -8.81108),
  ('1406', 'Cartaxo', 'Santarém', 39.14579, -8.78961),
  ('1407', 'Chamusca', 'Santarém', 39.27156, -8.38033),
  ('1408', 'Constância', 'Santarém', 39.42567, -8.29147),
  ('1409', 'Coruche', 'Santarém', 38.9402, -8.44752),
  ('1410', 'Entroncamento', 'Santarém', 39.46436, -8.47866),
  ('1411', 'Ferreira do Zêzere', 'Santarém', 39.72135, -8.31688),
  ('1412', 'Golegã', 'Santarém', 39.38205, -8.51107),
  ('1413', 'Mação', 'Santarém', 39.60514, -7.97487),
  ('1414', 'Rio Maior', 'Santarém', 39.3289, -8.90141),
  ('1415', 'Salvaterra de Magos', 'Santarém', 39.04672, -8.68782),
  ('1416', 'Santarém', 'Santarém', 39.33694, -8.72917),
  ('1417', 'Sardoal', 'Santarém', 39.56297, -8.13851),
  ('1418', 'Tomar', 'Santarém', 39.60288, -8.38675),
  ('1419', 'Torres Novas', 'Santarém', 39.50552, -8.55083),
  ('1420', 'Vila Nova da Barquinha', 'Santarém', 39.48168, -8.40042),
  ('1421', 'Ourém', 'Santarém', 39.69233, -8.57429),
  ('1501', 'Alcácer do Sal', 'Setúbal', 38.36948, -8.48068),
  ('1502', 'Alcochete', 'Setúbal', 38.73564, -8.91588),
  ('1503', 'Almada', 'Setúbal', 38.63562, -9.19306),
  ('1504', 'Barreiro', 'Setúbal', 38.62842, -9.04496),
  ('1505', 'Grândola', 'Setúbal', 38.18551, -8.5812),
  ('1506', 'Moita', 'Setúbal', 38.65352, -9.0014),
  ('1507', 'Montijo', 'Setúbal', 38.72997, -8.69362),
  ('1508', 'Palmela', 'Setúbal', 38.61781, -8.80664),
  ('1509', 'Santiago do Cacém', 'Setúbal', 37.95312, -8.56803),
  ('1510', 'Seixal', 'Setúbal', 38.60461, -9.10879),
  ('1511', 'Sesimbra', 'Setúbal', 38.49491, -9.12013),
  ('1512', 'Setúbal', 'Setúbal', 38.51616, -8.88749),
  ('1513', 'Sines', 'Setúbal', 37.92485, -8.77774),
  ('1601', 'Arcos de Valdevez', 'Viana do Castelo', 41.90285, -8.36458),
  ('1602', 'Caminha', 'Viana do Castelo', 41.84755, -8.79086),
  ('1603', 'Melgaço', 'Viana do Castelo', 42.04961, -8.21329),
  ('1604', 'Monção', 'Viana do Castelo', 42.02725, -8.42637),
  ('1605', 'Paredes de Coura', 'Viana do Castelo', 41.91018, -8.57213),
  ('1606', 'Ponte da Barca', 'Viana do Castelo', 41.80675, -8.30991),
  ('1607', 'Ponte de Lima', 'Viana do Castelo', 41.75738, -8.5875),
  ('1608', 'Valença', 'Viana do Castelo', 41.9983, -8.60636),
  ('1609', 'Viana do Castelo', 'Viana do Castelo', 41.71699, -8.75935),
  ('1610', 'Vila Nova de Cerveira', 'Viana do Castelo', 41.91726, -8.70662),
  ('1701', 'Alijó', 'Vila Real', 41.30378, -7.48599),
  ('1702', 'Boticas', 'Vila Real', 41.67596, -7.73407),
  ('1703', 'Chaves', 'Vila Real', 41.75018, -7.43718),
  ('1704', 'Mesão Frio', 'Vila Real', 41.16392, -7.87101),
  ('1705', 'Mondim de Basto', 'Vila Real', 41.3887, -7.89508),
  ('1706', 'Montalegre', 'Vila Real', 41.77558, -7.85148),
  ('1707', 'Murça', 'Vila Real', 41.42239, -7.44073),
  ('1708', 'Peso da Régua', 'Vila Real', 41.18329, -7.76874),
  ('1709', 'Ribeira de Pena', 'Vila Real', 41.50884, -7.79699),
  ('1710', 'Sabrosa', 'Vila Real', 41.2523, -7.59864),
  ('1711', 'Santa Marta de Penaguião', 'Vila Real', 41.22807, -7.80225),
  ('1712', 'Valpaços', 'Vila Real', 41.61176, -7.34137),
  ('1713', 'Vila Pouca de Aguiar', 'Vila Real', 41.51097, -7.62327),
  ('1714', 'Vila Real', 'Vila Real', 41.31163, -7.73861),
  ('1801', 'Armamar', 'Viseu', 41.09489, -7.67756),
  ('1802', 'Carregal do Sal', 'Viseu', 40.44977, -7.98803),
  ('1803', 'Castro Daire', 'Viseu', 40.91287, -7.93289),
  ('1804', 'Cinfães', 'Viseu', 41.03525, -8.10255),
  ('1805', 'Lamego', 'Viseu', 41.0807, -7.82253),
  ('1806', 'Mangualde', 'Viseu', 40.59489, -7.7201),
  ('1807', 'Moimenta da Beira', 'Viseu', 40.96425, -7.63859),
  ('1808', 'Mortágua', 'Viseu', 40.4195, -8.25315),
  ('1809', 'Nelas', 'Viseu', 40.52687, -7.86521),
  ('1810', 'Oliveira de Frades', 'Viseu', 40.70371, -8.23837),
  ('1811', 'Penalva do Castelo', 'Viseu', 40.67131, -7.65589),
  ('1812', 'Penedono', 'Viseu', 40.99122, -7.39508),
  ('1813', 'Resende', 'Viseu', 41.07621, -7.93979),
  ('1814', 'Santa Comba Dão', 'Viseu', 40.40058, -8.11565),
  ('1815', 'São João da Pesqueira', 'Viseu', 41.1185, -7.438),
  ('1816', 'São Pedro do Sul', 'Viseu', 40.81639, -8.09464),
  ('1817', 'Sátão', 'Viseu', 40.77028, -7.67399),
  ('1818', 'Sernancelhe', 'Viseu', 40.91001, -7.5071),
  ('1819', 'Tabuaço', 'Viseu', 41.09426, -7.56554),
  ('1820', 'Tarouca', 'Viseu', 41.01393, -7.76211),
  ('1821', 'Tondela', 'Viseu', 40.54336, -8.12269),
  ('1822', 'Vila Nova de Paiva', 'Viseu', 40.87231, -7.76336),
  ('1823', 'Viseu', 'Viseu', 40.688, -7.90565),
  ('1824', 'Vouzela', 'Viseu', 40.67497, -8.13929),
  ('3101', 'Calheta', 'Madeira', 32.77028, -17.18232),
  ('3102', 'Câmara de Lobos', 'Madeira', 32.70228, -16.97668),
  ('3103', 'Funchal', 'Madeira', 32.58636, -16.88098),
  ('3104', 'Machico', 'Madeira', 32.74085, -16.80231),
  ('3105', 'Ponta do Sol', 'Madeira', 32.72275, -17.09392),
  ('3106', 'Porto Moniz', 'Madeira', 32.81702, -17.14671),
  ('3107', 'Ribeira Brava', 'Madeira', 32.70898, -17.03246),
  ('3108', 'Santa Cruz', 'Madeira', 32.6591, -16.78004),
  ('3109', 'Santana', 'Madeira', 32.78129, -16.90513),
  ('3110', 'São Vicente', 'Madeira', 32.78707, -17.01094),
  ('3201', 'Porto Santo', 'Madeira', 33.06663, -16.34379),
  ('4101', 'Vila do Porto', 'Açores', 36.97227, -25.09936),
  ('4201', 'Lagoa', 'Açores', 37.74587, -25.53584),
  ('4202', 'Nordeste', 'Açores', 37.82355, -25.2169),
  ('4203', 'Ponta Delgada', 'Açores', 37.81938, -25.72866),
  ('4204', 'Povoação', 'Açores', 37.76597, -25.26019),
  ('4205', 'Ribeira Grande', 'Açores', 37.80433, -25.45499),
  ('4206', 'Vila Franca do Campo', 'Açores', 37.74454, -25.41775),
  ('4301', 'Angra do Heroísmo', 'Açores', 38.70823, -27.24881),
  ('4302', 'Praia da Vitória', 'Açores', 38.74686, -27.15528),
  ('4401', 'Santa Cruz da Graciosa', 'Açores', 39.0522, -28.0102),
  ('4501', 'Calheta de São Jorge', 'Açores', 38.59423, -27.91416),
  ('4502', 'Velas', 'Açores', 38.68326, -28.15046),
  ('4601', 'Lajes do Pico', 'Açores', 38.43001, -28.22388),
  ('4602', 'Madalena', 'Açores', 38.48577, -28.4626),
  ('4603', 'São Roque do Pico', 'Açores', 38.49538, -28.31629),
  ('4701', 'Horta', 'Açores', 38.57812, -28.70024),
  ('4801', 'Lajes das Flores', 'Açores', 39.41365, -31.21419),
  ('4802', 'Santa Cruz das Flores', 'Açores', 39.47149, -31.19216),
  ('4901', 'Corvo', 'Açores', 39.69992, -31.10585)
on conflict (code) do update
  set name = excluded.name, district = excluded.district, lat = excluded.lat, lng = excluded.lng;

commit;
