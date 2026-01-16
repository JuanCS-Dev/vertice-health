import React, { memo } from 'react';
import { Trash2, Clock } from 'lucide-react';
import { ChatSession } from '../../types';

interface SidebarItemProps {
    session: ChatSession;
    isActive: boolean;
    onClick: () => void;
    onDelete: (e: React.MouseEvent) => void;
}

/**
 * Sidebar Item Component
 * Renders a single session in the history list with polished hover/active states.
 */
export const SidebarItem = memo(({ 
    session, 
    isActive, 
    onClick, 
    onDelete 
}: SidebarItemProps) => {
    return (
        <div 
            onClick={onClick}
            className={`
                group relative p-3.5 mb-2 rounded-xl cursor-pointer transition-all duration-200 border w-full
                ${isActive 
                    ? 'bg-brand-50/80 border-brand-200 shadow-sm shadow-brand-100' 
                    : 'bg-white/40 border-transparent hover:bg-white/80 hover:border-slate-200 hover:shadow-sm'}
            `}
        >
            {/* Active Indicator Strip */}
            {isActive && (
                <div className="absolute left-0 top-3 bottom-3 w-1 bg-brand-500 rounded-r-full"></div>
            )}

            <div className="flex justify-between items-start mb-1.5 pl-2">
                <span className={`text-sm font-bold truncate pr-6 transition-colors ${isActive ? 'text-brand-900' : 'text-slate-700 group-hover:text-slate-900'}`}>
                    {session.title}
                </span>
                
                {/* Delete Button - Only visible on hover or if active (subtly) */}
                <button 
                    onClick={onDelete}
                    className={`
                        absolute right-2 top-2 p-1.5 rounded-lg transition-all duration-200 z-10
                        opacity-0 group-hover:opacity-100
                        text-slate-400 hover:text-red-600 hover:bg-red-50
                    `}
                    title="Archive Case"
                >
                    <Trash2 size={13} strokeWidth={2} />
                </button>
            </div>
            
            <p className={`text-xs truncate mb-2.5 pl-2 pr-2 font-medium transition-colors ${isActive ? 'text-brand-700/70' : 'text-slate-500 group-hover:text-slate-600'}`}>
                {session.preview || "No data yet..."}
            </p>
            
            <div className="flex items-center gap-1.5 pl-2 text-[10px] text-slate-400 font-mono tracking-tight opacity-80 group-hover:opacity-100 transition-opacity">
                <Clock size={10} />
                <span>{new Date(session.lastMessageAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                <span className="opacity-50">|</span>
                <span>{new Date(session.lastMessageAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
        </div>
    );
});
