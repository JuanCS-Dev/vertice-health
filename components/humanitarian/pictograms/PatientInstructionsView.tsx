import React, { useEffect, useState } from 'react';
import { PictogramCard, PictogramStep } from './PictogramCard';
import { generatePictogramInstructions } from '../../../services/geminiService'; // We will create this
import { Sparkles, Printer, Share2 } from 'lucide-react';

interface PatientInstructionsViewProps {
  diagnosisContext: string; // The full medical report or context
}

export const PatientInstructionsView: React.FC<PatientInstructionsViewProps> = ({ diagnosisContext }) => {
  const [steps, setSteps] = useState<PictogramStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstructions = async () => {
      try {
        setLoading(true);
        // Generates the JSON "recipe" for the visual engine
        const instructions = await generatePictogramInstructions(diagnosisContext);
        setSteps(instructions);
      } catch (e) {
        console.error("Failed to generate pictograms", e);
      } finally {
        setLoading(false);
      }
    };

    if (diagnosisContext) {
      fetchInstructions();
    }
  }, [diagnosisContext]);

  if (loading) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 animate-pulse">
        <Sparkles className="mx-auto text-brand-400 mb-2" size={24} />
        <p className="text-slate-400 font-medium">Designing visual instructions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center px-2">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="w-2 h-6 bg-brand-500 rounded-full"></span>
          Patient Care Plan
        </h3>
        <div className="flex gap-2">
           <button className="p-2 bg-slate-100 rounded-xl text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all" title="Print for Patient">
             <Printer size={18} />
           </button>
           <button className="p-2 bg-brand-100 rounded-xl text-brand-600 hover:bg-brand-200 transition-all" title="Share via WhatsApp">
             <Share2 size={18} />
           </button>
        </div>
      </div>

      <div className="grid gap-4">
        {steps.map((step, idx) => (
          <PictogramCard key={step.id || idx} step={step} />
        ))}
      </div>

      <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-center">
        <p className="text-xs text-amber-800 font-medium">
          ⚠️ Explain these cards clearly to the patient. Verify understanding.
        </p>
      </div>
    </div>
  );
};
