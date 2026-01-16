import React, { memo } from 'react';
import { History, X, Search, MessageSquare, Plus } from 'lucide-react';
import { SidebarItem } from './SidebarItem';
import { ChatSession } from '../../types';

interface ChatSidebarProps {
    showHistory: boolean;
    setShowHistory: (show: boolean) => void;
    sessions: ChatSession[];
    currentSessionId: string | null;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    onSwitchSession: (id: string) => void;
    onDeleteSession: (e: React.MouseEvent, id: string) => void;
    onCreateNewSession: () => void;
}

export const ChatSidebar = memo(({
    showHistory,
    setShowHistory,
    sessions,
    currentSessionId,
    searchTerm,
    setSearchTerm,
    onSwitchSession,
    onDeleteSession,
    onCreateNewSession
}: ChatSidebarProps) => {

    const filteredSessions = sessions.filter(s => 
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.preview.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div 
            className={`
              absolute md:relative z-30 h-full shrink-0 transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)
              bg-white/80 backdrop-blur-xl border-white/60 rounded-3xl shadow-2xl md:shadow-glass overflow-hidden flex flex-col
              ${showHistory 
                ? 'w-[300px] lg:w-[320px] translate-x-0 opacity-100 border' 
                : 'w-0 -translate-x-10 opacity-0 border-none pointer-events-none p-0'}
            `}
        >
            {/* Fixed Width Container to prevent text reflow during transition */}
            <div className="w-[300px] lg:w-[320px] h-full flex flex-col">
                
                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white/50">
                    <div className="flex items-center gap-2.5 text-slate-700">
                        <div className="p-1.5 bg-brand-100 rounded-lg text-brand-600">
                            <History size={16} strokeWidth={2.5} />
                        </div>
                        <span className="font-bold text-sm tracking-tight">Case Archives</span>
                    </div>
                    <button onClick={() => setShowHistory(false)} className="md:hidden text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="px-4 py-3 bg-white/30">
                    <div className="relative group">
                        <Search size={14} className="absolute left-3 top-3 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search diagnostics..." 
                            className="w-full pl-9 pr-3 py-2.5 text-xs font-medium rounded-xl bg-white/60 border border-slate-200 focus:bg-white focus:border-brand-300 focus:ring-2 focus:ring-brand-100 outline-none transition-all placeholder:text-slate-400 text-slate-700" 
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-grow overflow-y-auto custom-scrollbar p-3 space-y-1">
                    {filteredSessions.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3 opacity-60">
                            <MessageSquare size={32} strokeWidth={1.5} />
                            <p className="text-xs font-medium">No archived cases found.</p>
                        </div>
                    )}
                    {filteredSessions.map((session) => (
                        <SidebarItem 
                            key={session.id}
                            session={session}
                            isActive={currentSessionId === session.id}
                            onClick={() => onSwitchSession(session.id)}
                            onDelete={(e) => onDeleteSession(e, session.id)}
                        />
                    ))}
                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-slate-100 bg-white/60 backdrop-blur-md">
                    <button 
                        onClick={onCreateNewSession}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] border border-brand-500"
                    >
                        <Plus size={16} strokeWidth={3} /> START NEW DIAGNOSIS
                    </button>
                </div>
            </div>
        </div>
    );
});
