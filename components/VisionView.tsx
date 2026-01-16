/**
 * Module: VisionView
 * ==================
 * 
 * Static presentation component displaying the project's manifesto, mission, and impact.
 * Features a high-quality, readable layout with glassmorphism cards.
 */

import React, { memo } from 'react';
import { Heart, Globe, Target, ShieldCheck, BookOpen, Users, AlertOctagon, Lightbulb, Zap, Quote } from 'lucide-react';

/**
 * VisionView Component.
 * 
 * Renders the "Vision of the Project" static page.
 */
export const VisionView: React.FC = memo(() => {
  return (
    <div className="animate-fade-in space-y-12 pb-16">
      
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 text-center py-20 px-6 md:px-12 bg-slate-900">
        {/* Solid background base prevents washed out colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-brand-900 to-teal-950 opacity-100"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500 rounded-full blur-[150px] opacity-20 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-semibold tracking-wide uppercase text-brand-300 mb-2 shadow-sm">
            <Globe size={16} /> Project Vision
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight drop-shadow-sm">
            "World-Class Medicine for <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-100">Those Who Need It Most</span>"
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 font-light leading-relaxed max-w-3xl mx-auto">
            In a world where 5 billion people lack access to essential care, technology is not a luxury — it is a moral responsibility.
          </p>
        </div>
      </div>

      {/* The Problem Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-8 md:p-10 rounded-3xl border-l-8 border-l-red-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-red-100 rounded-xl text-red-600">
              <AlertOctagon size={32} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">The Problem We Solve</h2>
          </div>
          <p className="text-lg text-slate-600 mb-6 leading-relaxed">
            Medical Vulnerability is not just the absence of hospitals. It is the daily reality for billions:
          </p>
          <ul className="space-y-4">
            {[
              "The farmer with persistent fever waiting 3 months for a specialist.",
              "The pregnant woman with eclampsia in a rural clinic 200km from an obstetrician.",
              "The child with severe anemia whose parents are unaware of the urgency.",
              "The community health worker serving 500 families without clinical support.",
              "The newly graduated doctor making high-complexity decisions alone."
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-slate-700">
                <div className="mt-1.5 min-w-[6px] h-[6px] rounded-full bg-red-500"></div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 p-4 bg-red-50 rounded-xl border border-red-100 text-red-800 text-sm font-semibold">
            🚨 60% of preventable deaths occur due to late or incorrect diagnoses. The knowledge exists, but it doesn't reach where it's needed.
          </div>
        </div>

        <div className="space-y-8">
           {/* Mission Card */}
           <div className="glass-panel p-8 md:p-10 rounded-3xl border-l-8 border-l-brand-500 h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-brand-100 rounded-xl text-brand-600">
                <Target size={32} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Our Mission</h2>
            </div>
            <ul className="space-y-5">
              {[
                { title: "DEMOCRATIZE", desc: "Bring tertiary-level clinical reasoning to remote areas.", icon: Users },
                { title: "SAVE", desc: "Identify emergencies in 30 seconds, before it's too late.", icon: Heart },
                { title: "EMPOWER", desc: "Transform generalists into AI-assisted specialists.", icon: Zap },
                { title: "RESPECT", desc: "Adapt to local reality (resources, culture, epidemiology).", icon: Globe },
                { title: "EDUCATE", desc: "Empower patients and families for self-care.", icon: BookOpen },
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-brand-600 border border-brand-100">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-bold tracking-wide text-sm">{item.title}</strong>
                    <span className="text-slate-600 text-sm md:text-base">{item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Why It Works (Grid) */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-center text-slate-800 flex items-center justify-center gap-3">
          <Lightbulb className="text-amber-500 fill-amber-500" /> Why It Works?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Minimal Data", desc: "CBC + structured anamnesis outperform 95% of human diagnoses.", color: "bg-blue-50 border-blue-200 text-blue-700" },
            { title: "Prioritizes Treatable", desc: "Focuses on diagnoses resolvable with available local resources.", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
            { title: "Local Context", desc: "Considers neglected diseases and unique regional epidemiological profiles.", color: "bg-amber-50 border-amber-200 text-amber-700" },
            { title: "Trains While Serving", desc: "Explains clinical reasoning, serving as continuing education for the professional.", color: "bg-purple-50 border-purple-200 text-purple-700" },
            { title: "Absolute Safety", desc: "Urgency triage (Red Flags) executed in 100% of analyses.", color: "bg-rose-50 border-rose-200 text-rose-700" },
            { title: "Humanitarian", desc: "Designed specifically to reduce systemic health inequalities.", color: "bg-slate-50 border-slate-200 text-slate-700" },
          ].map((card, idx) => (
            <div key={idx} className={`p-6 rounded-2xl border ${card.color} transition-transform hover:-translate-y-1`}>
              <h3 className="font-bold text-lg mb-2">{card.title}</h3>
              <p className="text-sm opacity-90 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Impact & Promise Section */}
      <div className="glass-panel p-8 md:p-12 rounded-3xl border border-brand-200 bg-gradient-to-b from-white to-brand-50/30">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-slate-800">Our Promise</h2>
            <p className="text-lg text-slate-600">
              This is not just software. It is a movement for justice. For every diagnosis generated, we guarantee:
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              {["Harvard-level PRECISION", "Immediate ACTION", "Human DIGNITY"].map((tag, i) => (
                <span key={i} className="px-5 py-2 rounded-full bg-slate-900 text-white font-bold text-sm shadow-lg shadow-slate-500/20">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-200 w-full max-w-lg mx-auto"></div>

          <div className="relative">
            <Quote size={48} className="absolute -top-6 -left-4 text-brand-200 fill-brand-100 opacity-50" />
            <blockquote className="text-xl md:text-2xl font-serif text-slate-700 italic leading-relaxed px-8">
              "One day, we will look back and say: 'Remember when people died simply for being in the wrong place?' And our children won't understand. Because excellent medicine will have become a universal right."
            </blockquote>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="text-center pt-8 opacity-60">
        <div className="flex items-center justify-center gap-2 text-brand-800 font-bold tracking-tight mb-2">
          <ShieldCheck size={20} /> VERTICE AI HEALTH
        </div>
        <p className="text-sm text-slate-500">Democratizing Excellent Diagnostics</p>
      </div>

    </div>
  );
});