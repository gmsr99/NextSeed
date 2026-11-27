-- Sementeira da Agenda (I-03a): eventos reais, públicos, para o Elton aprovar na triagem.
-- Correr DEPOIS da migração 041, com a service role e com OK do Elton.
-- Entram como PENDENTES; só aparecem às famílias depois de publicados em /agenda/triagem.
--
-- Regras (spec v2 §3.6): só informação pública; descrição escrita por nós; ligação ao
-- original; sem imagens; sem contactos pessoais. Fonte de cada um em source_url.
-- Verificado a 26 nov 2026 nas páginas oficiais: datas, horas e locais. Onde o preço ou
-- as idades não estavam na página, fica "Consultar na ligação" e idades em aberto: confirmar
-- na triagem. Hora de Lisboa em dezembro = UTC+0.
--
-- Uso: psql ... -v elton="'<uuid da conta do Elton>'" -f 041_agenda_sementeira_dez2026.sql
-- (o uuid não fica no repositório público).

begin;

insert into public.community_events
  (kind, title, description, organizer_name, municipality_code, venue, starts_at, ends_at, all_day,
   recurrence, recurrence_until, age_min, age_max, categories, is_free, price_text, url, source, source_url,
   status, declaration_accepted, submitted_by)
values
  ('evento', 'Óbidos Vila Natal: Pinóquio e o mundo das marionetas',
   'A vila de Natal de Óbidos, este ano dedicada às marionetas. Espetáculos, brincadeiras e atividades para toda a família, dentro das muralhas.',
   'Óbidos Criativa (Município de Óbidos)', '1012', 'Vila de Óbidos',
   '2026-11-27 00:00+00', '2027-01-03 23:59+00', true, 'none', null, null, null,
   '{teatro_espetaculos,arte_manuais}', false, 'Bilhete (ver preços na ligação)',
   'https://obidosvilanatal.pt/', 'manual', 'https://obidosvilanatal.pt/', 'pendente', true, :elton),

  ('evento', 'Leiria Natal 2026',
   'Programa de Natal no centro histórico de Leiria, com espetáculos e atividades ao longo de dezembro.',
   'Município de Leiria', '1009', 'Centro histórico',
   '2026-11-27 00:00+00', '2027-01-03 23:59+00', true, 'none', null, null, null,
   '{teatro_espetaculos,musica_danca}', false, 'Consultar na ligação',
   'https://leiriagenda.cm-leiria.pt/pt/agenda/leiria-natal-2026', 'manual',
   'https://leiriagenda.cm-leiria.pt/pt/agenda/leiria-natal-2026', 'pendente', true, :elton),

  ('evento', 'A Festa de Natal dos Monstros das Emoções',
   'Espetáculo de Natal no palco do Leiria Natal, a partir das personagens que ajudam as crianças a falar do que sentem.',
   'Município de Leiria', '1009', 'Palco Leiria Natal, Centro Cultural Mercado de Sant''Ana',
   '2026-12-13 16:00+00', '2026-12-13 17:00+00', false, 'none', null, null, null,
   '{teatro_espetaculos}', false, 'Consultar na ligação',
   'https://leiriagenda.cm-leiria.pt/pt/agenda/a-festa-de-natal-dos-monstros-das-emocoes', 'manual',
   'https://leiriagenda.cm-leiria.pt/pt/agenda/a-festa-de-natal-dos-monstros-das-emocoes', 'pendente', true, :elton),

  ('evento', 'Teatro de Natal: A Zebra do Pai Natal',
   'Teatro de Natal na Biblioteca Municipal de Leiria, numa sessão de sábado à tarde.',
   'Biblioteca Municipal Afonso Lopes Vieira', '1009', 'Biblioteca Municipal Afonso Lopes Vieira',
   '2026-12-19 16:00+00', '2026-12-19 17:00+00', false, 'none', null, null, null,
   '{teatro_espetaculos,livros_historias}', false, 'Consultar na ligação',
   'https://leiriagenda.cm-leiria.pt/pt/agenda/teatro-de-natal-a-zebra-do-pai-natal-2', 'manual',
   'https://leiriagenda.cm-leiria.pt/pt/agenda/teatro-de-natal-a-zebra-do-pai-natal-2', 'pendente', true, :elton),

  ('evento', 'Atelier de frottage: Pele de Pedra',
   'Oficina no Castelo de Leiria: decalcar com lápis as texturas das pedras e descobrir o castelo pelas mãos.',
   'Município de Leiria', '1009', 'Castelo de Leiria',
   '2026-12-19 15:30+00', '2026-12-19 17:00+00', false, 'none', null, null, null,
   '{arte_manuais,historia_patrimonio}', false, 'Consultar na ligação',
   'https://leiriagenda.cm-leiria.pt/pt/agenda/atelier-de-frottage-pele-de-pedra', 'manual',
   'https://leiriagenda.cm-leiria.pt/pt/agenda/atelier-de-frottage-pele-de-pedra', 'pendente', true, :elton),

  ('encontro', 'Clube Maternah: mães e bebés',
   'Encontro de mães (e pais) com bebés na Ludoteca Municipal de Leiria: brincar, conversar e conhecer outras famílias.',
   'Ludoteca Municipal de Leiria', '1009', 'Ludoteca Municipal de Leiria',
   '2026-12-16 15:00+00', '2026-12-16 16:30+00', false, 'none', null, 0, 2,
   '{movimento}', false, 'Consultar na ligação',
   'https://leiriagenda.cm-leiria.pt/pt/agenda/clube-maternah--maes-e-bebes-7', 'manual',
   'https://leiriagenda.cm-leiria.pt/pt/agenda/clube-maternah--maes-e-bebes-7', 'pendente', true, :elton),

  ('encontro', 'Clube de leitura para jovens: Sociedade das Raposas',
   'Clube de leitura para jovens na Biblioteca Municipal de Leiria. Junta-se em dezembro a 16 e a 18.',
   'Biblioteca Municipal Afonso Lopes Vieira', '1009', 'Biblioteca Municipal Afonso Lopes Vieira',
   '2026-12-16 17:30+00', '2026-12-16 18:30+00', false, 'none', null, null, null,
   '{livros_historias}', false, 'Consultar na ligação',
   'https://leiriagenda.cm-leiria.pt/pt/agenda/clube-de-leitura-para-jovens-sociedade-das-raposas-65', 'manual',
   'https://leiriagenda.cm-leiria.pt/pt/agenda/clube-de-leitura-para-jovens-sociedade-das-raposas-65', 'pendente', true, :elton),

  ('evento', 'Oficinas de Natal na Culturgest',
   'Quatro dias de oficinas artísticas nas férias de Natal (17, 18, 21 e 22 de dezembro). Manhãs das 10h às 13h ou tardes das 14h30 às 17h30, com grupos dos 6 aos 8 e dos 9 aos 12 anos. Inscrição obrigatória.',
   'Culturgest', '1106', 'Culturgest',
   '2026-12-17 10:00+00', '2026-12-22 17:30+00', false, 'none', null, 6, 12,
   '{arte_manuais}', false, '30 € (2 dias) ou 60 € (4 dias)',
   'https://www.culturgest.pt/pt/programacao/oficinas-de-natal/', 'manual',
   'https://www.culturgest.pt/pt/programacao/oficinas-de-natal/', 'pendente', true, :elton),

  ('evento', 'Oficina STEAM: passo a passo na programação criativa',
   'Oficina para famílias: construir histórias, jogos e animações com blocos coloridos (Scratch Jr.). Sessões às 11h e às 15h30, cerca de 2 horas. Inscrição no próprio dia, na bilheteira.',
   'Pavilhão do Conhecimento', '1106', 'Pavilhão do Conhecimento, Parque das Nações',
   '2026-12-05 11:00+00', '2026-12-05 13:00+00', false, 'none', null, 8, null,
   '{ciencia}', false, '2,50 € por pessoa, ou incluído no bilhete da exposição',
   'https://www.pavconhecimento.pt/educativo/oficina-steam', 'manual',
   'https://www.pavconhecimento.pt/educativo/oficina-steam', 'pendente', true, :elton),

  ('evento', 'Exposição Floresta: uma experiência de raiz',
   'Exposição interativa sobre a floresta no Pavilhão do Conhecimento. Aberta de terça a domingo (fecha à segunda).',
   'Pavilhão do Conhecimento', '1106', 'Pavilhão do Conhecimento, Parque das Nações',
   '2026-11-26 00:00+00', '2027-09-30 23:59+00', true, 'none', null, null, null,
   '{ciencia,natureza}', false, 'Bilhete do Pavilhão',
   'https://www.pavconhecimento.pt/exposicoes/floresta/', 'manual',
   'https://www.pavconhecimento.pt/exposicoes/floresta/', 'pendente', true, :elton);

-- Encontros de comunidade do Oeste: o Elton propõe-os pela própria app (/agenda/propor).

commit;
