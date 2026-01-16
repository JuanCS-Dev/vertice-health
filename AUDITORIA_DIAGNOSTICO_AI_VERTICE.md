# Relatório Técnico: Auditoria de Diagnóstico IA & Blueprint de Migração (Vertice-ai-health)

**Data:** 15/01/2026
**Origem:** Auditoria do Sistema `ClinicaGenesisOS`
**Destino:** Implementação no `Vertice-ai-health` (Hackathon Gemini 3)
**Objetivo:** Migrar arquitetura "Dual-Model (Gemini + GPT-4o)" para "Single-Model Multi-Persona (Gemini 3 Pro x3)".

---

## 1. Análise da Arquitetura Atual (`ClinicaGenesisOS`)

O sistema atual utiliza uma arquitetura de consenso ponderado (Weighted Consensus) baseada em dois modelos distintos operando em paralelo.

### 1.1 Fluxo de Execução (`analysis-pipeline.ts`)
O arquivo `functions/src/ai/analysis-pipeline.ts` orquestra a chamada. A função `runFusionLayer` é o coração do sistema:

1.  **Entrada:** Dados do paciente, exames, triagem e correlações.
2.  **Paralelismo:** Executa `Promise.allSettled` disparando:
    *   `Gemini 2.5 Flash` (Modelo Primário - Vertex AI)
    *   `GPT-4o-mini` (Modelo Challenger - Azure OpenAI)
3.  **Falha Graciosa:** Se o GPT falha ou não está configurado, o sistema faz fallback para "Single Model" com penalidade de confiança.

**Código Atual (Pontos Críticos de Acoplamento):**
```typescript
// functions/src/ai/analysis-pipeline.ts

// ACoplamento Rígido a 2 Modelos Específicos
const [geminiResult, gptResult] = await Promise.allSettled([
  client.models.generateContent({ model: GEMINI_MODEL, ... }),
  isAzureOpenAIConfigured() ? callAzureOpenAI(...) : Promise.resolve(null),
]);

// Parsing manual e específico para cada provedor
if (geminiResult.status === 'fulfilled') { /* parse Gemini JSON */ }
if (gptResult.status === 'fulfilled') { /* parse Azure JSON */ }
```

### 1.2 Motor de Consenso (`multi-llm-aggregator.ts`)
O algoritmo de agregação (baseado em NEJM AI 2024) utiliza o método **1/r (Reciprocal Rank Fusion)**.

*   **Problema para Migração:** As estruturas de dados `DiagnosisScore` e a função `aggregateDiagnoses` estão *hardcoded* para as chaves `'gemini'` e `'gpt4o'`.
*   **Lógica de Consenso:** A função `determineConsensusLevel` compara explicitamente `geminiRank` vs `gptRank`.

```typescript
// functions/src/ai/multi-llm-aggregator.ts

// Estrutura Rígida
interface DiagnosisScore {
  // ...
  sources: Map<'gemini' | 'gpt4o', { rank: number; ... }>; // <--- LIMITANTE
}

// Lógica Rígida
const gemini = data.sources.get('gemini');
const gpt4o = data.sources.get('gpt4o');
```

---

## 2. Blueprint de Implementação: Arquitetura "Trinity" (3 Personas)

Para o `Vertice-ai-health`, a arquitetura deve ser agnóstica quanto ao "modelo" subjacente (todos serão Gemini 3 Pro), mas deve diferenciar a **"Persona"** (Ponto de Vista).

### 2.1 As Três Personas (System Prompts)

Ao invés de variar o modelo, variaremos a instrução sistêmica (`System Instruction`).

1.  **Persona A: O Internista Conservador (Dr. House - mas seguro)**
    *   **Foco:** Diretrizes clínicas, protocolos padrão, segurança do paciente.
    *   **Viés:** Evitar falsos positivos, recomendar exames confirmatórios padrão.
    *   **Prompt Key:** `PERSONA_CONSERVATIVE`

2.  **Persona B: O Especialista Agressivo/Investigativo**
    *   **Foco:** Doenças raras, correlações sutis, diagnóstico precoce.
    *   **Viés:** Alta sensibilidade, considera zebras (doenças raras).
    *   **Prompt Key:** `PERSONA_AGGRESSIVE`

3.  **Persona C: O Acadêmico Baseado em Evidências**
    *   **Foco:** Literatura recente, estatística, fisiopatologia.
    *   **Viés:** Requer alta prova de evidência, cita papers/estudos.
    *   **Prompt Key:** `PERSONA_ACADEMIC`

### 2.2 Refatoração do Agregador (`multi-llm-aggregator.ts`)

O novo agregador deve aceitar um array dinâmico de fontes.

