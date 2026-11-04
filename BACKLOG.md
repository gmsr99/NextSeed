# NexSeed — Backlog de produto e desenvolvimento

Última atualização: 4 de novembro de 2026

Espelho em Google Docs: [NexSeed | Backlog](https://docs.google.com/document/d/1wXtLr3gHcJ5vKpuQ9a0mkORafchokye2dOJDw0dN_Cw/edit). Este ficheiro e o Doc têm o mesmo conteúdo; ver as regras de sincronização em `CLAUDE.md`.

Como ler:

- **Esforço:** S (até 1 h), M (meio dia a 1 dia), L (vários dias).
- **Dono:** Elton, Claude, ou Dono do repo (a conta `gmsr99`).
- **Estado:** Por fazer, Em curso, Aguarda decisão, Aguarda Elton, Feito.
- **Problema:** os 7 problemas do documento 01 (1 isolamento, 2 informação dispersa, 3 insegurança dos pais, 4 atividades, 5 inspiração, 6 decisões, 7 carga administrativa).
- **Ordem de prioridade:** conformidade primeiro, depois a qualidade do plano semanal, depois o portefólio para a entrega de dezembro e janeiro. Tudo o resto espera.

Tarefas de negócio (contabilista, entrevistas, preços, lista de famílias) vivem no plano de implementação (documento 08) e não aqui.

## 1. Bloqueantes de conformidade e acesso

| ID | Item | Porquê | Esforço | Dono | Estado |
|---|---|---|---|---|---|
| B-01 | Confirmar se a API do Gemini já está em faturação paga; se não, ativar e aceitar os termos de tratamento | No tier gratuito a Google pode usar os dados (de crianças) para treino. D-013, bloqueante nº 1 | S | Elton | Aguarda Elton |
| B-02 | Ativar a proteção contra passwords comprometidas no Supabase (Auth, Passwords) | Último aviso de segurança do Supabase por resolver (FASE 1) | S | Elton | Aguarda Elton |
| B-03 | Tornar o repositório privado | Repositório público com histórico que inclui nomes de crianças e planos internos. Ver nota em `estado_atual.md` sobre o plano da Vercel | S | Dono do repo | Aguarda decisão |
| B-04 | Dar ao Claude acesso ao projeto Supabase da NexSeed (convite para a organização ou ligação do conector a essa conta) | Sem isto não é possível verificar a base de dados real nem aplicar migrações | S | Dono do repo | Aguarda Elton |
| B-05 | Rotina de export semanal da base de dados para armazenamento próprio | Tier gratuito sem backups. D-025, condição obrigatória | M | Claude | Por fazer (depende de B-04) |
| B-06 | Confirmar regiões UE no Supabase e na Vercel | Fase A, A10 | S | Elton | Aguarda Elton |
| B-07 | Política de Privacidade: listar os subcontratantes (Google/Gemini, Supabase, Vercel, Resend) e o tratamento de dados de menores | A página `/privacidade` não menciona o Gemini. Fase A, A2 e A9 | M | Claude (rascunho) + revisão jurídica | Por fazer |
| B-08 | Termos de Utilização: declaração de autoridade parental, cláusula de cessão da posição contratual e política de reembolso | A página `/termos` não tem nenhuma das três. Fase A, A3 e A4; D-014 | M | Claude (rascunho) + revisão jurídica | Por fazer |
| B-09 | Consentimentos granulares registados no produto (quem, quando, a quê, versão dos termos) | Fase A, A6. Não existe tabela de consentimentos | M | Claude | Por fazer (precisa de especificação) |

## 2. Agora: qualidade do plano semanal

| ID | Item | Porquê | Esforço | Dono | Estado |
|---|---|---|---|---|---|
| P-01 | Deixar de enviar o currículo inteiro do ano ao modelo quando nada está marcado como "em progresso" (heurística de janela ou marcação obrigatória no onboarding) | Planos gerados sem sinal de prioridade na feature que decide o produto. Doc 03 §5.3, INS-06. Problema 3, 7 | M | Claude | Por fazer (precisa de especificação) |
| P-02 | Tornar visível a marcação "em progresso / dominado" nas Áreas de Aprendizagem | As famílias não a descobrem, e sem ela aplica-se o P-01. INS-06 | S | Claude | Por fazer |
| P-03 | Pseudonimizar os nomes das crianças no pedido ao Gemini (enviar "Criança A, 8 anos" e repor o nome no resultado) | Minimização de dados enviados a subcontratante. Doc 04 §2, FASE 4.5.4. Remendo, não substitui o B-01 | M | Claude | Aguarda decisão |
| P-04 | Envelope de tempo por criança: dias da semana, minutos por dia, datas do ano letivo | O plano é gerado para uma semana que a família não tem. INS-03, decisão em aberto A-08 | L | Claude | Aguarda decisão |
| P-05 | Decidir se a análise de cobertura curricular mantém o "thinking" do Gemini | Metade do custo dessa função; pode estar a melhorar a qualidade. A-04 | S | Claude + Elton | Por fazer |

## 3. Portefólio para a entrega de dezembro e janeiro

| ID | Item | Porquê | Esforço | Dono | Estado |
|---|---|---|---|---|---|
| R-01 | Testar o portefólio e o relatório trimestral com uma família do beta, na entrega real à escola | "A entrega que decide tudo" (doc 08, Bloco 3). Problema 7 | M | Elton | Por fazer |
| R-02 | Corrigir o que o R-01 revelar | Idem | M | Claude | Por fazer (depende de R-01) |
| R-03 | Validar a secção "relatorios" do Manual (está marcada como rascunho) | Linguagem legal sobre o portefólio. FASE 2.3 | S | Elton | Aguarda Elton |

## 4. Qualidade técnica

| ID | Item | Porquê | Esforço | Dono | Estado |
|---|---|---|---|---|---|
| T-01 | Auditoria em telemóvel real: upload pela câmara, botões, PWA | FASE 3.5 ficou por fazer | S | Elton | Aguarda Elton |
| T-02 | Limpar os 101 erros do verificador de tipos (sobretudo imports não usados) | A build passa, mas os erros escondem problemas novos | S | Claude | Por fazer |
| T-03 | Decidir o destino das páginas mock inalcançáveis (Fórum, Comunidade, Formação para Pais) e das pastas soltas na raiz | Código morto e documentação dispersa. FASE 3.6 | S | Elton | Aguarda decisão |
| T-04 | Corrigir `Ponto de situação/contexto_chat.json` (JSON inválido) ou apagá-lo | Ficheiro de contexto antigo, substituído por `CLAUDE.md` | S | Claude | Por fazer |
| T-05 | Confirmar que o histórico de migrações local corresponde à produção | Algumas migrações foram aplicadas à mão (B8 do diagnóstico) | S | Claude | Por fazer (depende de B-04) |

## 5. Ideias e pedidos em estudo

| ID | Item | Origem | Estado |
|---|---|---|---|
| I-01 | Indexar manuais escolares (só índice e orientação de páginas, nunca conteúdo) e distribuir páginas por dia com garantia de cobertura | F-01, INS-01 e INS-05. Depende do P-04 e de parecer sobre direitos de autor (A-09) | Em estudo |
| I-02 | Segunda sequência curricular por metodologia (Montessori, Charlotte Mason) | F-01, INS-04. Trabalho de curadoria pedagógica | Em estudo |
| I-03 | Camada de comunidade: perfil de família, mapa, feed de partilhas, agenda | Documento 01 §5. Cada peça precisa de revisão RGPD antes de avançar | Em estudo |
| I-04 | Subscrição com Stripe | FASE 4.1, adiada para o lançamento de janeiro | Em estudo |
| I-05 | Página pública da coorte fundadora e do sinal de 20 euros | Documento 07 | Em estudo |
| I-06 | Gerador de ideias grátis, sem login | Documento 02 §5 | Em estudo |

## 6. Feito recentemente

| ID | Item | Data |
|---|---|---|
| OK-01 | Fotos comprimidas no telemóvel antes do upload (cerca de 10 vezes menos armazenamento; remove a localização GPS das fotos) | 4 nov 2026 (branch `chore/auditoria-backlog-claude-md`) |
| OK-02 | Nomes de famílias e crianças removidos da documentação do repositório e do exemplo mostrado no onboarding | 4 nov 2026 (idem) |
| OK-03 | Gemini só no servidor, chaves rodadas; fotos em bucket privado; funções do servidor com autenticação | julho 2026 (FASE 1) |
| OK-04 | Onboarding, Manual em `/ajuda`, visitas guiadas, dashboard "Hoje", PWA | julho 2026 (FASES 2 e 3) |
| OK-05 | Exportar dados e eliminar conta; sistema de feedback e métricas em `/admin/feedback` | julho 2026 (FASES 4.5 e 5) |
