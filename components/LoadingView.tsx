import React, { useEffect, useState } from 'react';
import { BrainCircuit, ShieldCheck, Microscope, GraduationCap, Sparkles, CheckCircle2 } from 'lucide-react';

export const LoadingView: React.FC = () => {
  const [stage, setStage] = useState(0);

  // Simulation of the Trinity phases
  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 1500), // Activate Personas
      setTimeout(() => setStage(2), 3500), // Personas Analyzing
      setTimeout(() => setStage(3), 5500), // Consensus Fusion
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-8 text-center animate-fade-in relative overflow-hidden rounded-3xl">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-white/0 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-200/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>

      {/* TRINITY VISUALIZER */}
      <div className="relative w-80 h-80 flex items-center justify-center mb-12">
        
        {/* Orbiting Rings */}
        <div className="absolute inset-0 border border-brand-100 rounded-full animate-[spin_10s_linear_infinite]"></div>
        <div className="absolute inset-8 border border-dashed border-brand-200 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>

        {/* CENTER: Consensus Engine */}
        <div className={`
          relative z-20 bg-white p-6 rounded-full shadow-2xl border border-white/60 transition-all duration-1000
          ${stage >= 3 ? 'shadow-brand-500/50 scale-110 ring-4 ring-brand-100' : 'shadow-slate-200'}
        `}>
          <BrainCircuit 
            size={64} 
            className={`transition-colors duration-500 ${stage >= 3 ? 'text-brand-600' : 'text-slate-400'}`} 
            strokeWidth={1.5} 
          />
          {stage >= 3 && (
            <div className="absolute -top-2 -right-2 bg-brand-500 p-2 rounded-full animate-bounce">
              <Sparkles size={16} className="text-white fill-white" />
            </div>
          )}
        </div>

        {/* PERSONA A: Conservative (Top Left) */}
        <div className={`
          absolute top-0 left-10 p-4 rounded-2xl backdrop-blur-md border transition-all duration-700
          ${stage >= 1 ? 'opacity-100 translate-y-0 bg-white/80 border-blue-200 shadow-lg shadow-blue-500/20' : 'opacity-0 translate-y-8 border-transparent'}
        `}>
          <ShieldCheck size={28} className="text-blue-600" />
        </div>

        {/* PERSONA B: Aggressive (Top Right) */}
        <div className={`
          absolute top-0 right-10 p-4 rounded-2xl backdrop-blur-md border transition-all duration-700 delay-150
          ${stage >= 1 ? 'opacity-100 translate-y-0 bg-white/80 border-rose-200 shadow-lg shadow-rose-500/20' : 'opacity-0 translate-y-8 border-transparent'}
        `}>
          <Microscope size={28} className="text-rose-600" />
        </div>

        {/* PERSONA C: Academic (Bottom) */}
        <div className={`
          absolute bottom-4 p-4 rounded-2xl backdrop-blur-md border transition-all duration-700 delay-300
          ${stage >= 1 ? 'opacity-100 -translate-y-0 bg-white/80 border-amber-200 shadow-lg shadow-amber-500/20' : 'opacity-0 translate-y-8 border-transparent'}
        `}>
          <GraduationCap size={28} className="text-amber-600" />
        </div>
        
        {/* Connecting Beams (SVG Overlay) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 320 320">
          {stage >= 2 && (
            <>
              {/* Beam A */}
              <line x1="100" y1="60" x2="160" y2="160" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse opacity-40" />
              {/* Beam B */}
              <line x1="220" y1="60" x2="160" y2="160" stroke="#e11d48" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse opacity-40" />
              {/* Beam C */}
              <line x1="160" y1="260" x2="160" y2="160" stroke="#d97706" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse opacity-40" />
            </>
          )}
        </svg>

      </div>
      
      {/* Dynamic Status Text */}
      <div className="relative z-10 space-y-2 max-w-lg mx-auto h-24">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight transition-all duration-300">
          {stage === 0 && "Initializing Trinity Protocol..."}
          {stage === 1 && "Activating Diagnostic Personas..."}
          {stage === 2 && "Parallel Analysis in Progress..."}
          {stage === 3 && "Synthesizing Consensus..."}
        </h2>
        <p className="text-slate-500 text-lg">
          {stage === 0 && "Preparing secure environment for Gemini 3 Pro."}
          {stage === 1 && "Dr. House, Internal Med, and Research Unit coming online."}
          {stage === 2 && "Cross-referencing symptoms with global medical databases."}
          {stage === 3 && "Generating final unified clinical report."}
        </p>
      </div>

      {/* Checklist */}
      <div className="mt-8 flex gap-3 opacity-80">
         <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border transition-all duration-500 ${stage >= 1 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
            <CheckCircle2 size={14} /> Safety Check
         </div>
         <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border transition-all duration-500 delay-150 ${stage >= 2 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
            <CheckCircle2 size={14} /> Differential
         </div>
         <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border transition-all duration-500 delay-300 ${stage >= 2 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
            <CheckCircle2 size={14} /> Evidence Review
         </div>
      </div>
    </div>
  );
};