**Nova Interface Proposta:**
```typescript
type SourceId = string; // ex: 'conservative', 'aggressive', 'academic'

interface DiagnosisSource {
  sourceId: SourceId;
  rank: number;
  confidence: number;
  reasoning: string;
}

interface DiagnosisScore {
  name: string;
  score: number;
  sources: Map<SourceId, DiagnosisSource>; // Mapa Genérico
  // ...
}
```

**Novo Algoritmo de Consenso (Genérico para N fontes):**
```typescript
export function determineConsensusLevel(sources: Map<SourceId, DiagnosisSource>): ConsensusLevel {
  const sourceCount = sources.size;
  if (sourceCount <= 1) return 'single';

  // Extrair ranks
  const ranks = Array.from(sources.values()).map(s => s.rank);
  const maxDiff = Math.max(...ranks) - Math.min(...ranks);
  
  // Lógica adaptada para 3 personas
  // Se todas concordam (maxDiff == 0) -> Strong
  // Se variam pouco (maxDiff <= 1) -> Moderate
  // Se variam muito -> Weak/Divergent
  
  if (sourceCount === 3) {
      if (maxDiff === 0) return 'strong'; // Unanimidade
      if (maxDiff <= 2) return 'moderate'; // Consenso majoritário ou próximo
      return 'divergent';
  }
  
  // ... lógica para 2 fontes (compatibilidade)
}
```

### 2.3 Refatoração do Pipeline (`analysis-pipeline.ts`)

O novo pipeline executará 3 chamadas paralelas ao mesmo modelo (`gemini-3-pro`), variando apenas o `systemInstruction`.

```typescript
// Implementação sugerida para Vertice-ai-health

const PERSONAS = [
  { id: 'conservative', prompt: PROMPTS.CONSERVATIVE, temperature: 0.1 },
  { id: 'aggressive', prompt: PROMPTS.AGGRESSIVE, temperature: 0.4 }, // Mais criativo
  { id: 'academic', prompt: PROMPTS.ACADEMIC, temperature: 0.2 }
];

// Execução Paralela
const results = await Promise.allSettled(
  PERSONAS.map(persona => 
    client.models.generateContent({
      model: 'gemini-1.5-pro-002', // ou gemini-3-pro se disponível
      config: {
        systemInstruction: persona.prompt,
        temperature: persona.temperature
      },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }]
    })
  )
);

// Normalização
const inputs: ModelDiagnosisInput[] = results.map((res, index) => {
    if (res.status === 'rejected') return null;
    return parseGeminiResponse(res.value, PERSONAS[index].id);
}).filter(Boolean);

// Agregação
const consensus = aggregateDiagnoses(inputs);
```

---

## 3. Guia de Implementação Rápida

Para implementar isso no `Vertice-ai-health` em tempo recorde:

1.  **Copie os Arquivos Base:**
    *   Copie a pasta `functions/src/ai/types` (ajuste `consensus.types.ts`).
    *   Copie `functions/src/ai/multi-llm-aggregator.ts`.
    *   Copie `functions/src/ai/analysis-pipeline.ts`.

2.  **Aplique as Modificações:**
    *   No `types/consensus.types.ts`: Remova referências a 'gemini'/'gpt4o'. Use `string` para `sourceId`.
    *   No `multi-llm-aggregator.ts`: Substitua o `Map<'gemini' | 'gpt4o', ...>` por `Map<string, ...>`. Atualize a função de cálculo de consenso para suportar N > 2.
    *   No `analysis-pipeline.ts`: Crie o array `PERSONAS` e o loop `Promise.all` demonstrado acima.

3.  **Crie os Prompts (O Diferencial):**
    *   Este é o segredo do sucesso. Não use o mesmo prompt 3 vezes. Force as personas a pensarem diferente através do System Prompt.
    *   *Dica:* Peça para a Persona "Agressiva" listar explicitamente "Doenças que matam em 24h" no topo do raciocínio. Peça para a Persona "Conservadora" focar em "Epidemiologia comum para a idade".

4.  **Frontend:**
    *   O componente `ConsensusBadge.tsx` e `ModelComparison.tsx` (agora `PersonaComparison`) precisará iterar sobre as chaves dinâmicas do mapa de consenso para exibir: "Internista: Apendicite (90%)", "Acadêmico: Adenite Mesentérica (60%)".

---

**Nota Final:** Esta arquitetura "Trinity" usando Gemini 3 Pro será **superior** à arquitetura Gemini+GPT atual, pois elimina a latência de rede entre nuvens diferentes (Azure vs Google) e permite um controle muito mais fino sobre o viés do raciocínio clínico através das personas.
