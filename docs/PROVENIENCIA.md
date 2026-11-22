# Proveniência do código

Este repositório é desenvolvido com assistência de IA (Claude). Este documento explica como fica registado quem pediu, quem decidiu e quem aprovou cada alteração.

## O que fica registado e onde

| Prova | Onde fica | Quem a cria |
|---|---|---|
| Pedido e decisão de produto (problema, proposta, critérios de aceitação) | `BACKLOG.md` (ID estável) e especificação no chat ou no Google Doc do backlog | Equipa NexSeed, com o Claude a redigir |
| Implementação | Commits em branches `feat/…`, `fix/…`, `chore/…`, com autor humano e as linhas `Co-Authored-By` e `Claude-Session` | Claude, na sessão aberta pela equipa |
| Ligação ao pedido | Linha `Spec:` no corpo do commit | Claude |
| Aprovação humana | Linha `Aprovado:` no commit de merge para `main` | Claude, a partir da aprovação escrita no chat |
| Índice de tudo | Google Sheet "NexSeed \| Registo de proveniência do código" (um commit por linha, com colunas Spec, Aprovado por e Data) | Claude, depois de cada merge |
| Selo no tempo | Tag `selo-AAAA-MM` no `main` e cópia completa (`git bundle`) guardada no Drive no início de cada mês | Claude |

## Regras

- Nunca reescrever o histórico do `main` (sem `force push`, sem `rebase` de commits publicados).
- Nunca remover as linhas de coautoria dos commits.
- O registo é anterior a esta regra: os commits desde 25 de março de 2026 foram importados para o Google Sheet a 22 de novembro de 2026.

A titularidade jurídica do código é tratada fora deste repositório.
