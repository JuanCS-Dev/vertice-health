import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { RefreshCcw, Download, Printer, CheckCircle, Activity, ShieldCheck, Microscope, GraduationCap, FileText, UserCheck } from 'lucide-react';
import { PatientInstructionsView } from './humanitarian/pictograms/PatientInstructionsView';

interface AnalysisViewProps {
  report: string;
  onReset: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ report, onReset }) => {
  const [activeView, setActiveView] = useState<'clinical' | 'patient'>('clinical');

  return (
    <div className="animate-slide-up space-y-8 pb-16">
      
      {/* Result Hero Header */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-white/20 py-8 px-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-900 transition-all duration-500">
        {/* Dynamic Background based on View */}
        <div className={`absolute inset-0 bg-gradient-to-r transition-opacity duration-500 ${activeView === 'clinical' ? 'from-emerald-900 via-slate-900 to-cyan-950' : 'from-amber-900 via-slate-900 to-orange-950'} opacity-100`}></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
        
        <div className="relative z-10 text-white flex-1">
            <div className="inline-flex items-center gap-3 mb-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold tracking-wide uppercase shadow-sm">
                  {activeView === 'clinical' ? <CheckCircle size={14} /> : <UserCheck size={14} />} 
                  {activeView === 'clinical' ? 'Consensus Reached' : 'Patient Mode'}
                </div>
                {/* Tiny Trinity Indicators */}
                {activeView === 'clinical' && (
                  <div className="flex -space-x-1.5 opacity-80 animate-fade-in">
                     <div className="w-5 h-5 rounded-full bg-blue-500/80 flex items-center justify-center border border-slate-900" title="Conservative"><ShieldCheck size={10} /></div>
                     <div className="w-5 h-5 rounded-full bg-rose-500/80 flex items-center justify-center border border-slate-900" title="Aggressive"><Microscope size={10} /></div>
                     <div className="w-5 h-5 rounded-full bg-amber-500/80 flex items-center justify-center border border-slate-900" title="Academic"><GraduationCap size={10} /></div>
                  </div>
                )}
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight drop-shadow-sm">
              {activeView === 'clinical' ? 'Clinical Report' : 'Patient Instructions'}
            </h2>
            <p className="text-white/70 text-sm mt-1">
              {activeView === 'clinical' 
                ? 'Synthesized analysis via Gemini 3 Pro • Trinity Protocol v2.0'
                : 'Simplified visual prescriptions for low-literacy understanding.'}
            </p>
        </div>

        {/* View Toggle Switch */}
        <div className="relative z-10 bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/20 flex gap-1">
            <button 
              onClick={() => setActiveView('clinical')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'clinical' ? 'bg-white text-slate-900 shadow-md' : 'text-white hover:bg-white/10'}`}
            >
              <FileText size={16} /> Clinical
            </button>
            <button 
              onClick={() => setActiveView('patient')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'patient' ? 'bg-amber-500 text-white shadow-md' : 'text-white hover:bg-white/10'}`}
            >
              <UserCheck size={16} /> Patient
            </button>
        </div>
      </div>

      {/* Main Report Card */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/60 relative min-h-[500px]">
        
        {/* Actions Bar (Reset) */}
        <div className="absolute top-6 right-6 z-20 print:hidden">
            <button 
                onClick={onReset} 
                className="flex items-center gap-2 text-slate-500 hover:text-brand-700 bg-slate-100 hover:bg-brand-50 px-4 py-2 rounded-xl transition-all font-semibold text-sm border border-slate-200 hover:border-brand-200 shadow-sm"
            >
                <RefreshCcw size={16} /> New Case
            </button>
        </div>

        <div className="p-8 md:p-14 lg:px-20">
          {activeView === 'clinical' ? (
            <div className="markdown-body animate-fade-in">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {report}
              </ReactMarkdown>
            </div>
          ) : (
            <PatientInstructionsView diagnosisContext={report} />
          )}
        </div>

        {/* Footer Disclaimer */}
        <div className="bg-slate-50 p-8 border-t border-slate-200 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
            <div className="relative z-10 max-w-3xl mx-auto">
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    <strong className="text-slate-700 block mb-2 uppercase tracking-wide">Legal Disclaimer & Safety</strong>
                    This report is generated by Artificial Intelligence as a decision support tool.
                    It may contain inaccuracies. The final clinical judgment remains the exclusive responsibility of the qualified healthcare professional.
                    In medical emergencies, follow local life support protocols immediately.
                </p>
                <div className="mt-4 flex justify-center items-center gap-2 text-slate-400 text-[10px] font-mono uppercase tracking-widest opacity-70">
                    <Activity size={12} /> Vertice AI Health • Decision Support System
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
