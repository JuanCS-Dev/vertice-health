/**
 * Module: InputForm
 * =================
 * 
 * Primary data collection form for the patient.
 * Handles file uploads, state management, and validation.
 * 
 * Visual Style: Vertice Standard (VisionView)
 */

import React, { ChangeEvent, useState } from 'react';
import { Upload, X, FileText, User, MapPin, Stethoscope, AlertTriangle, ArrowRight, Activity, Thermometer, FilePlus, Sparkles, ShieldCheck, Microscope, GraduationCap } from 'lucide-react';
import { Attachment, PatientData } from '../types';
import { VoxMedicus } from './humanitarian/VoxMedicus';

interface InputFormProps {
  onSubmit: (data: PatientData, attachments: Attachment[]) => void;
  isSubmitting: boolean;
}

/**
 * InputForm Component.
 * 
 * Renders the clinical input form including demographics, vitals, and attachments.
 * Updated with "Vertice Standard" UI.
 */
export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isSubmitting }) => {
  const [data, setData] = useState<PatientData>({
    age: '', sex: '', weight: '', height: '', location: '',
    symptoms: '', history: '', vitals: '', context: ''
  });
  const [files, setFiles] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleVoxData = (extracted: PatientData) => {
      // Merge extracted data with current state, prioritizing extracted if not empty
      setData(prev => ({
          ...prev,
          ...Object.fromEntries(Object.entries(extracted).filter(([_, v]) => v !== ""))
      }));
  };

  const handleChange = (field: keyof PatientData, value: string): void => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(e.target.files);
    }
  };

  const processFiles = async (fileList: FileList): Promise<void> => {
    const newFiles: Attachment[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const reader = new FileReader();
      
      await new Promise<void>((resolve) => {
        reader.onload = (event) => {
          if (event.target?.result && typeof event.target.result === 'string') {
            const base64String = event.target.result.split(',')[1];
            newFiles.push({
              name: file.name,
              mimeType: file.type,
              data: base64String
            });
          }
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number): void => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    onSubmit(data, files);
  };

  const prefillDemo = (): void => {
    setData({
      age: '45',
      sex: 'M',
      weight: '72',
      height: '175',
      location: 'Rural NE Brazil',
      symptoms: 'High fever (39°C) for 8 days, intense weakness, RUQ abdominal pain, diffuse myalgia, and occasional dry cough.',
      history: 'No known comorbidities. Subsistence farmer. Denies smoking.',
      vitals: 'BP 110/70 mmHg, HR 98 bpm, RR 20 rpm, SpO2 96% on room air.',
      context: 'Region with poor sanitation. High prevalence of arboviruses and parasitic infections. Local resource: Basic Health Unit without advanced lab.',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in pb-16">
      
      {/* Hero / Header Section - Matches VisionView */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 text-center md:text-left py-12 px-8 md:px-12 bg-slate-900">
        {/* Deep gradient with solid base to prevent washout */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-slate-900 to-teal-950 opacity-100"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-500 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-semibold tracking-wide uppercase text-brand-300 shadow-sm">
              <Sparkles size={14} /> New Clinical Analysis
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight drop-shadow-sm">
              Start <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-100">Diagnosis</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-xl font-light leading-relaxed">
              Input clinical data below. The system will synthesize symptoms, labs, and regional context.
            </p>
          </div>
          
          <div className="flex gap-3 relative">
             <VoxMedicus onDataExtracted={handleVoxData} />
             
             <button 
                type="button" 
                onClick={prefillDemo}
                className="hidden md:flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl transition-all hover:scale-105 text-white font-medium shadow-lg"
              >
                <FilePlus size={18} /> Load Demo Case
              </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Vitals & Demographics (4/12) */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Patient Card */}
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/40 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-brand-100 rounded-xl text-brand-600 shadow-sm">
                <User size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Demographics</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="col-span-1 space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Age</label>
                <input required type="number" placeholder="45" className="glass-input w-full p-3 rounded-xl outline-none font-medium text-slate-700 focus:ring-2 focus:ring-brand-200" 
                  value={data.age} onChange={e => handleChange('age', e.target.value)} />
              </div>
              <div className="col-span-1 space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Sex</label>
                <select required className="glass-input w-full p-3 rounded-xl outline-none font-medium text-slate-700 focus:ring-2 focus:ring-brand-200"
                  value={data.sex} onChange={e => handleChange('sex', e.target.value)}>
                    <option value="" disabled>Select</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="Other">Other</option>
                </select>
              </div>
              <div className="col-span-1 space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Weight (kg)</label>
                <input type="number" placeholder="70" className="glass-input w-full p-3 rounded-xl outline-none font-medium text-slate-700 focus:ring-2 focus:ring-brand-200"
                  value={data.weight} onChange={e => handleChange('weight', e.target.value)} />
              </div>
              <div className="col-span-1 space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Height (cm)</label>
                <input type="number" placeholder="175" className="glass-input w-full p-3 rounded-xl outline-none font-medium text-slate-700 focus:ring-2 focus:ring-brand-200"
                  value={data.height} onChange={e => handleChange('height', e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Location</label>
              <div className="relative group">
                <MapPin size={18} className="absolute top-3.5 left-3 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                <input required type="text" placeholder="City, Region" className="glass-input w-full pl-10 p-3 rounded-xl outline-none font-medium text-slate-700 focus:ring-2 focus:ring-brand-200"
                  value={data.location} onChange={e => handleChange('location', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Attachments Card */}
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/40 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-xl text-blue-600 shadow-sm">
                <FileText size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Labs & Attachments</h3>
            </div>
            
            <div 
              className={`
                border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 relative cursor-pointer group
                ${isDragging ? 'border-brand-500 bg-brand-50/50 scale-[1.02]' : 'border-slate-300 hover:border-brand-400 hover:bg-white/50'}
              `}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
              }}
            >
              <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,application/pdf" />
              <div className="bg-white p-4 rounded-full shadow-md inline-block mb-3 group-hover:scale-110 transition-transform">
                <Upload size={24} className="text-brand-600" />
              </div>
              <p className="text-sm font-bold text-slate-700">Click or drag files</p>
              <p className="text-xs text-slate-500 mt-1">Blood Labs, Images, PDF</p>
            </div>
            
            {files.length > 0 && (
              <ul className="mt-4 space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                {files.map((f, idx) => (
                  <li key={idx} className="flex items-center justify-between text-xs font-medium bg-white/60 border border-slate-200 px-3 py-3 rounded-xl shadow-sm animate-slide-up">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText size={14} className="text-brand-500 flex-shrink-0" />
                      <span className="truncate text-slate-700 max-w-[180px]">{f.name}</span>
                    </div>
                    <button type="button" onClick={() => removeFile(idx)} className="text-slate-400 hover:text-red-500 transition-colors bg-white hover:bg-red-50 p-1.5 rounded-lg shadow-sm">
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Clinical Data (8/12) */}
        <div className="xl:col-span-8 space-y-6">
          <div className="glass-panel p-8 md:p-10 rounded-3xl border border-white/40 shadow-xl h-full flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-rose-100 rounded-xl text-rose-600 shadow-sm">
                <Stethoscope size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Clinical Presentation</h3>
            </div>
            
            <div className="space-y-8 flex-grow">
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 pl-1">
                  Chief Complaint & HPI <span className="text-red-500">*</span>
                </label>
                <textarea required rows={5} className="glass-input w-full p-5 rounded-2xl outline-none transition-all text-slate-700 leading-relaxed resize-none focus:ring-2 focus:ring-brand-200 focus:bg-white/80"
                  placeholder="Describe onset, duration, characteristics, aggravating factors..."
                  value={data.symptoms} onChange={e => handleChange('symptoms', e.target.value)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 pl-1">
                    <Activity size={16} className="text-slate-400" /> Medical History
                  </label>
                  <textarea rows={4} className="glass-input w-full p-4 rounded-2xl outline-none text-slate-700 resize-none focus:ring-2 focus:ring-brand-200"
                    placeholder="Comorbidities, allergies, medications..."
                    value={data.history} onChange={e => handleChange('history', e.target.value)} />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 pl-1">
                    <Thermometer size={16} className="text-slate-400" /> Vitals & Physical Exam
                  </label>
                  <textarea rows={4} className="glass-input w-full p-4 rounded-2xl outline-none text-slate-700 resize-none focus:ring-2 focus:ring-brand-200"
                    placeholder="BP, HR, RR, Temp, SpO2 and physical findings..."
                    value={data.vitals} onChange={e => handleChange('vitals', e.target.value)} />
                </div>
              </div>

              <div className="bg-amber-50/60 p-6 rounded-2xl border border-amber-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400 rounded-full blur-[40px] opacity-10 pointer-events-none"></div>
                <label className="flex items-center gap-2 text-sm font-bold text-amber-800 mb-2 relative z-10">
                  <AlertTriangle size={16} /> Regional Context & Resources
                </label>
                <textarea rows={2} className="w-full bg-white/60 border border-amber-200/50 p-4 rounded-xl outline-none text-slate-700 focus:bg-white focus:ring-2 focus:ring-amber-200 transition-all resize-none relative z-10"
                  placeholder="Endemic diseases? Distance to hospital? Resource limitations?"
                  value={data.context} onChange={e => handleChange('context', e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-6 z-40 flex flex-col items-end gap-2">
        
        {/* Trinity Badge Hint */}
        <div className="mr-2 flex items-center gap-3 bg-slate-900/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-medium border border-white/10 shadow-lg animate-fade-in">
           <span className="text-slate-400">Powered by</span>
           <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center border-2 border-slate-900" title="Conservative Safety"><ShieldCheck size={12} /></div>
              <div className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center border-2 border-slate-900" title="Aggressive Investigation"><Microscope size={12} /></div>
              <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center border-2 border-slate-900" title="Academic Evidence"><GraduationCap size={12} /></div>
           </div>
           <span className="text-emerald-400 font-bold tracking-wide">TRINITY PROTOCOL</span>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-2 rounded-2xl shadow-glass border border-white/50">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`
              flex items-center gap-3 px-8 py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-300
              ${isSubmitting 
                ? 'bg-slate-400 cursor-not-allowed translate-y-0 shadow-none' 
                : 'bg-gradient-to-r from-brand-600 to-brand-800 hover:shadow-brand-500/30 hover:-translate-y-1 hover:brightness-110 active:scale-95'}
            `}
          >
            {isSubmitting ? (
              <>Processing Trinity...</>
            ) : (
              <>Initialize Diagnostic <ArrowRight size={20} strokeWidth={3} /></>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
