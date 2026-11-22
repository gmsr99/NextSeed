# NexSeed — instruções para o Claude

Lê este ficheiro no início de cada sessão. É a fonte das regras de trabalho neste repositório.

## O produto em duas linhas
App web para famílias em ensino doméstico em Portugal: cruza o currículo oficial (DGE, pré-escolar ao 4.º ano) com os interesses de cada criança, gera o plano semanal e transforma o registo diário em portefólio e relatórios para entregar à escola. As duas âncoras são o **gerador de plano semanal** (a feature que decide o produto) e o **portefólio**.

A estratégia de negócio (preços, legal, marca, decisões D-NNN) vive na base de conhecimento do projeto Claude "NexSeed | DEV", **não neste repositório**. Os números de documento citados aqui (01 a 10) referem-se a essa base.

## Papéis
- **Elton**: produto e pesquisa. Testa, recolhe feedback das famílias, decide prioridades.
- **Claude**: gestor de produto e programador. Especifica, propõe a ordem, implementa.
- **Dono do repositório** (`gmsr99`): tem permissões de administração no GitHub e no Supabase.

## Stack
- React + TypeScript + Vite + Tailwind + shadcn/ui, TanStack Query, framer-motion, PWA (`vite-plugin-pwa`)
- Supabase: Postgres com RLS, Auth, Storage, Edge Functions (Deno) em `supabase/functions/`
- IA: Gemini 2.5 Flash, **só** através da edge function `generate-weekly-plan` (proxy autenticado). Nunca chamar o Gemini a partir do cliente.
- PDFs no browser com `@react-pdf/renderer` (`src/components/pdf/`)
- Deploy: Vercel → nexseed.pt. Push para `main` = produção. Cada branch tem pré-visualização.

## Comandos
```
npm ci            # instalar
npm run dev       # servidor local
npm run build     # build de produção (tem de passar)
npm test          # vitest (tem de passar)
npm run lint
npx tsc -p tsconfig.app.json --noEmit   # tem erros antigos (ver T-02); não acrescentar novos
```

## Convenções do código (respeitar)
- **Isolamento por família:** todas as tabelas filtram por `family_id` e a RLS valida com `my_family_id()`. Nunca filtrar por `user_id`.
- **Currículo:** a única fonte é a base de dados (`useCurriculum`). Não voltar a criar JSONs de currículo no código.
- **Fotos:** bucket `activity-photos` é privado. Guarda-se o *path* na BD e lê-se com signed URLs (`src/lib/photoStorage.ts`). As fotos são comprimidas no cliente antes do upload (`src/lib/imageCompression.ts`).
- **Edge functions:** sempre `verify_jwt=true`; o destinatário ou a família vêm do JWT, nunca do corpo do pedido.
- **Ano escolar:** `children.school_year` tem CHECK com os valores da app; "Pré-escolar" com P maiúsculo.
- **Supabase (decisão do dono, 5 nov):** o Claude **não** interage com as bases de dados de produção, nem por conector nem por CLI. Migrações e edge functions entregam-se como ficheiros no repositório, com instruções curtas para o dono do repo as publicar. Atenção: alterações em `supabase/functions/` **não** são publicadas pela Vercel.
- **Migrações:** ficheiros numerados em `supabase/migrations/` (028 reservada para os consentimentos; próximo: 031).
- **Textos da app:** português de Portugal, na voz NexSeed (doc 06): claro, humano, sem alarmismo, nunca comunicar pelo medo.

## Como trabalhamos
1. **Ideia ou pedido** → classificar (bug, melhoria, nova, ideia) → verificar contra as decisões (doc 09) e os 7 problemas (doc 01).
2. **Especificação curta** antes de programar qualquer coisa M ou L: problema, proposta, critérios de aceitação, impacto técnico, riscos (RGPD, regressões), esforço. Esperar pelo OK.
3. **Implementar num branch** (`feat/…`, `fix/…`, `chore/…`), nunca diretamente no `main`.
4. **Verificar:** build, testes, e testar o comportamento (browser real quando houver UI).
5. **Entregar** o link de pré-visualização da Vercel. Merge para `main` só com OK. O Elton não usa o GitHub: aprova no chat ("aprovado", "podes publicar") e o Claude faz o merge e confirma que a produção atualizou.
6. **Atualizar** `BACKLOG.md`, o Google Doc espelho e `Ponto de situação/estado_atual.md` no mesmo branch.

