/**
 * Clinical Reasoning Pipeline - Trinity Architecture
 * ================================================
 *
 * Implements the multi-persona diagnostic process using a single model (Gemini 3 Pro)
 * but viewing the problem through 3 distinct lenses (Conservative, Aggressive, Academic).
 */

import { logger } from 'firebase-functions';
import { getVertexAIClient } from '../utils/config.js'; // Adjust path if needed
import {
  ExtractedBiomarker,
  TriageResult,
  ClinicalCorrelation,
  PatientContext,
  ClinicalSpecialty,
  ConsensusDiagnosis,
  ConsensusMetrics,
  DifferentialDiagnosis
} from './types.js'; // Adjust path

import { formatMarkersForPrompt, formatPatientContext } from './analysis-utils.js';
import { DIAGNOSTIC_PERSONAS } from './diagnostic-personas.js';
import { aggregateDiagnoses, ModelDiagnosisInput } from './multi-llm-aggregator.js';

// Configuration
const GEMINI_MODEL = 'gemini-1.5-pro-002'; // Target Model for Trinity

/**
 * Run Layer 3: Multimodal Fusion with Trinity Consensus.
 */
export async function runFusionLayer(
  client: Awaited<ReturnType<typeof getVertexAIClient>>,
  markers: ExtractedBiomarker[],
  patientContext: PatientContext,
  triageResult: TriageResult,
  correlations: ClinicalCorrelation[],
  specialtyAnalysis: unknown
): Promise<{
  differentialDiagnosis: ConsensusDiagnosis[];
  consensusMetrics?: ConsensusMetrics;
}> {
  
  // Base Data for Prompt
  const patientSummary = formatPatientContext(patientContext);
  const labData = formatMarkersForPrompt(markers);
  const triageSummary = `Urgência: ${triageResult.urgency}. Red Flags: ${triageResult.redFlags.map(r => r.description).join(', ') || 'None'}`;
  
  const BASE_USER_PROMPT = `DADOS DO PACIENTE:
${patientSummary}

EXAMES LABORATORIAIS:
${labData}

TRIAGEM:
${triageSummary}

CORRELAÇÕES IDENTIFICADAS:
${correlations.map(c => c.pattern).join('\n') || 'Nenhuma'}

TAREFA:
Com base APENAS nos dados acima e na sua PERSONALIDADE definida, gere um diagnóstico diferencial com 5 hipóteses.

FORMATO JSON OBRIGATÓRIO:
{
  "differentialDiagnosis": [
    {
      "name": "Nome Diagnóstico",
      "icd10": "Cod",
      "confidence": 0-100,
      "reasoning": "Sua justificativa baseada na sua persona",
      "supportingEvidence": ["evidencia 1"],
      "suggestedTests": ["exame 1"]
    }
  ]
}`;

  const startTime = Date.now();

  // Execute Parallel Calls for all Personas
  const personaPromises = DIAGNOSTIC_PERSONAS.map(async (persona) => {
    try {
      const response = await client.models.generateContent({
        model: GEMINI_MODEL,
        config: {
          systemInstruction: persona.systemPrompt,
          temperature: persona.temperature, // Persona-specific temp
        },
        contents: [{ role: 'user', parts: [{ text: BASE_USER_PROMPT }] }],
      });

      const text = response.text || '';
      const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(jsonStr);

      // Normalize to ModelDiagnosisInput
      return (parsed.differentialDiagnosis || []).map((d: { name: string; confidence: number; icd10?: string; supportingEvidence?: string[]; contradictingEvidence?: string[]; suggestedTests?: string[]; reasoning: string }, idx: number) => ({
        sourceId: persona.id,
        name: d.name,
        rank: idx + 1,
        confidence: d.confidence,
        icd10: d.icd10,
        supportingEvidence: d.supportingEvidence || [],
        contradictingEvidence: d.contradictingEvidence || [],
        suggestedTests: d.suggestedTests || [],
        reasoning: d.reasoning
      })) as ModelDiagnosisInput[];

    } catch (error) {
      logger.error(`[FusionLayer] Persona ${persona.id} failed:`, error);
      return [];
    }
  });

  const results = await Promise.all(personaPromises);
  const allInputs = results.flat();

  // Aggregate Results
  const { diagnoses, metrics } = aggregateDiagnoses(allInputs);

  return {
    differentialDiagnosis: diagnoses,
    consensusMetrics: {
      ...metrics,
      totalProcessingTimeMs: Date.now() - startTime
    }
  };
}
