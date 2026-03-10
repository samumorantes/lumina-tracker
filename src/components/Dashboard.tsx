"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { BarChart, Bar, AreaChart, Area, XAxis, PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useHabitStore } from '@/store/useHabitStore';
import { calculateStreaks, calculateMonthlyGlobalProgress, calculateDailySuccessPercentage } from '@/lib/habit-stats';
import { getDictionary } from '@/lib/i18n';
import { format, subDays } from 'date-fns';
import { es, fr } from 'date-fns/locale';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

// Placeholder for COLORS, assuming it's an array of color strings
const COLORS = ['bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-green-500', 'bg-yellow-500'];

export default function Dashboard() {
    const { data: session, status } = useSession();
    const { habits, language, userName, setUserName, addHabit, toggleCompletion, deleteHabit, loadHabits } = useHabitStore();
    const [isMounted, setIsMounted] = useState(false);

    // UI Local State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newHabitName, setNewHabitName] = useState('');
    const [newHabitFreq, setNewHabitFreq] = useState<'daily' | 'specific_days'>('daily');
    const [newHabitColor, setNewHabitColor] = useState(COLORS[0]);

    useEffect(() => {
        setIsMounted(true);
        if (status === 'authenticated') {
            loadHabits();
        }
    }, [status, loadHabits]);
    const [nameInput, setNameInput] = useState('');
    const dict = getDictionary(language).dashboard;
    const localeObj = language === 'fr' ? fr : es;

    const weeklyData = useMemo(() => {
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const d = subDays(new Date(), i);
            const dateStr = format(d, 'yyyy-MM-dd');
            data.push({
                name: format(d, 'EEE', { locale: localeObj }),
                success: calculateDailySuccessPercentage(habits, dateStr)
            });
        }
        return data;
    }, [habits, localeObj]);

    const currentMonthStr = format(new Date(), 'yyyy-MM');
    const globalMonthlyProgress = useMemo(() => calculateMonthlyGlobalProgress(habits, currentMonthStr), [habits, currentMonthStr]);

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const mappedHabits = useMemo(() => {
        return habits.map(habit => {
            const { currentStreak, bestStreak } = calculateStreaks(habit.completedDates);
            const isCompletedToday = habit.completedDates.includes(todayStr);
            return { ...habit, currentStreak, bestStreak, isCompletedToday };
        });
    }, [habits, todayStr]);

    const handleToggle = (id: string, dateStr: string) => {
        const habit = mappedHabits.find(h => h.id === id);
        if (habit && !habit.completedDates.includes(dateStr)) {
            // Disparar confetti solo si se está marcando (no desmarcando)
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#8b5cf6', '#a78bfa', '#fcd34d']
            });
        }
        toggleCompletion(id, dateStr);
    };


    if (!isMounted) return null;

    if (status === 'loading') {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0F19]"><div className="w-8 h-8 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div></div>;
    }

    if (status === 'unauthenticated') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0F19] flex-col p-6 text-center">
                <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-4">Lumina V6</h1>
                <p className="text-slate-500 mb-8 max-w-sm">Inicia sesión para sincronizar tus hábitos con el servidor y conectarte con amigos reales.</p>
                <a href="/login" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95">Ir a Iniciar Sesión</a>
            </div>
        );
    }

    if (!userName) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-[#0B0F19] transition-colors duration-500">
                <div className="max-w-md w-full p-8 rounded-[2rem] bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.1)] text-center animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl flex items-center justify-center mb-6 border-4 border-white/50 dark:border-white/10">
                        <Sparkles size={36} className="text-white drop-shadow-md" />
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight mb-2 text-slate-800 dark:text-white">{dict.welcomeTitle}</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">{dict.welcomeDesc}</p>
                    <div className="flex flex-col gap-4">
                        <input
                            type="text"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            placeholder="e.g. Alex"
                            className="px-6 py-4 rounded-2xl bg-white dark:bg-[#080B13] border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-lg text-center"
                            autoFocus
                        />
                        <button
                            onClick={() => {
                                if (nameInput.trim()) {
                                    setUserName(nameInput.trim());
                                    confetti({ particleCount: 150, spread: 80, origin: { y: 0.8 } });
                                }
                            }}
                            className="px-6 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg shadow-[0_8px_20px_rgba(99,102,241,0.3)] transition-all ease-out active:scale-95"
                        >
                            {dict.welcomeBtn}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] p-6 md:p-12 font-sans text-slate-800 dark:text-slate-200">

            {/* 🌟 HEADER */}
            <header className="mb-10 pt-4 md:pt-0">
                <div>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3 transition-colors duration-500">
                        {dict.title}, {session?.user?.name || (session?.user as any)?.username || 'Viajero'}
                        <span className="text-4xl hover:animate-[spin_1s_ease-in-out]">👋</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium transition-colors duration-500 text-sm md:text-base">
                        {dict.subtitle}
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ========================================== */}
                {/* 🟡 COLUMNA PRINCIPAL: HÁBITOS (2/3)        */}
                {/* ========================================== */}
                <div className="lg:col-span-2 space-y-8">

                    {/* 📝 Lista de Hábitos */}
                    <div className="space-y-4">
                        {mappedHabits.length === 0 ? (
                            <div className="p-10 text-center text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-white/5 rounded-[2rem] border border-white/60 dark:border-white/10 backdrop-blur-xl">
                                {dict.noHabits}
                            </div>
                        ) : mappedHabits.map((habit) => (
                            <div
                                key={habit.id}
                                className="relative overflow-hidden p-5 rounded-[2rem] bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all duration-500 ease-out hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:bg-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
                            >

                                <div className="flex items-center gap-5">
                                    <button
                                        onClick={() => handleToggle(habit.id, todayStr)}
                                        className={`w-14 h-14 shrink-0 rounded-full ${habit.categoryColor} shadow-sm border-2 border-white dark:border-[#0B0F19]/50 flex items-center justify-center transition-all duration-300 active:scale-75 hover:scale-110 hover:shadow-lg cursor-pointer`}
                                        title={dict.completedTitle}
                                    >
                                        {habit.isCompletedToday ? (
                                            <span className="text-white text-2xl font-bold">✓</span>
                                        ) : (
                                            <span className="text-2xl drop-shadow-sm opacity-50 text-white">○</span>
                                        )}
                                    </button>
                                    <div className="flex flex-col">
                                        <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100 tracking-tight transition-colors duration-500">{habit.name}</h3>
                                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 transition-colors duration-500">
                                            🔥 <span className={habit.currentStreak >= 3 ? 'text-orange-500 dark:text-orange-400' : ''}>{habit.currentStreak} {dict.streakDays}</span>
                                            {habit.currentStreak >= 5 && <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 animate-pulse">{dict.streakBadge}</span>}
                                        </p>
                                    </div>
                                </div>

                                {/* Heatmap Mini - AHORA INTERACTIVO */}
                                <div className="flex items-center gap-2">
                                    {[4, 3, 2, 1, 0].map((daysAgo) => {
                                        const dateOfCell = format(subDays(new Date(), daysAgo), 'yyyy-MM-dd');
                                        const isDone = habit.completedDates.includes(dateOfCell);

                                        return (
                                            <button
                                                key={daysAgo}
                                                onClick={() => handleToggle(habit.id, dateOfCell)}
                                                title={format(subDays(new Date(), daysAgo), "dd MMM", { locale: localeObj })}
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ease-out active:scale-75 hover:scale-110 cursor-pointer ${isDone
                                                    ? habit.categoryColor + ' text-white shadow-sm scale-100 dark:shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                                                    : 'bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 text-slate-300 dark:text-slate-500 scale-95 hover:bg-white/80 dark:hover:bg-white/10'
                                                    } backdrop-blur-md`}
                                            >
                                                {isDone ? <span className="text-lg font-bold">✓</span> : ''}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 📈 Gráfico de Área */}
                    <div className="p-8 rounded-[2rem] bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-colors duration-500">
                        <h3 className="text-xl font-bold mb-6 text-slate-800 dark:text-slate-100">{dict.weeklyTrend}</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyData} barSize={30}>
                                    <defs>
                                        <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={1} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="name"
                                        stroke="transparent"
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={10}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                                        contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(11, 15, 25, 0.8)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
                                        itemStyle={{ color: '#a78bfa', fontWeight: 'bold' }}
                                        labelStyle={{ color: '#cbd5e1' }}
                                        formatter={(value: any) => [`${value}%`, dict.productivity]}
                                    />
                                    <Bar
                                        dataKey="success"
                                        fill="url(#colorSuccess)"
                                        radius={[8, 8, 8, 8]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* 🔽 VISTA CLÁSICA DESPLEGABLE (AreaChart) */}
                        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10">
                            <details className="group">
                                <summary className="cursor-pointer flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors">
                                    <span>{language === 'fr' ? 'Afficher la Tendance Classique (Ondes)' : 'Mostrar Tendencia Clásica (Olas)'}</span>
                                    <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </summary>
                                <div className="mt-6 h-48 w-full animate-in fade-in slide-in-from-top-4 duration-500 ease-out">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={weeklyData}>
                                            <defs>
                                                <linearGradient id="colorSuccessClassic" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Tooltip
                                                cursor={{ stroke: 'rgba(139, 92, 246, 0.2)', strokeWidth: 2, strokeDasharray: '4 4' }}
                                                contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(11, 15, 25, 0.8)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
                                                itemStyle={{ color: '#a78bfa', fontWeight: 'bold' }}
                                                labelStyle={{ color: '#cbd5e1' }}
                                                formatter={(value: any) => [`${value}%`, dict.productivity]}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="success"
                                                stroke="#8b5cf6"
                                                strokeWidth={5}
                                                fillOpacity={1}
                                                fill="url(#colorSuccessClassic)"
                                                activeDot={{ r: 8, strokeWidth: 0, fill: '#7c3aed', style: { filter: 'drop-shadow(0px 4px 6px rgba(139, 92, 246, 0.4))' } }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </details>
                        </div>
                    </div>

                </div>

                {/* ========================================== */}
                {/* 🔴 COLUMNA LATERAL (1/3)                   */}
                {/* ========================================== */}
                <div className="space-y-8">

                    {/* 🍩 Donut Chart */}
                    <div className="p-8 rounded-[2rem] bg-gradient-to-br from-white/60 to-white/20 dark:from-white/10 dark:to-transparent backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex flex-col items-center relative overflow-hidden transition-colors duration-500">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-200 dark:bg-violet-900/40 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

                        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4 w-full text-center relative z-10">{dict.globalSuccess}</h3>

                        <div className="relative w-52 h-52 shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { value: globalMonthlyProgress },
                                            { value: 100 - globalMonthlyProgress > 0 ? 100 - globalMonthlyProgress : 0 }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={90}
                                        startAngle={90}
                                        endAngle={-270}
                                        dataKey="value"
                                        stroke="none"
                                        cornerRadius={40}
                                    >
                                        <Cell fill="#8b5cf6" style={{ filter: 'drop-shadow(0px 4px 10px rgba(139, 92, 246, 0.4))' }} />
                                        <Cell fill="rgba(139, 92, 246, 0.1)" />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-4xl font-black text-violet-500 dark:text-violet-400 drop-shadow-sm">{globalMonthlyProgress}%</span>
                                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">{dict.monthCurrent} {format(new Date(), 'MMM', { locale: localeObj })}</span>
                            </div>
                        </div>
                    </div>

                    {/* 🧠 CTA AI Coach */}
                    <Link href="/coach" className="block w-full group">
                        <div className="relative overflow-hidden p-8 rounded-[2rem] bg-indigo-600 dark:bg-indigo-500/80 hover:bg-indigo-500 dark:hover:bg-indigo-400/90 transition-all duration-500 ease-out shadow-[0_12px_40px_rgba(99,102,241,0.3)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)] cursor-pointer backdrop-blur-md dark:border dark:border-white/10">
                            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white rounded-full mix-blend-overlay filter blur-[3rem] opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-700 ease-out"></div>

                            <div className="relative z-10 flex flex-col items-start gap-4 text-white">
                                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:bg-white/30 transition-colors duration-500">
                                    <Sparkles size={32} className="text-white drop-shadow-md" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold mb-1">{dict.coachCardTitle}</h3>
                                    <p className="text-indigo-100 text-sm font-medium">{dict.coachCardDesc}</p>
                                </div>
                                <div className="mt-2 flex items-center font-bold text-sm bg-white/10 px-4 py-2 rounded-full backdrop-blur-md group-hover:bg-white/20 transition-colors duration-500">
                                    {dict.coachCardBtn} <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform duration-500 ease-out" />
                                </div>
                            </div>
                        </div>
                    </Link>

                </div>
            </div>
        </div>
    );
}