## Regras que não se negociam
- **Dados de crianças:** nada que toque em dados de menores avança sem passar pelo doc 04 (RGPD). Minimizar o que se recolhe e o que se envia ao Gemini.
- **Sem nomes reais na documentação:** famílias são `F-01`, `F-02`; crianças são `C1`, `C2`. Nunca nomes, escolas, moradas ou capturas com dados reais. Para demonstrações, conta fictícia.
- **Sem segredos no cliente:** tudo o que começa por `VITE_` é público.
- **Orçamento de tempo:** o fundador tem 4 h por semana (D-023). Propor sempre a versão mais pequena que resolve o problema.
- **Ordem de prioridade:** conformidade → qualidade do plano semanal → portefólio para dez/jan → resto.

## Backlog: ficheiro e Google Doc
- Fonte: `BACKLOG.md` (neste repositório).
- Espelho para o Elton: [NexSeed | Backlog](https://docs.google.com/document/d/1wXtLr3gHcJ5vKpuQ9a0mkORafchokye2dOJDw0dN_Cw/edit) — ID `1wXtLr3gHcJ5vKpuQ9a0mkORafchokye2dOJDw0dN_Cw`.
- **No início da sessão (arranque leve):** do `BACKLOG.md`, ler só o topo (perguntas Q, tabela "Para testar", "Ordem de implementação") e a secção E do trabalho do dia. Do Google Doc, ler com comentários mas procurar apenas três coisas: respostas na coluna "Resposta" das Q, resultados na tabela de testes e comentários novos. O que o Elton tiver escrito lá passa para o `BACKLOG.md`. Não reler o Doc inteiro: é um espelho do ficheiro.
- **Arquivo:** o que está feito e confirmado sai do `BACKLOG.md` para `BACKLOG_ARQUIVO.md`, no repositório. O Google Doc espelha só o backlog ativo. Não ler o arquivo no arranque.
- **Sempre que o `BACKLOG.md` muda:** aplicar a mesma alteração ao Doc no mesmo dia, com edições pontuais (mudar um estado, acrescentar uma linha), sem recriar o documento, para não perder comentários nem o link. Atualizar a data de "Última atualização" nos dois.
- **Perguntas para o Elton:** tudo o que precisa de resposta dele vai para a tabela "Perguntas à espera de resposta", no topo do backlog (IDs Q-NN), em vez de ficar só no chat. Ele responde na coluna "Resposta" do Google Doc. No início da sessão, ler essas respostas, agir sobre elas e tirar da tabela as perguntas tratadas. Nunca apagar o que ele escreveu nessa coluna.
- **Para testar:** cada publicação acrescenta linhas à tabela "Para testar" do backlog (IDs V-NN: onde, o que fazer, o que deve acontecer). O Elton escreve os resultados no Google Doc "Testes NexSeed" (ID `104uet4031oozWlBr10oaEdndpFG8S8FZ0vjePL5kA4M`, uma cópia da tabela adaptada à conta dele: 2.º ano e pré-escolar), ou na própria tabela do backlog. Ler os dois no início da sessão, corrigir o que falhou e tirar as linhas confirmadas.
- **Pré-visualizações:** o Elton não tem acesso às pré-visualizações da Vercel (Q-12). Só vê o que está publicado. Testar bem antes de pedir aprovação e dizer sempre o que não foi testado.
- IDs estáveis por secção: B (bloqueantes), P (plano semanal), R (portefólio e relatórios), T (técnico), I (ideias), OK (feito). Um ID nunca é reutilizado.

## Proveniência do código (obrigatório em cada entrega)
O objetivo é que qualquer pessoa consiga reconstituir, anos depois, quem pediu, quem decidiu e quem aprovou cada alteração. Ver `docs/PROVENIENCIA.md`.
- **Commits:** usar o modelo `.gitmessage` (`git config commit.template .gitmessage`). Cada commit de `feat`/`fix` leva no corpo as linhas `Spec:` (ID do backlog e, se houver, link da especificação) e, no commit de merge para `main`, `Aprovado:` (quem aprovou e a data, tal como foi escrito no chat). Manter as linhas `Co-Authored-By` e `Claude-Session`.
- **Registo:** depois de cada merge para `main`, acrescentar as linhas novas ao Google Sheet "NexSeed | Registo de proveniência do código" (Drive › NexSeed › 3. Produto/Tecnologia › Proveniência do código), preenchendo as colunas Spec, Aprovado por e Data de aprovação.
- **Selo mensal:** no primeiro dia útil de cada mês, criar a tag anotada `selo-AAAA-MM` no `main` e guardar no Drive, na mesma pasta, um `git bundle` completo com a data no nome.

## Onde está o quê
- `BACKLOG.md`: o que falta fazer, por prioridade
- `Ponto de situação/estado_atual.md`: estado real da app (atualizar a cada entrega)
- `2. PLANO DE IMPLEMENTACAO/`: fases 1 a 5 (histórico de execução até julho 2026)
- `1. INSTRUCOES FUNDAMENTAIS/`: visão original da app
- `src/content/manual/`: manual de ajuda da app (`/ajuda`)
