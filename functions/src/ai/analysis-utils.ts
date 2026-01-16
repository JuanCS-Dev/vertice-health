import { ExtractedBiomarker, PatientContext } from './types';

export function formatMarkersForPrompt(markers: ExtractedBiomarker[]): string {
  if (!markers || markers.length === 0) return 'Nenhum exame laboratorial disponível.';
  return markers.map(m => 
    `- ${m.name}: ${m.value} ${m.unit} (Ref: ${m.referenceRange || 'N/A'}) - Status: ${m.status}`
  ).join('\n');
}

export function formatPatientContext(ctx: PatientContext): string {
  return `
- Idade: ${ctx.age} anos
- Sexo: ${ctx.sex}
- Queixa: ${ctx.chiefComplaint}
- Histórico: ${ctx.relevantHistory?.join(', ') || 'Nenhum'}
`.trim();
}
