/**
 * Module: Layout
 * ==============
 * 
 * Main layout component wrapping the application.
 * Handles navigation, mobile menu state, and global footer.
 */

import React, { ReactNode, useState, memo } from 'react';
import { Activity, Globe, Sparkles, Video, Stethoscope, History as HistoryIcon, BrainCircuit, Menu, X, Lightbulb } from 'lucide-react';
import { AppTab } from '../types';

interface LayoutProps {
  children: ReactNode;
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

interface NavItem {
    id: AppTab;
    label: string;
    icon: React.ElementType;
}

/**
 * Layout Component.
 * 
 * Provides the persistent navigation header and footer structure.
 * Implements a responsive glassmorphism design.
 * 
 * Args:
 *   children: The main content to render.
 *   activeTab: Currently selected application tab.
 *   onTabChange: Callback function when a tab is selected.
 */
export const Layout: React.FC<LayoutProps> = memo(({ children, activeTab, onTabChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const navItems: NavItem[] = [
    { id: AppTab.DIAGNOSTIC, label: 'Triage', icon: Stethoscope },
    { id: AppTab.DR_HOUSE, label: 'Dr. House', icon: BrainCircuit },
    { id: AppTab.TELEMEDICINE, label: 'Telemed', icon: Video },
    { id: AppTab.HISTORY, label: 'Records', icon: HistoryIcon },
    { id: AppTab.VISION, label: 'Vision', icon: Lightbulb },
  ];

  /**
   * Handles tab selection and closes mobile menu.
   */
  const handleTabChange = (id: AppTab): void => {
    onTabChange(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen text-slate-800 font-sans selection:bg-brand-100 selection:text-brand-800 flex flex-col relative overflow-x-hidden">
      {/* Glass Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/50 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* Logo Area */}
            <div 
                className="flex items-center gap-4 group cursor-pointer mr-6 z-50 relative select-none" 
                onClick={() => handleTabChange(AppTab.DIAGNOSTIC)}
                role="button"
                tabIndex={0}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-brand-400 blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-brand-500 to-brand-700 p-3 rounded-xl text-white shadow-lg group-hover:scale-105 transition-transform duration-300 ring-1 ring-brand-600/20">
                  <Activity size={26} strokeWidth={2.5} />
                </div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tighter leading-none font-sans">
                  VERTICE<span className="text-brand-600">AI</span>
                </h1>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mt-1">
                  Health OS
                </p>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <div className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 shadow-inner">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                const isHouse = item.id === AppTab.DR_HOUSE;
                const isVision = item.id === AppTab.VISION;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300
                      ${isActive 
                        ? 'bg-white text-brand-800 shadow-sm ring-1 ring-black/5 scale-[1.02]' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'}
                      ${isHouse && isActive ? '!text-indigo-700' : ''}
                      ${isVision && isActive ? '!text-amber-700' : ''}
                    `}
                  >
                    <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} className={
                        isActive 
                        ? (isHouse ? 'text-indigo-600' : isVision ? 'text-amber-600' : 'text-brand-600')
                        : 'opacity-70'
                    } />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Right Side Utils */}
            <div className="hidden lg:flex items-center gap-4 text-sm font-medium ml-auto">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 shadow-sm">
                <Globe size={14} className="text-emerald-500" /> 
                SAT-LINK
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1"></span>
              </div>
              <div className="h-6 w-px bg-slate-200"></div>
              <div className="flex items-center gap-2 text-brand-800">
                <Sparkles size={16} className="fill-brand-500 text-brand-500" /> 
                <span className="font-bold tracking-tight">Gemini 3 Pro</span>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors z-50 relative active:scale-95 border border-transparent hover:border-slate-200"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute top-20 left-0 w-full bg-white/95 backdrop-blur-3xl border-b border-slate-200 shadow-2xl p-4 md:hidden animate-slide-up origin-top z-40">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                const isHouse = item.id === AppTab.DR_HOUSE;
                const isVision = item.id === AppTab.VISION;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`
                      flex items-center gap-3 px-4 py-4 rounded-xl text-base font-bold transition-all active:scale-[0.98]
                      ${isActive 
                        ? 'bg-brand-50 text-brand-800 ring-1 ring-brand-100 shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-50'}
                      ${isHouse && isActive ? '!bg-indigo-50 !text-indigo-700 !ring-indigo-200' : ''}
                      ${isVision && isActive ? '!bg-amber-50 !text-amber-700 !ring-amber-200' : ''}
                    `}
                  >
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
                        <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isHouse ? 'text-indigo-500' : isVision ? 'text-amber-500' : isActive ? 'text-brand-600' : 'text-slate-500'} />
                    </div>
                    {item.label}
                  </button>
                );
              })}
              
              <div className="h-px bg-slate-200/60 my-2"></div>
              
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                 <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                    <Globe size={16} /> 
                    <span>Sat-Link Status</span>
                 </div>
                 <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full border border-emerald-200">ONLINE</span>
              </div>
              
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                 <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                    <Sparkles size={16} className="text-brand-500" /> 
                    <span>AI Model</span>
                 </div>
                 <span className="text-[10px] font-mono font-bold bg-brand-100 text-brand-700 px-2 py-1 rounded-full border border-brand-200">GEMINI 3 PRO</span>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 w-full z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="glass-panel mt-auto border-t border-white/60 bg-white/40">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 text-center md:text-left">
            <div className="flex flex-col gap-1">
              <p className="flex items-center justify-center md:justify-start gap-2 font-bold text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-500 shadow-glow"></span>
                Vertice AI Health &copy; 2026
              </p>
              <p className="text-xs text-slate-400 font-medium">Part of the Vertice AI Holdings Group</p>
            </div>
            <p className="opacity-80 text-xs md:text-sm font-medium text-slate-500">
              Designed for humanitarian aid settings.<br/>
              Data secured via HIPAA-compliant channels.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
});