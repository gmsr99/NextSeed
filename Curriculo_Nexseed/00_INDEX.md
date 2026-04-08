# NexSeed - Currículo de Metodologias de Ensino Doméstico
## Índice Geral

> Este repositório contém investigação aprofundada sobre 14 metodologias pedagógicas para homeschooling.
> Serve como base informativa para popular a base de dados Supabase e para que a IA (Claude) gere planos semanais personalizados.
>
> **Lógica de triangulação da IA:**
> `Currículo DGE (obrigatório)` ⟷ `Metodologias NexSeed (escolhidas pelo utilizador)` ⟷ `Interesses da criança`

---

## Estrutura de Cada Ficheiro

Cada ficheiro `.md` segue a mesma estrutura de 15 secções:

1. Filosofia e Origem
2. Princípios Fundamentais
3. O Papel do Educador
4. Ambiente e Materiais
5. Estrutura do Dia / Rotina Tipo
6. Aplicação por Faixa Etária (pré-escolar → 3.º ciclo)
7. Áreas Curriculares
8. Integração com o Currículo Nacional Português (DGE)
9. Avaliação e Acompanhamento do Progresso
10. Pontos Fortes para Homeschooling
11. Desafios e Como Superar
12. Sinergias com Outras Metodologias
13. Atividades Modelo para Geração de Planos pela IA
14. Palavras-chave e Prompts para IA
15. Referências, Livros e Recursos

O frontmatter YAML de cada ficheiro inclui os campos necessários para a base de dados:
- `slug` - identificador único
- `name` - nome completo
- `category` - categoria pedagógica
- `age_focus` - faixas etárias principais
- `intensity` - nível de estrutura/intensidade
- `materials_cost` - custo estimado de materiais
- `ai_generation_style` - instrução direta para a IA

---

## Tabela de Metodologias

| # | Ficheiro | Metodologia | Categoria | Idades | Intensidade | Custo |
|---|----------|-------------|-----------|--------|-------------|-------|
| 01 | [01_Montessori.md](01_Montessori.md) | Montessori | Pedagogias Clássicas | 0–15 | Alta | Médio-Alto |
| 02 | [02_Pikler.md](02_Pikler.md) | Pikler / RIE | Pedagogias Clássicas | 0–6 | Baixa | Baixo |
| 03 | [03_Waldorf.md](03_Waldorf.md) | Waldorf | Pedagogias Clássicas | 0–15 | Média | Médio |
| 04 | [04_Charlotte_Mason.md](04_Charlotte_Mason.md) | Charlotte Mason | Pedagogias Clássicas | 3–15 | Média | Baixo |
| 05 | [05_Forest_School.md](05_Forest_School.md) | Forest School | Natureza e Experiência | 3–15 | Baixa | Baixo |
| 06 | [06_Unschooling.md](06_Unschooling.md) | Unschooling | Alta Autonomia | 0–15 | Muito Baixa | Baixo |
| 07 | [07_Educacao_Democratica.md](07_Educacao_Democratica.md) | Educação Democrática | Alta Autonomia | 5–15 | Baixa | Baixo |
| 08 | [08_Project_Based_Learning.md](08_Project_Based_Learning.md) | Project-Based Learning | Aprendizagem Ativa | 5–15 | Alta | Baixo-Médio |
| 09 | [09_Inquiry_Based_Learning.md](09_Inquiry_Based_Learning.md) | Inquiry-Based Learning | Aprendizagem Ativa | 5–15 | Média | Baixo |
| 10 | [10_STEAM.md](10_STEAM.md) | STEAM | Contemporâneo | 3–15 | Média | Médio |
| 11 | [11_Reggio_Emilia.md](11_Reggio_Emilia.md) | Reggio Emilia | Natureza e Experiência | 0–10 | Baixa | Baixo-Médio |
| 12 | [12_Classical_Education.md](12_Classical_Education.md) | Classical Education | Modelos Estruturados | 6–15 | Alta | Médio |
| 13 | [13_Movimento_Escola_Moderna.md](13_Movimento_Escola_Moderna.md) | Movimento Escola Moderna | Aprendizagem Ativa | 6–15 | Média | Baixo |
| 14 | [14_Blended_Learning.md](14_Blended_Learning.md) | Blended Learning | Contemporâneo | 6–15 | Média | Médio |

---

## Agrupamento por Perfil de Família

### 🧘 Pais que valorizam autonomia e ritmo natural da criança
- **Pikler** (bebés/toddlers)
- **Reggio Emilia** (pré-escolar)
- **Unschooling** (todos)
- **Educação Democrática** (a partir dos 5-6 anos)

### 🌿 Pais ligados à natureza e experiência direta
- **Forest School** (todos)
- **Charlotte Mason** (nature study, living books)
- **Waldorf** (ritmo sazonal, festividades)
- **Reggio Emilia** (atelier, ambiente natural)

### 🏛️ Pais que querem estrutura e bases sólidas
- **Montessori** (materiais estruturados, autonomia com limites)
- **Classical Education** (trivium, cronologia histórica)
- **Charlotte Mason** (hábitos, disciplina, lições curtas)
- **Waldorf** (épocas de ensino, ritmo semanal)

