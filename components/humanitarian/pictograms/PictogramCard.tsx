import React from 'react';
import { Sun, Moon, Coffee, GlassWater, Pill, Apple, AlertCircle, Clock } from 'lucide-react';

/**
 * Pictogram Engine 2026
 * Dynamically composes SVG scenes based on structured JSON instructions from Gemini 3.
 */

export interface PictogramStep {
  id: number;
  timeOfDay: 'morning' | 'noon' | 'evening' | 'night' | 'any';
  action: 'take-pill' | 'drink-water' | 'eat' | 'rest' | 'alert';
  quantity?: number;
  icon?: string; // fallback icon name
  instruction: string; // "Tome 2 comprimidos"
  color?: string;
}

const TimeIcon = ({ time }: { time: string }) => {
  switch (time) {
    case 'morning': return <Sun size={40} className="text-amber-500 animate-pulse-slow" />;
    case 'noon': return <Sun size={40} className="text-orange-500" fill="currentColor" />;
    case 'evening': return <div className="relative"><Sun size={30} className="text-orange-400 absolute -bottom-2 -left-2" /><Moon size={30} className="text-indigo-400 absolute -top-2 -right-2" /></div>;
    case 'night': return <Moon size={40} className="text-indigo-600 animate-pulse-slow" fill="currentColor" />;
    default: return <Clock size={40} className="text-slate-400" />;
  }
};

const ActionScene = ({ action, quantity = 1 }: { action: string, quantity?: number }) => {
  // Dynamic composition logic
  return (
    <div className="flex items-center gap-2 relative h-16 w-24 justify-center">
      {action === 'take-pill' && (
        <div className="flex gap-1">
          {Array.from({ length: Math.min(quantity, 4) }).map((_, i) => (
            <div key={i} className="relative">
               <Pill size={32} className="text-emerald-600 drop-shadow-md transform -rotate-45" fill="white" />
               <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                 {i+1}
               </span>
            </div>
          ))}
        </div>
      )}
      
      {action === 'drink-water' && (
        <div className="relative">
           <GlassWater size={40} className="text-blue-500" />
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-blue-200/50 rounded-full animate-bounce"></div>
           </div>
        </div>
      )}

      {action === 'eat' && <Apple size={40} className="text-red-500" fill="currentColor" />}
      
      {action === 'alert' && <AlertCircle size={40} className="text-red-600 animate-pulse" />}
    </div>
  );
};

export const PictogramCard: React.FC<{ step: PictogramStep }> = ({ step }) => {
  return (
    <div className="flex items-center justify-between bg-white border-2 border-slate-100 rounded-3xl p-4 shadow-sm hover:shadow-md hover:border-brand-200 transition-all">
      
      {/* 1. Context (Time) */}
      <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
        <TimeIcon time={step.timeOfDay} />
      </div>

      {/* 2. Visual Instruction (The Core) */}
      <div className="flex-1 flex flex-col items-center px-4">
         <ActionScene action={step.action} quantity={step.quantity} />
      </div>

      {/* 3. Text Fallback (Simple) */}
      <div className="text-right max-w-[120px]">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{step.timeOfDay}</p>
        <p className="text-sm font-extrabold text-slate-800 leading-tight">{step.instruction}</p>
      </div>
    </div>
  );
};
