/**
 * Multi-Persona Aggregator - 1/r Weighted Consensus
 *
 * Updated for Vertice-ai-health "Trinity" Architecture.
 * Supports N arbitrary sources (personas) instead of fixed 2-model logic.
 */

import type {
  ConsensusDiagnosis,
  ConsensusLevel,
  ConsensusMetrics,
  PersonaDiagnosisDetail
} from './types/consensus.types';

import type { DifferentialDiagnosis } from './types'; // Assuming base types exist

/**
 * Input format for diagnosis from a single source (Persona).
 */
export interface ModelDiagnosisInput {
  sourceId: string; // e.g., 'conservative', 'aggressive'
  name: string;
  rank: number; // 1-5
  confidence: number; // 0-100
  icd10?: string;
  supportingEvidence: string[];
  contradictingEvidence?: string[];
  suggestedTests?: string[];
  reasoning?: string;
}

/**
 * Internal structure for aggregation.
 */
interface DiagnosisScore {
  name: string;
  displayName: string;
  icd10: string | undefined;
  score: number;
  sources: Map<string, PersonaDiagnosisDetail>;
  supportingEvidence: Set<string>;
  contradictingEvidence: Set<string>;
  suggestedTests: Set<string>;
}

const CONFIDENCE_MULTIPLIERS: Record<ConsensusLevel, number> = {
  strong: 1.15,   // Higher boost for trinity consensus
  moderate: 1.05,
  weak: 0.95,
  single: 0.8,
  divergent: 0.7,
};

const MAX_CONFIDENCE = 99;

/**
 * Normalize diagnosis name.
 */
export function normalizeDiagnosisName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/^síndrome de\s+/i, '')
    .replace(/^doença de\s+/i, '')
    .replace(/^transtorno de\s+/i, '')
    .replace(/diabetes mellitus tipo 2/i, 'diabetes tipo 2')
    .replace(/dm2/i, 'diabetes tipo 2')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculate 1/r score.
 */
export function calculateScore(rank: number): number {
  if (rank <= 0 || rank > 10) return 0;
  return 1 / rank;
}

/**
 * Determine consensus level for N sources.
 */
export function determineConsensusLevel(
  sources: Map<string, PersonaDiagnosisDetail>,
  totalSourcesConfigured: number = 3
): ConsensusLevel {
  const sourceCount = sources.size;

  if (sourceCount <= 1) return 'single';

  const ranks = Array.from(sources.values()).map(s => s.rank);
  const maxDiff = Math.max(...ranks) - Math.min(...ranks);

  // Logic for 3 Personas
  if (totalSourcesConfigured >= 3) {
    if (sourceCount === totalSourcesConfigured && maxDiff === 0) return 'strong'; // Unanimous same rank
    if (sourceCount === totalSourcesConfigured && maxDiff <= 1) return 'strong'; // Unanimous close rank
    if (sourceCount >= 2 && maxDiff <= 1) return 'moderate'; // Majority or partial strong
    if (maxDiff > 2) return 'divergent';
    return 'weak';
  }

  // Fallback for 2 sources
  if (maxDiff === 0) return 'strong';
  if (maxDiff <= 1) return 'moderate';
  return 'divergent';
}

/**
 * Calibrate confidence based on consensus level.
 */
export function calibrateConfidence(
  avgConfidence: number,
  consensusLevel: ConsensusLevel
): number {
  const multiplier = CONFIDENCE_MULTIPLIERS[consensusLevel];
  const calibrated = Math.round(avgConfidence * multiplier);
  return Math.min(MAX_CONFIDENCE, Math.max(0, calibrated));
}

/**
 * Aggregate diagnoses from multiple personas.
 */
export function aggregateDiagnoses(
  inputs: ModelDiagnosisInput[]
): { diagnoses: ConsensusDiagnosis[]; metrics: ConsensusMetrics } {
  const startTime = Date.now();
  const scoreMap = new Map<string, DiagnosisScore>();
  const modelsUsed = new Set<string>();

  // Aggregation Loop
  for (const input of inputs) {
    modelsUsed.add(input.sourceId);
    const key = normalizeDiagnosisName(input.name);
    const score = calculateScore(input.rank);

    const existing = scoreMap.get(key) || {
      name: key,
      displayName: input.name,
      icd10: input.icd10,
      score: 0,
      sources: new Map(),
      supportingEvidence: new Set(),
      contradictingEvidence: new Set(),
      suggestedTests: new Set(),
    };

    existing.score += score;
    existing.sources.set(input.sourceId, {
      rank: input.rank,
      confidence: input.confidence,
      reasoning: input.reasoning
    });
    
    // Merge arrays into sets
    input.supportingEvidence.forEach(e => existing.supportingEvidence.add(e));
    if (input.contradictingEvidence) input.contradictingEvidence.forEach(e => existing.contradictingEvidence.add(e));
    if (input.suggestedTests) input.suggestedTests.forEach(e => existing.suggestedTests.add(e));

    scoreMap.set(key, existing);
  }

  // Sort and Select Top
  const sorted = Array.from(scoreMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 5); // Keep top 5

  // Build Output
  let strongCount = 0;
  let moderateCount = 0;
  let divergentCount = 0;

  const diagnoses: ConsensusDiagnosis[] = sorted.map(data => {
    const consensusLevel = determineConsensusLevel(data.sources, 3); // Assuming 3 personas

    if (consensusLevel === 'strong') strongCount++;
    if (consensusLevel === 'moderate') moderateCount++;
    if (consensusLevel === 'divergent') divergentCount++;

    // Avg Confidence
    const totalConf = Array.from(data.sources.values()).reduce((sum, s) => sum + s.confidence, 0);
    const avgConf = totalConf / (data.sources.size || 1);
    const confidence = calibrateConfidence(avgConf, consensusLevel);

    // Map source details to object
    const sourceDetails: Record<string, PersonaDiagnosisDetail> = {};
    data.sources.forEach((val, key) => {
      sourceDetails[key] = val;
    });

    return {
      name: data.displayName,
      icd10: data.icd10,
      confidence,
      supportingEvidence: Array.from(data.supportingEvidence),
      contradictingEvidence: Array.from(data.contradictingEvidence),
      suggestedTests: Array.from(data.suggestedTests),
      aggregateScore: data.score,
      consensusLevel,
      sourceDetails
    };
  });

  const metrics: ConsensusMetrics = {
    modelsUsed: Array.from(modelsUsed),
    strongConsensusRate: diagnoses.length > 0 ? Math.round((strongCount / diagnoses.length) * 100) : 0,
    moderateConsensusCount: moderateCount,
    divergentCount,
    totalProcessingTimeMs: Date.now() - startTime,
  };

  return { diagnoses, metrics };
}
