-- 029 — Vários manuais por criança e disciplina (pedido F-02, 16 nov)
--
-- Ex.: o manual de Matemática e o caderno de fichas. Cada um segue o seu
-- índice no Rumo do ano. A app passou a gravar por id (insert/update), por
-- isso a restrição única deixa de ser necessária.
--
-- A página onde a família vai fica dentro de `entries` (marcas done/from),
-- sem coluna nova.
--
-- Nota: a 028 está reservada para user_consents (branch feat/consentimentos).

alter table child_manuals drop constraint if exists child_manuals_child_id_discipline_key;

create index if not exists child_manuals_child_discipline_idx on child_manuals (child_id, discipline);
