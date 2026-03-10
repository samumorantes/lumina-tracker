"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useHabitStore } from '@/store/useHabitStore';
import { calculateStreaks, calculateMonthlyGlobalProgress } from '@/lib/habit-stats';
import { getHabitCoachChatResponse, UserContextData, ChatMessage } from '@/lib/ai-coach';
import { getDictionary } from '@/lib/i18n';
import { ArrowLeft, Loader2, Bot, Send, User } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function CoachPage() {
    const { habits, language, userName } = useHabitStore();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const dict = getDictionary(language).coach;

    useEffect(() => setIsMounted(true), []);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const currentMonthStr = format(new Date(), 'yyyy-MM');
    const globalMonthlyProgress = useMemo(() => calculateMonthlyGlobalProgress(habits, currentMonthStr), [habits, currentMonthStr]);

    const mappedHabits = useMemo(() => {
        return habits.map(habit => {
            const { currentStreak, bestStreak } = calculateStreaks(habit.completedDates);
            return { ...habit, currentStreak, bestStreak };
        });
    }, [habits]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputText.trim() || isLoading) return;

        const userMsg: ChatMessage = { role: 'user', content: inputText.trim() };
        const newChatHistory = [...messages, userMsg];

        setMessages(newChatHistory);
        setInputText("");
        setIsLoading(true);

        const context: UserContextData = {
            userId: "lumina-user-1",
            userName: userName,
            globalMonthlyProgress,
            habitsData: mappedHabits.map(h => ({
                habitName: h.name,
                currentStreak: h.currentStreak,
                bestStreak: h.bestStreak,
                completedDates: h.completedDates,
                frequency: h.frequency
            }))
        };

        const languageInstruction = language === 'fr'
            ? "\n\nCRITICAL: You MUST answer in FRENCH. This is mandatory for the user interface."
            : "\n\nCRITICAL: You MUST answer in SPANISH. This is mandatory for the user interface.";

        const response = await getHabitCoachChatResponse(context, newChatHistory, languageInstruction);

        if (response) {
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } else {
            setMessages(prev => [...prev, { role: 'assistant', content: "Hubo un error de conexión, intenta de nuevo." }]);
        }

        setIsLoading(false);
    };

    if (!isMounted) return null;

    return (
        <div className="min-h-screen flex flex-col p-4 md:p-8 font-sans text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-[#0B0F19] transition-colors duration-500 ease-out pb-24 md:pb-8">

            {/* 🌟 HEADER NAVEGABLE */}
            <header className="mb-6 pt-2 flex items-center justify-between z-10 sticky top-0 bg-slate-50/80 dark:bg-[#0B0F19]/80 backdrop-blur-xl pb-4 border-b border-transparent">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-3 bg-white/40 dark:bg-white/5 rounded-full hover:scale-110 active:scale-95 transition-all duration-300 ease-out shadow-sm backdrop-blur-md border border-transparent dark:border-white/10">
                        <ArrowLeft size={20} className="text-slate-700 dark:text-slate-300" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg flex items-center justify-center border-2 border-white/50 dark:border-white/10 animate-in spin-in-12 duration-1000">
                            <Bot size={20} className="text-white drop-shadow-md" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white transition-colors duration-500">
                                Lumina Coach
                            </h1>
                            <p className="text-xs text-emerald-500 font-bold tracking-wider uppercase animate-pulse">Online</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* ========================================== */}
            {/* 💬 ÁREA DE CHAT (MENSAJES)                   */}
            {/* ========================================== */}
            <div className="flex-1 w-full max-w-3xl mx-auto overflow-y-auto custom-scrollbar px-2 md:px-6 space-y-6 pt-4 mb-20 scroll-smooth">

                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-70 animate-in fade-in zoom-in duration-700">
                        <Bot size={64} className="text-slate-300 dark:text-slate-600 mb-4" />
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">{dict.readyTitle}</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm">{dict.readyDesc}</p>
                    </div>
                )}

                {messages.map((msg, index) => {
                    const isUser = msg.role === 'user';
                    return (
                        <div key={index} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                            <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

                                {/* Avatar */}
                                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 shadow-sm ${isUser
                                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
                                        : 'bg-indigo-500 text-white'
                                    }`}>
                                    {isUser ? <User size={16} /> : <Bot size={16} />}
                                </div>

                                {/* Burbuja de Mensaje */}
                                <div className={`p-4 rounded-2xl md:rounded-[1.5rem] shadow-[0_4px_15px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] ${isUser
                                        ? 'bg-slate-900 dark:bg-slate-800 text-white rounded-tr-sm border border-transparent dark:border-white/5'
                                        : 'bg-white/80 dark:bg-[#151B2B] text-slate-800 dark:text-slate-200 rounded-tl-sm border border-slate-100 dark:border-white/5 backdrop-blur-md'
                                    }`}>
                                    {isUser ? (
                                        <p className="text-[15px] leading-relaxed font-medium">{msg.content}</p>
                                    ) : (
                                        <div className="prose prose-sm md:prose-base prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:mt-4 prose-headings:mb-2 prose-a:text-indigo-500">
                                            <ReactMarkdown
                                                components={{
                                                    p: ({ node, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                                                    strong: ({ node, ...props }) => <strong className="font-extrabold text-indigo-600 dark:text-indigo-400" {...props} />,
                                                    ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                                                    ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {isLoading && (
                    <div className="flex w-full justify-start animate-in fade-in duration-300">
                        <div className="flex gap-3">
                            <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center mt-1 shadow-sm animate-pulse">
                                <Bot size={16} />
                            </div>
                            <div className="p-4 rounded-[1.5rem] bg-white/80 dark:bg-[#151B2B] rounded-tl-sm border border-slate-100 dark:border-white/5 backdrop-blur-md flex gap-1.5 items-center">
                                <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* ========================================== */}
            {/* ⌨️ INPUT STICKY INFERIOR                   */}
            {/* ========================================== */}
            <div className="fixed bottom-16 md:bottom-6 left-0 right-0 w-full px-4 md:px-0 pointer-events-none z-40">
                <div className="max-w-3xl mx-auto md:ml-24 pointer-events-auto transition-all duration-300">
                    <form
                        onSubmit={handleSendMessage}
                        className="relative flex items-center w-full p-2 bg-white/70 dark:bg-[#151B2B]/80 backdrop-blur-2xl rounded-full border border-slate-200/50 dark:border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)]"
                    >
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={language === 'fr' ? "Demandez au coach..." : "Pregúntale al coach..."}
                            disabled={isLoading}
                            className="flex-1 bg-transparent px-4 py-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none w-full disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={!inputText.trim() || isLoading}
                            className="shrink-0 w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white flex items-center justify-center transition-all duration-300 active:scale-95 shadow-md ml-2"
                        >
                            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="-ml-0.5 mt-0.5" />}
                        </button>
                    </form>
                </div>
            </div>

        </div>
    );
}
