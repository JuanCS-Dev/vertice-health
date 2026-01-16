export interface DifferentialDiagnosis {
  name: string;
  icd10?: string;
  confidence: number;
  supportingEvidence: string[];
  contradictingEvidence: string[];
  suggestedTests: string[];
  consensusLevel?: 'strong' | 'moderate' | 'weak' | 'single' | 'divergent';
  sourceDetails?: Record<string, { rank: number; confidence: number }>;
  reasoning?: string;
}

export interface ConsensusMetrics {
  modelsUsed: string[];
  strongConsensusRate: number;
  moderateConsensusCount: number;
  divergentCount: number;
  totalProcessingTimeMs: number;
}

export interface LabAnalysisResult {
  differentialDiagnosis: DifferentialDiagnosis[];
  consensusMetrics?: ConsensusMetrics;
}
