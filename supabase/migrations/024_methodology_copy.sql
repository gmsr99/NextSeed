-- 024: nomes curtos e descrições em linguagem simples para os cartões de metodologia.
-- ai_generation_style e keywords ficam intactos: são esses que alimentam o prompt.

update methodologies set name = 'Montessori',
  short_description = 'Autonomia, materiais manipuláveis e respeito pelo ritmo da criança.'
  where sort_order = 1;

update methodologies set name = 'Pikler / RIE',
  short_description = 'Movimento livre, vínculo seguro e desenvolvimento ao ritmo da criança.'
  where sort_order = 2;

update methodologies set name = 'Waldorf',
  short_description = 'Artes, criatividade e aprendizagem ajustada ao desenvolvimento.'
  where sort_order = 3;

update methodologies set name = 'Charlotte Mason',
  short_description = 'Livros vivos, natureza e aprendizagem através da observação.'
  where sort_order = 4;

update methodologies set name = 'Forest School',
  short_description = 'Aprendizagem na natureza, exploração e descoberta ao ar livre.'
  where sort_order = 5;

update methodologies set name = 'Unschooling',
  short_description = 'Aprendizagem guiada pelos interesses e curiosidade da criança.'
  where sort_order = 6;

update methodologies set name = 'Educação Democrática',
  short_description = 'Autonomia, participação e decisões partilhadas na aprendizagem.'
  where sort_order = 7;

update methodologies set name = 'PBL',
  short_description = 'Aprender através de projetos com aplicação no mundo real.'
  where sort_order = 8;

update methodologies set name = 'IBL',
  short_description = 'Aprender investigando, questionando e descobrindo respostas.'
  where sort_order = 9;

update methodologies set name = 'STEAM',
  short_description = 'Ciência, tecnologia, engenharia, artes e matemática integradas.'
  where sort_order = 10;

update methodologies set name = 'Reggio Emilia',
  short_description = 'Aprendizagem guiada pela curiosidade e expressão da criança.'
  where sort_order = 11;

update methodologies set name = 'Educação Clássica',
  short_description = 'Conhecimento sólido, pensamento crítico e boa comunicação.'
  where sort_order = 12;

update methodologies set name = 'MEM',
  short_description = 'Cooperação, autonomia e aprendizagem através da participação.'
  where sort_order = 13;

update methodologies set name = 'Blended Learning',
  short_description = 'Combina aprendizagem digital com experiências presenciais.'
  where sort_order = 14;
