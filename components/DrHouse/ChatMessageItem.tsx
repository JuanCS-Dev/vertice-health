import React, { memo } from 'react';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage } from '../../types';

interface ChatMessageItemProps {
    msg: ChatMessage;
}

/**
 * Chat Message Item
 */
export const ChatMessageItem = memo(({ msg }: ChatMessageItemProps) => {
  const isModel = msg.role === 'model';
  
  return (
    <div className={`flex gap-4 max-w-4xl mx-auto ${!isModel ? 'flex-row-reverse' : ''} animate-slide-up group`}>
      {/* Avatar */}
      <div className={`
        w-9 h-9 md:w-10 md:h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border transition-transform duration-300 group-hover:scale-105
        ${!isModel 
          ? 'bg-slate-100 text-slate-500 border-slate-200' 
          : 'bg-gradient-to-br from-brand-600 to-brand-700 text-white border-brand-500 shadow-brand-500/20'}
      `}>
        {!isModel ? <User size={18} /> : <Bot size={18} />}
      </div>

      {/* Message Bubble */}
      <div className={`
        relative px-5 py-4 md:px-6 md:py-5 shadow-sm text-sm leading-7 max-w-[85%] md:max-w-[75%]
        ${!isModel 
          ? 'bg-slate-800 text-white rounded-3xl rounded-tr-sm shadow-md' 
          : 'bg-white/90 backdrop-blur-md text-slate-700 border border-white/60 rounded-3xl rounded-tl-sm shadow-glass ring-1 ring-slate-900/5'}
      `}>
          {isModel ? (
            <div className="markdown-body !text-sm !bg-transparent !text-slate-700">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{msg.text}</p>
          )}
          
          <div className={`text-[10px] mt-2 opacity-40 font-mono flex items-center gap-1 ${!isModel ? 'justify-end text-slate-300' : 'text-slate-400'}`}>
             {msg.timestamp && new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
      </div>
    </div>
  );
});
