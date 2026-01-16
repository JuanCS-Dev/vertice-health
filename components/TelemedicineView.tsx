import React, { useState } from 'react';
import { Video, Calendar, MapPin, User, CheckCircle2, Mic, Settings, Stethoscope, SignalHigh, FileText, Copy, ExternalLink, MessageSquare } from 'lucide-react';
import { generateReferralSummary } from '../services/geminiService';

export const TelemedicineView: React.FC = () => {
  const [generatingFor, setGeneratingFor] = useState<number | null>(null);
  const [referralNote, setReferralNote] = useState<string | null>(null);

  // Mock data for demonstration
  const upcomingAppointments = [
    {
      id: 1,
      patient: "Amara Diallo",
      age: "8yo",
      location: "Rural Unit 4 (Sub-Saharan)",
      condition: "Severe Malaria - Complicated",
      specialist: "Infectious Disease",
      docName: "Dr. Sarah Chen",
      time: "10:00 AM",
      status: "Starting Now",
      urgency: "high"
    },
    {
      id: 2,
      patient: "Mateo Silva",
      age: "45yo",
      location: "Mobile Clinic B (Amazon)",
      condition: "Dermatological Lesion - Leishmaniasis?",
      specialist: "Dermatology",
      docName: "Dr. James Wilson",
      time: "11:30 AM",
      status: "Confirmed",
      urgency: "medium"
    },
    {
      id: 3,
      patient: "Priya Patel",
      age: "28yo",
      location: "Refugee Camp Alpha",
      condition: "Postnatal Complications",
      specialist: "OBGYN",
      docName: "Dr. Elena Rodriguez",
      time: "02:00 PM",
      status: "Confirmed",
      urgency: "high"
    }
  ];

  const handleGenerateReferral = async (id: number) => {
    setGeneratingFor(id);
    const apt = upcomingAppointments.find(a => a.id === id);
    if (!apt) return;

    try {
      const summary = await generateReferralSummary(
        `Patient: ${apt.patient}, ${apt.age}. Condition: ${apt.condition}. Location: ${apt.location}.`,
        apt.specialist
      );
      setReferralNote(summary);
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingFor(null);
    }
  };

  const copyToClipboard = () => {
    if (referralNote) {
      navigator.clipboard.writeText(referralNote);
      alert("Referral note copied to clipboard!");
    }
  };

  const openGoogleMeet = () => {
    window.open('https://meet.google.com/new', '_blank');
  };

  return (
    <div className="animate-fade-in space-y-10 pb-12">
      
      {/* Hero Section - Liquid Glass Style */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 py-10 px-8 md:px-10 bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 opacity-100"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute right-0 top-0 w-[300px] h-[300px] bg-indigo-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wide uppercase text-indigo-300 mb-3 shadow-sm">
              <SignalHigh size={12} /> Sat-Link Active
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">Telemedicine Hub</h1>
            <p className="text-indigo-200 mt-2 max-w-lg">Connecting remote clinics to global specialists via Google Meet.</p>
          </div>
          <div className="flex gap-3">
            <button 
                onClick={openGoogleMeet}
                className="flex items-center gap-2 bg-indigo-500 text-white px-6 py-3 rounded-xl hover:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/30 font-bold"
            >
              <Video size={18} /> New Google Meet
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Schedule (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="glass-panel p-8 rounded-3xl shadow-xl">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-brand-100 rounded-xl text-brand-600">
                  <Calendar size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Today's Consultations</h3>
              </div>
              <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg border border-slate-200">UTC +00:00</span>
            </div>

            <div className="space-y-4">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="group bg-white/60 backdrop-blur-md border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-300 relative overflow-hidden">
                  
                  {/* Urgency Strip */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${apt.urgency === 'high' ? 'bg-red-500' : 'bg-amber-400'}`}></div>

                  <div className="flex flex-col md:flex-row justify-between gap-6 md:items-center relative z-10">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">{apt.time}</span>
                        {apt.status === "Starting Now" && (
                          <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                            <Video size={10} /> LIVE
                          </span>
                        )}
                      </div>
                      <h4 className="text-xl font-bold text-slate-800 mb-1">{apt.patient} <span className="text-base font-medium text-slate-400">({apt.age})</span></h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500 mb-3">
                        <span className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-400" /> {apt.location}</span>
                        <span className="flex items-center gap-1.5 text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md"><Stethoscope size={14} /> {apt.docName}</span>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                         <button 
                            onClick={() => handleGenerateReferral(apt.id)}
                            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 px-3 py-2 rounded-lg transition-colors"
                         >
                            {generatingFor === apt.id ? <span className="animate-spin">⏳</span> : <FileText size={14} />}
                            {generatingFor === apt.id ? 'Drafting...' : 'Draft Referral'}
                         </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {apt.status === "Starting Now" ? (
                        <button 
                            onClick={openGoogleMeet}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/30 transition-all font-bold animate-pulse-slow w-full md:w-auto justify-center"
                        >
                          <Video size={18} /> Join Meet
                        </button>
                      ) : (
                        <button className="text-slate-500 hover:text-indigo-600 font-semibold px-4 py-2 rounded-xl border border-transparent hover:bg-indigo-50 transition-colors">
                          Reschedule
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Actions & Notes (1/3) */}
        <div className="space-y-6">
          
          {/* Smart Referral Card (Shows when generated) */}
          <div className={`glass-panel p-6 rounded-3xl shadow-xl transition-all duration-500 ${referralNote ? 'opacity-100 translate-y-0' : 'opacity-50 grayscale'}`}>
             <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
               <MessageSquare size={20} className="text-indigo-500" /> Referral Note
             </h3>
             {referralNote ? (
                 <div className="bg-white/50 p-4 rounded-xl border border-indigo-100 mb-4">
                     <p className="text-xs text-slate-600 whitespace-pre-wrap font-mono leading-relaxed">{referralNote}</p>
                 </div>
             ) : (
                 <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-4 text-center text-slate-400 text-sm italic">
                    Select a patient to generate a smart referral summary using Gemini.
                 </div>
             )}
             
             <div className="flex gap-2">
                 <button 
                    disabled={!referralNote}
                    onClick={copyToClipboard}
                    className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold py-2.5 rounded-xl border border-slate-200 transition-colors disabled:opacity-50"
                 >
                    <Copy size={16} /> Copy
                 </button>
                 <button 
                    disabled={!referralNote}
                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(referralNote || '')}`, '_blank')}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl shadow-md disabled:opacity-50 transition-colors"
                 >
                    <ExternalLink size={16} /> WhatsApp
                 </button>
             </div>
          </div>

          {/* System Status */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-2xl relative overflow-hidden border border-slate-800">
            <div className="absolute top-0 right-0 p-32 bg-indigo-500 rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
            <h3 className="text-lg font-bold mb-5 flex items-center gap-2 relative z-10">
              <Settings size={20} className="text-indigo-400" /> System Status
            </h3>
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between text-sm bg-white/5 p-2 rounded-lg border border-white/10">
                <span className="flex items-center gap-2 opacity-90"><Video size={16} /> Meet API</span>
                <span className="text-emerald-400 flex items-center gap-1 font-semibold"><CheckCircle2 size={14} /> READY</span>
              </div>
              <div className="flex items-center justify-between text-sm bg-white/5 p-2 rounded-lg border border-white/10">
                <span className="flex items-center gap-2 opacity-90"><SignalHigh size={16} /> Bandwidth</span>
                <span className="text-amber-400 text-xs font-bold px-2 py-0.5 bg-amber-400/10 rounded">OPTIMIZED</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                Google Stack Integration Active
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};