### 🔬 Pais orientados para projetos e descoberta
- **Project-Based Learning** (projetos com propósito real)
- **Inquiry-Based Learning** (perguntas e investigação)
- **STEAM** (ciência, tecnologia, artes integradas)
- **MEM** (cooperação, texto livre, projetos sociais)

### 💻 Pais que integram tecnologia
- **Blended Learning** (híbrido online/offline)
- **STEAM** (programação, makers)
- **PBL** (produtos digitais como entrega)

---

## Compatibilidade entre Metodologias (Combinações Recomendadas)

```
Montessori + Charlotte Mason     → Excelente (autonomia + living books)
Montessori + Reggio Emilia       → Excelente (criança no centro)
Waldorf + Charlotte Mason        → Muito boa (ritmo + natureza + artes)
Forest School + Unschooling      → Excelente (natureza + liberdade)
Forest School + Charlotte Mason  → Muito boa (nature study)
PBL + STEAM                      → Excelente (projetos com componente científica)
PBL + IBL                        → Excelente (investigação com produto final)
MEM + PBL                        → Muito boa (cooperação + projeto real)
Classical + Charlotte Mason      → Muito boa (estrutura + living books)
Blended + PBL                    → Muito boa (projetos com ferramentas digitais)
Waldorf + Forest School          → Muito boa (natureza + ritmo sazonal)
```

---

## Mapeamento para Base de Dados Supabase

### Tabelas sugeridas

```sql
-- Tabela principal de metodologias
CREATE TABLE methodologies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  short_description TEXT,
  philosophy TEXT,
  intensity TEXT CHECK (intensity IN ('baixa', 'media', 'alta')),
  materials_cost TEXT CHECK (materials_cost IN ('baixo', 'medio', 'alto')),
  ai_generation_style TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Princípios de cada metodologia
CREATE TABLE methodology_principles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  methodology_id UUID REFERENCES methodologies(id),
  title TEXT NOT NULL,
  description TEXT,
  sort_order INT
);

-- Faixas etárias suportadas
CREATE TABLE methodology_age_ranges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  methodology_id UUID REFERENCES methodologies(id),
  age_range TEXT NOT NULL,  -- 'pre-escolar' | '1ciclo' | '2ciclo' | '3ciclo'
  focus_description TEXT,
  typical_activities JSONB  -- array de atividades
);

-- Atividades tipo por metodologia e disciplina
CREATE TABLE methodology_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  methodology_id UUID REFERENCES methodologies(id),
  discipline_key TEXT NOT NULL,  -- 'math' | 'language' | 'science' | etc.
  age_range TEXT,
  activity_title TEXT NOT NULL,
  activity_description TEXT,
  materials TEXT[],
  duration_minutes INT
);

-- Palavras-chave para IA
CREATE TABLE methodology_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  methodology_id UUID REFERENCES methodologies(id),
  keyword TEXT NOT NULL,
  weight FLOAT DEFAULT 1.0  -- importância relativa para a IA
);

-- Seleção de metodologias por família
CREATE TABLE family_methodologies (
  family_id UUID REFERENCES families(id),
  methodology_id UUID REFERENCES methodologies(id),
  priority INT DEFAULT 1,  -- 1=principal, 2=secundária
  PRIMARY KEY (family_id, methodology_id)
);
```

---

## Guia de Uso para a IA (Prompt Engineering)

Quando uma família seleciona metodologias, a IA recebe contexto estruturado assim:

```
METODOLOGIAS SELECIONADAS:
- Principal: Montessori (ai_generation_style: "Propõe atividades práticas...")
- Secundária: Charlotte Mason (ai_generation_style: "Usa living books...")

DISCIPLINAS → ATIVIDADES:
[conteúdo das tabelas methodology_activities para estas metodologias]

PALAVRAS-CHAVE ATIVAS:
[keywords das metodologias selecionadas]

TRIANGULAÇÃO:
- DGE: [objetivos da semana por ano/disciplina]
- NexSeed: [atividades filtradas pelas metodologias acima]
- Interesses da criança: [interesses selecionados pelo pai]
```

---

## Estatísticas do Repositório

| Métrica | Valor |
|---------|-------|
| Total de metodologias | 14 |
| Total de linhas de conteúdo | ~7.600 |
| Total de ficheiros | 15 (14 + índice) |
| Faixas etárias cobertas | 0–15 anos |
| Disciplinas cobertas | 8 (matemática, português, ciências, história/geo, artes, música, ed. física, vida prática) |
| Língua | Português (PT) |
| Alinhamento curricular | DGE Portugal + OCEPE + PASEO |

---

## Próximos Passos

- [ ] Popular tabela `methodologies` com os 14 slugs e metadados
- [ ] Popular `methodology_principles` (8-12 princípios por metodologia)
- [ ] Popular `methodology_activities` (4-6 atividades por disciplina × metodologia)
- [ ] Popular `methodology_keywords` (20-30 keywords por metodologia)
- [ ] Criar UI na app para o utilizador selecionar metodologias
- [ ] Integrar seleção no prompt de geração do Gemini/Claude
- [ ] Testar triangulação DGE ⟷ Metodologia ⟷ Interesses

---

*Gerado para NexSeed - Plataforma de Homeschooling Portuguesa*
*Repositório: `/NexSeed/V2/Curriculo_Nexseed/`*
