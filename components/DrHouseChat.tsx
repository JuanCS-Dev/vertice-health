/**
 * Module: DrHouseChat
 * ===================
 * 
 * Advanced diagnostic chat interface using the "Dr. House" persona.
 * Refined UI with polished sidebar, glassmorphism, and smooth transitions.
 * 
 * Refactored for < 400 lines compliance.
 */

import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { Send, Bot, RefreshCw, AlertTriangle, BrainCircuit, Sparkles, Activity, Plus, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Chat, GenerateContentResponse } from '@google/genai';

import { createDrHouseChat } from '../services/geminiService';
import { ChatMessage, ChatSession } from '../types';
import { ChatSidebar } from './DrHouse/ChatSidebar';
import { ChatMessageItem } from './DrHouse/ChatMessageItem';

export const DrHouseChat: React.FC = memo(() => {
  // --- State ---
  const [input, setInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // --- Refs ---
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialMount = useRef(true);

  // --- Persistence & Initialization ---
  useEffect(() => {
    if (initialMount.current) {
      const shouldOpen = window.innerWidth >= 768;
      setShowHistory(shouldOpen);
      const savedSessions = localStorage.getItem('vertice_house_sessions');
      if (savedSessions) {
        try {
          const parsed = JSON.parse(savedSessions);
          setSessions(parsed);
          if (parsed.length > 0) setCurrentSessionId(parsed[0].id);
          else createNewSession();
        } catch (e) { createNewSession(); }
      } else { createNewSession(); }
      initialMount.current = false;
    }
  }, []);

  useEffect(() => {
    if (!initialMount.current && sessions.length > 0) {
      localStorage.setItem('vertice_house_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // --- Logic ---
  const getCurrentMessages = (): ChatMessage[] => {
    const session = sessions.find(s => s.id === currentSessionId);
    return session ? session.messages : [];
  };

  const updateCurrentSession = useCallback((newMessages: ChatMessage[]) => {
    setSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        const lastMsg = newMessages[newMessages.length - 1];
        const previewText = lastMsg && lastMsg.text 
            ? (lastMsg.text.substring(0, 40) + (lastMsg.text.length > 40 ? '...' : '')) 
            : session.preview;
        let newTitle = session.title;
        if (session.title === 'New Diagnostic Case' && newMessages.length > 1) {
            const firstUserMsg = newMessages.find(m => m.role === 'user');
            if (firstUserMsg) {
                newTitle = `Case: ${firstUserMsg.text.substring(0, 25)}${firstUserMsg.text.length > 25 ? '...' : ''}`;
            }
        }
        return { ...session, messages: newMessages, lastMessageAt: Date.now(), preview: previewText, title: newTitle };
      }
      return session;
    }).sort((a, b) => b.lastMessageAt - a.lastMessageAt));
  }, [currentSessionId]);

  const createNewSession = () => {
    try { chatRef.current = createDrHouseChat(); } catch (e) {}
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: 'New Diagnostic Case',
      createdAt: Date.now(),
      lastMessageAt: Date.now(),
      preview: 'Waiting for patient data...',
      messages: [{ 
        role: 'model', 
        text: "I am the Advanced Diagnostic Unit. I trust data, not stories. Give me the symptoms, labs, and vitals immediately.",
        timestamp: Date.now()
      }]
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    if (window.innerWidth < 768) setShowHistory(false);
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    localStorage.setItem('vertice_house_sessions', JSON.stringify(newSessions)); 
    if (currentSessionId === id) {
      if (newSessions.length > 0) setCurrentSessionId(newSessions[0].id);
      else createNewSession();
    }
  };

  const switchSession = (id: string) => {
    if (id === currentSessionId) return;
    setCurrentSessionId(id);
    try { chatRef.current = createDrHouseChat(); } catch(e) {}
    if (window.innerWidth < 768) setShowHistory(false);
  };

  // --- Chat Interaction ---
  useEffect(() => {
    if (!chatRef.current) { try { chatRef.current = createDrHouseChat(); } catch (e) {} }
    scrollToBottom();
  }, [currentSessionId]); 

  useEffect(() => { scrollToBottom(); }, [sessions]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const handleSend = async (): Promise<void> => {
    if (!input.trim() || !currentSessionId) return;
    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setInput('');
    setIsTyping(true);
    const currentMsgs = getCurrentMessages();
    const updatedMsgsWithUser = [...currentMsgs, userMsg];
    updateCurrentSession(updatedMsgsWithUser);

    try {
      const placeholderMsg: ChatMessage = { role: 'model', text: '', timestamp: Date.now() };
      updateCurrentSession([...updatedMsgsWithUser, placeholderMsg]);
      if (!chatRef.current) chatRef.current = createDrHouseChat();
      const stream = await chatRef.current.sendMessageStream({ message: userMsg.text });
      
      let fullText = '';
      for await (const chunk of stream) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          fullText += c.text;
          setSessions(prev => prev.map(s => {
            if (s.id === currentSessionId) {
               const msgs = [...s.messages];
               msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], text: fullText };
               return { ...s, messages: msgs, preview: fullText.substring(0, 50) + '...' };
            }
            return s;
          }));
        }
      }
    } catch (error) {
      const errorMsg: ChatMessage = { 
        role: 'model', 
        text: `[SYSTEM ERROR]: Connection disrupted. Retrying satellite link... Failed.`,
        timestamp: Date.now()
      };
      setSessions(prev => prev.map(s => {
         if (s.id === currentSessionId) return { ...s, messages: [...s.messages, errorMsg] };
         return s;
      }));
    } finally { setIsTyping(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const activeMessages = getCurrentMessages();

  return (
    <div className="animate-fade-in flex h-[calc(100vh-140px)] md:h-[calc(100vh-160px)] pb-4 gap-4 relative">
      {showHistory && <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-20 md:hidden animate-fade-in" onClick={() => setShowHistory(false)}></div>}

      <ChatSidebar
         showHistory={showHistory} setShowHistory={setShowHistory} sessions={sessions}
         currentSessionId={currentSessionId} searchTerm={searchTerm} setSearchTerm={setSearchTerm}
         onSwitchSession={switchSession} onDeleteSession={deleteSession} onCreateNewSession={createNewSession}
      />

      <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-xl rounded-3xl border border-white/50 shadow-glass overflow-hidden relative transition-all duration-300">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-200/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-200/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>

        <div className="bg-white/70 backdrop-blur-xl p-4 md:px-6 md:py-4 border-b border-white/60 flex justify-between items-center relative z-10 shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
             <button onClick={() => setShowHistory(!showHistory)} className={`p-2 rounded-xl border transition-all duration-300 ${showHistory ? 'bg-brand-50 text-brand-600 border-brand-200 shadow-inner' : 'bg-white text-slate-500 border-slate-200 hover:border-brand-300 hover:text-brand-600 shadow-sm'}`}>
                {showHistory ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
             </button>
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 tracking-tight">
                Dr. House Mode
                <span className="hidden md:flex items-center gap-1.5 text-[10px] font-bold tracking-wider font-mono bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">
                  <Sparkles size={8} className="fill-indigo-500" /> GEMINI 3 PRO
                </span>
              </h2>
              <p className="text-slate-500 text-xs font-medium mt-0.5 flex items-center gap-1.5 truncate max-w-[180px] md:max-w-md">
                 <Activity size={10} className="text-emerald-500" />
                 {sessions.find(s => s.id === currentSessionId)?.title || "Ready to Analyze"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={createNewSession} className="md:hidden p-2.5 bg-brand-50 text-brand-600 rounded-xl border border-brand-100"><Plus size={18} /></button>
            <button onClick={createNewSession} className="hidden md:flex group items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-brand-700 hover:bg-brand-50/80 transition-all border border-slate-200 hover:border-brand-200 bg-white/50">
                <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" /> NEW CASE
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar scroll-smooth relative">
          {activeMessages.length === 0 && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 pointer-events-none animate-fade-in">
                <div className="bg-white/50 p-6 rounded-full border border-white/60 mb-6 shadow-sm">
                    <BrainCircuit size={48} className="text-slate-400" strokeWidth={1.5} />
                </div>
                <p className="font-medium text-sm">Initialize Diagnostic Protocol...</p>
             </div>
          )}
          {activeMessages.map((msg, idx) => <ChatMessageItem key={`${currentSessionId}-${idx}`} msg={msg} />)}
          {isTyping && (
             <div className="flex gap-4 max-w-4xl mx-auto animate-fade-in">
               <div className="w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 text-white flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/20"><Bot size={18} /></div>
               <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-3xl rounded-tl-sm px-6 py-5 flex items-center gap-1.5 shadow-sm">
                 <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce"></span>
                 <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce delay-75"></span>
                 <span className="w-1.5 h-1.5 bg-brand-600 rounded-full animate-bounce delay-150"></span>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        <div className="p-4 md:p-6 bg-white/80 backdrop-blur-xl border-t border-white/60 relative z-20">
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute inset-0 bg-white rounded-2xl border border-brand-100 shadow-sm transition-shadow group-focus-within:shadow-md group-focus-within:border-brand-300"></div>
            <div className="relative flex items-end gap-2 p-2">
              <textarea
                value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Describe patient symptoms, upload lab values, or paste vitals..."
                className="w-full bg-transparent p-3 min-h-[56px] max-h-[160px] outline-none text-slate-700 placeholder-slate-400 text-sm resize-none custom-scrollbar font-medium leading-relaxed"
                rows={1}
              />
              <button onClick={handleSend} disabled={!input.trim() || isTyping} className={`mb-1 mr-1 p-3 rounded-xl transition-all duration-300 flex items-center justify-center ${!input.trim() || isTyping ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-tr from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-lg shadow-brand-500/30 hover:scale-105 active:scale-95'}`}>
                <Send size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
          <div className="text-center mt-3 flex justify-center opacity-80 hover:opacity-100 transition-opacity">
             <p className="text-[10px] font-semibold text-slate-400 flex items-center gap-1.5 bg-slate-100/50 px-3 py-1 rounded-full border border-slate-200/50">
               <AlertTriangle size={10} className="text-amber-500" /> AI Clinical Support • Verify all outputs.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
});
