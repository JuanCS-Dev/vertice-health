/**
 * DiagnosisView Component - Trinity Edition
 * 
 * Displays differential diagnosis with persona-based consensus indicators.
 */

import React, { useState } from 'react';
import { Brain, ChevronDown, ChevronUp } from 'lucide-react';
import { ConsensusBadge, PersonaComparison } from './ConsensusBadge';

interface DiagnosisViewProps {
  result: {
    differentialDiagnosis: Record<string, unknown>[];
    consensusMetrics?: {
      modelsUsed: string[];
      strongConsensusRate: number;
    };
  };
}

export function DiagnosisView({ result }: DiagnosisViewProps) {
  const [expandedDx, setExpandedDx] = useState<number | null>(null);

  return (
    <div className="space-y-4 font-sans">
      {/* Consensus Banner */}
      {result.consensusMetrics && (
        <div className="p-4 rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Brain className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-bold text-indigo-900">Consenso Trinity (3 Personas)</p>
                <p className="text-xs text-indigo-500">
                  {result.consensusMetrics.modelsUsed.length} perspectivas analisadas simultaneamente
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-indigo-700">
                {result.consensusMetrics.strongConsensusRate}%
              </p>
              <p className="text-[10px] uppercase font-bold text-indigo-400">concordância forte</p>
            </div>
          </div>
        </div>
      )}

      {/* Diagnoses List */}
      {result.differentialDiagnosis.map((dx, idx) => (
        <div
          key={idx}
          className={`
            p-5 bg-white rounded-xl border transition-all duration-200
            ${dx.consensusLevel === 'divergent' ? 'border-red-200 bg-red-50/20' : 'border-gray-100 shadow-sm hover:shadow-md'}
          `}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="flex items-center justify-center w-7 h-7 bg-gray-50 rounded-full text-xs font-bold text-gray-500">
                  {idx + 1}
                </span>
                <h4 className="font-bold text-gray-800">{dx.name}</h4>
                {dx.consensusLevel && <ConsensusBadge level={dx.consensusLevel} size="sm" />}
              </div>
              {dx.icd10 && <p className="text-[10px] font-mono text-gray-400 ml-10">CID-10: {dx.icd10}</p>}
            </div>

            <div className="flex items-center gap-3">
              <div className={`px-2 py-1 rounded text-xs font-bold ${dx.confidence > 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                {dx.confidence}%
              </div>
              <button
                onClick={() => setExpandedDx(expandedDx === idx ? null : idx)}
                className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {expandedDx === idx ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
          </div>

          {/* Persona breakdown */}
          {dx.sourceDetails && (
            <div className="mt-4 ml-10">
              <PersonaComparison sourceDetails={dx.sourceDetails} />
            </div>
          )}

          {/* Evidence */}
          {dx.supportingEvidence.length > 0 && (
            <div className="mt-4 ml-10">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Evidências de Suporte</p>
              <ul className="space-y-1">
                {dx.supportingEvidence.map((ev: string, i: number) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    {ev}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Expansion Panel (Mocked for Trinity) */}
          {expandedDx === idx && (
            <div className="mt-4 ml-10 pt-4 border-t border-gray-50 animate-in fade-in slide-in-from-top-1">
               <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 leading-relaxed italic">
                    "{dx.reasoning || 'O raciocínio clínico detalhado das 3 personas está sendo processado para validação final.'}"
                  </p>
               </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
