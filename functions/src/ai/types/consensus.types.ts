/**
 * Type definitions for multi-model/multi-persona consensus.
 * Updated for Vertice-ai-health (Trinity Architecture).
 */

export type ConsensusLevel =
  | 'strong'   // Unanimous or near-unanimous agreement
  | 'moderate' // Majority consensus
  | 'weak'     // Split decision
  | 'single'   // Only one source suggested
  | 'divergent'; // Significant disagreement

export interface ConsensusMetrics {
  modelsUsed: string[]; // List of personas/models used IDs
  strongConsensusRate: number;
  moderateConsensusCount: number;
  divergentCount: number;
  divergentDiagnoses?: string[];
  totalProcessingTimeMs: number;
  modelTimings?: Record<string, number>;
}

export interface PersonaDiagnosisDetail {
  rank: number;
  confidence: number;
  reasoning?: string;
}

export interface ConsensusDiagnosis {
  name: string;
  icd10?: string;
  confidence: number;
  supportingEvidence: string[];
  contradictingEvidence: string[];
  suggestedTests: string[];
  
  // Consensus specific
  aggregateScore: number;
  consensusLevel: ConsensusLevel;
  
  // Dynamic details per persona/source
  sourceDetails: Record<string, PersonaDiagnosisDetail>;
}
