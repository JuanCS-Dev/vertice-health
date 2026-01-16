/**
 * ConsensusBadge Component - Trinity Edition
 *
 * Visual indicator showing the consensus level between 3 diagnostic personas.
 */

import {
  CheckCheck,
  Check,
  AlertTriangle,
  HelpCircle,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

// Simplified local types for the Trinity migration
export type ConsensusLevel = 'strong' | 'moderate' | 'weak' | 'single' | 'divergent';

interface ConsensusBadgeProps {
  level: ConsensusLevel;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

const ICONS: Record<string, LucideIcon> = {
  strong: CheckCheck,
  moderate: Check,
  weak: AlertTriangle,
  single: HelpCircle,
  divergent: XCircle,
};

const INDICATORS: Record<ConsensusLevel, { label: string; color: string; description: string }> = {
  strong: { label: 'Consenso Forte', color: 'emerald', description: 'Todas as personas concordam' },
  moderate: { label: 'Consenso Majoritário', color: 'blue', description: 'Maioria das personas concorda' },
  weak: { label: 'Consenso Fraco', color: 'amber', description: 'Baixa concordância entre personas' },
  single: { label: 'Persona Única', color: 'gray', description: 'Apenas uma persona identificou' },
  divergent: { label: 'Divergente', color: 'red', description: 'Conflito de diagnóstico entre as personas' },
};

const COLOR_CLASSES: Record<string, string> = {
  emerald: 'bg-[#D1FAE5] text-[#047857] border-[#A7F3D0]',
  blue: 'bg-[#DBEAFE] text-[#1D4ED8] border-[#BFDBFE]',
  amber: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
  red: 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]',
  gray: 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]',
};

const SIZE_CLASSES = {
  sm: { badge: 'px-2 py-0.5 text-xs gap-1', icon: 'w-3 h-3' },
  md: { badge: 'px-2.5 py-1 text-sm gap-1.5', icon: 'w-4 h-4' },
};

export function ConsensusBadge({ level, showLabel = true, size = 'sm' }: ConsensusBadgeProps) {
  const indicator = INDICATORS[level];
  const Icon = ICONS[level] || HelpCircle;
  const colorClass = COLOR_CLASSES[indicator.color];
  const sizeClass = SIZE_CLASSES[size];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${colorClass} ${sizeClass.badge}`}
      title={indicator.description}
    >
      <Icon className={sizeClass.icon} />
      {showLabel && <span>{indicator.label}</span>}
    </span>
  );
}

/**
 * PersonaComparison - Dynamic version for N personas.
 */
interface PersonaComparisonProps {
  sourceDetails?: Record<string, { rank: number; confidence: number }>;
}

export function PersonaComparison({ sourceDetails }: PersonaComparisonProps) {
  if (!sourceDetails) return null;

  const sources = Object.entries(sourceDetails);
  if (sources.length === 0) return null;

  const personaNames: Record<string, string> = {
    conservative: 'Dr. Conservative',
    aggressive: 'Dr. House',
    academic: 'Prof. Academic',
  };

  return (
    <div className="mt-2 pt-2 border-t border-gray-100">
      <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-wider">Análise por Persona</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {sources.map(([id, data]) => (
          <div key={id} className="flex items-center gap-1">
            <span className="text-gray-500">{personaNames[id] || id}:</span>
            <span className="font-semibold text-gray-700">#{data.rank}</span>
            <span className="text-gray-400">({data.confidence}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
