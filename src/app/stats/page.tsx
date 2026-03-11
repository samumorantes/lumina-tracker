"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { calculateStreaks } from '@/lib/habit-stats';
import { getDictionary } from '@/lib/i18n';
import Link from 'next/link';
import { ArrowLeft, Target, Award, Calendar, Flame, BarChart2, Activity, PieChart as PieIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { subDays, format, differenceInDays } from 'date-fns';
import { es, fr } from 'date-fns/locale';
import confetti from 'canvas-confetti';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#f43f5e'];

export default function StatsPage() {
    const { habits, language, toggleCompletion } = useHabitStore();
    const [isMounted, setIsMounted] = useState(false);
    const [expandedHabit, setExpandedHabit] = useState<string | null>(null);

    const dict = getDictionary(language).stats;
    const localeObj = language === 'fr' ? fr : es;

    useEffect(() => setIsMounted(true), []);

    const calculateRetention = (createdAt: string, completedDates: string[]) => {
        const oldestDateStr = completedDates.length > 0
            ? completedDates.reduce((oldest, current) => new Date(oldest) < new Date(current) ? oldest : current)
            : createdAt;

        const realStart = new Date(createdAt) < new Date(oldestDateStr) ? createdAt : oldestDateStr;
        const daysSinceCreation = Math.max(1, differenceInDays(new Date(), new Date(realStart)) + 1);
        return Math.min(100, Math.round((completedDates.length / daysSinceCreation) * 100));
    };

    // 1. Radar Data (Equilibrio)
    const radarData = useMemo(() => {
        return habits.map(h => ({
            subject: h.name,
            A: calculateRetention(h.createdAt, h.completedDates),
            fullMark: 100,
        }));
    }, [habits]);

    // 2. BarChart Data (Rachas Comparativas)
    const streaksData = useMemo(() => {
        return habits.map(h => {
            const { currentStreak, bestStreak } = calculateStreaks(h.completedDates);
            return {
                name: h.name.length > 10 ? h.name.substring(0, 10) + '...' : h.name,
                actual: currentStreak,
                max: bestStreak
            };
        });
    }, [habits]);

    // 3. LineChart Data (Evolución XP - 14 Días)
    const xpEvolutionData = useMemo(() => {
        return Array.from({ length: 14 }, (_, i) => {
            const d = subDays(new Date(), 13 - i);
            const dateStr = format(d, 'yyyy-MM-dd');
            const completions = habits.filter(h => h.completedDates.includes(dateStr)).length;
            return { date: format(d, 'dd MMM', { locale: localeObj }), xp: completions };
        });
    }, [habits, localeObj]);

    // 4. PieChart (Distribución Global)
    const pieData = useMemo(() => {
        return habits
            .filter(h => h.completedDates.length > 0)
            .map((h, i) => ({
                name: h.name,
                value: h.completedDates.length,
                fill: COLORS[i % COLORS.length]
            }));
    }, [habits]);

    const handleToggle = (id: string, dateStr: string, isCompleted: boolean) => {
        if (!isCompleted) {
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        }
        toggleCompletion(id, dateStr);
    };

    if (!isMounted) return null;

    return (
        <div className="min-h-screen p-6 md:p-12 font-sans text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-[#0B0F19] transition-colors duration-500 pb-28 md:pb-12">

            {/* 🌟 HEADER */}
            <header className="mb-10 pt-4 flex items-center gap-4">
                <Link href="/" className="p-3 bg-white/40 dark:bg-white/5 rounded-full hover:scale-110 active:scale-95 transition-all duration-500 ease-out shadow-sm backdrop-blur-md dark:border dark:border-white/10">
                    <ArrowLeft size={24} className="text-slate-700 dark:text-slate-300" />
                </Link>
                <div>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3 transition-colors duration-500">
                        {dict.title}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium transition-colors duration-500">Analíticas Avanzadas 5-Vistas.</p>
                </div>
            </header>

            <div className="max-w-6xl mx-auto space-y-10">

                {habits.length === 0 ? (
                    <div className="p-10 text-center text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/60 dark:border-white/10 shadow-sm">
                        {dict.noHabits}
                    </div>
                ) : (
                    <>
                        {/* ========================================================= */}
                        {/* 🎛️ PANEL GLOBAL DE GRÁFICOS (4 VISTAS)                  */}
                        {/* ========================================================= */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">

                            {/* 🕸️ 1. RADAR CHART (Equilibrio) */}
                            {habits.length >= 3 && (
                                <div className="p-6 rounded-[2rem] bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Target className="text-purple-500" size={20} />
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Equilibrio de Disciplina</h3>
                                    </div>
                                    <div className="h-64 w-full flex justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                                <PolarGrid stroke="rgba(139, 92, 246, 0.2)" />
                                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#8b5cf6', fontSize: 10, fontWeight: 'bold' }} />
                                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                                <Radar name="Retención %" dataKey="A" stroke="#8b5cf6" strokeWidth={3} fill="#8b5cf6" fillOpacity={0.4} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(11, 15, 25, 0.9)', backdropFilter: 'blur(10px)' }}
                                                    itemStyle={{ color: '#a78bfa', fontWeight: 'bold' }}
                                                    formatter={(value: any) => [`${value}%`, dict.retention]}
                                                />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}

                            {/* 📈 2. LINE CHART (Tendencia XP 14 Días) */}
                            <div className="p-6 rounded-[2rem] bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
                                <div className="flex items-center gap-2 mb-4">
                                    <Activity className="text-emerald-500" size={20} />
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Evolución XP (14 Días)</h3>
                                </div>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={xpEvolutionData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="date" stroke="transparent" tick={{ fill: '#94a3b8', fontSize: 10 }} dy={10} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(11, 15, 25, 0.9)', backdropFilter: 'blur(10px)' }}
                                                labelStyle={{ color: '#cbd5e1' }}
                                                itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                                            />
                                            <Line type="monotone" dataKey="xp" name="XP (Hábitos)" stroke="#10b981" strokeWidth={4} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 8, fill: '#059669', strokeWidth: 0 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* 📊 3. BAR CHART (Rachas Comparativas) */}
                            <div className="p-6 rounded-[2rem] bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
                                <div className="flex items-center gap-2 mb-4">
                                    <BarChart2 className="text-blue-500" size={20} />
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Rachas: Actual vs Histórica</h3>
                                </div>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={streaksData} barSize={20}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="name" stroke="transparent" tick={{ fill: '#94a3b8', fontSize: 10 }} dy={10} />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                                                contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(11, 15, 25, 0.9)', backdropFilter: 'blur(10px)' }}
                                            />
                                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                            <Bar dataKey="actual" name={dict.currentStreak} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="max" name={dict.bestStreak} fill="#94a3b8" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* 🥧 4. PIE CHART (Distribución Global) */}
                            <div className="p-6 rounded-[2rem] bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex flex-col items-center">
                                <div className="flex items-center gap-2 mb-4 w-full">
                                    <PieIcon className="text-amber-500" size={20} />
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Distribución de Esfuerzo</h3>
                                </div>
                                {pieData.length > 0 ? (
                                    <div className="h-64 w-full flex justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={90}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    stroke="transparent"
                                                >
                                                    {pieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(11, 15, 25, 0.9)', backdropFilter: 'blur(10px)' }}
                                                    itemStyle={{ fontWeight: 'bold' }}
                                                    formatter={(value: any) => [`${value} días`, "Completados"]}
                                                />
                                                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center opacity-50 text-sm font-medium">No hay datos suficientes.</div>
                                )}
                            </div>
                        </div>

                        <hr className="border-slate-200 dark:border-white/10 my-8" />
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white px-2">Historiales de Hábitos</h2>

                        {/* ========================================================= */}
                        {/* 🟩 5. CUSTOM GRID TRACKER (30 Días p/Hábito)            */}
                        {/* ========================================================= */}
                        {habits.map((habit) => {
                            const { currentStreak, bestStreak } = calculateStreaks(habit.completedDates);
                            const retention = calculateRetention(habit.createdAt, habit.completedDates);

                            // Generar array de los últimos 30 días
                            const last30Days = Array.from({ length: 30 }, (_, i) => {
                                const d = subDays(new Date(), 29 - i);
                                const dateStr = format(d, 'yyyy-MM-dd');
                                return {
                                    dateStr,
                                    dayDisplay: format(d, 'd'),
                                    monthDisplay: format(d, 'MMM', { locale: localeObj }),
                                    isCompleted: habit.completedDates.includes(dateStr)
                                };
                            });

                            return (
                                <div key={habit.id} className="relative overflow-hidden p-6 md:p-8 rounded-[2rem] bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all duration-500 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:hover:bg-white/10 group">

                                    {/* Encabezado del Hábito CLICKABLE */}
                                    <div
                                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 cursor-pointer p-2 rounded-2xl hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors"
                                        onClick={() => setExpandedHabit(expandedHabit === habit.id ? null : habit.id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-14 h-14 rounded-xl ${habit.categoryColor} flex items-center justify-center shadow-md`}>
                                                <Target className="text-white drop-shadow-sm" size={28} />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{habit.name}</h3>
                                                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                                                    {habit.frequency === 'daily' ? dict.freqDaily : dict.freqWeekly} • {habit.completedDates.length} completados
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-400 self-end md:self-auto">
                                            <span className="text-xs font-bold uppercase tracking-wider">{expandedHabit === habit.id ? 'Ocultar Analíticas' : 'Ver Analíticas Profundas'}</span>
                                            {expandedHabit === habit.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                        </div>
                                    </div>

                                    {/* CONTENIDO DESPLEGABLE CON GRÁFICOS AISLADOS */}
                                    {expandedHabit === habit.id && (
                                        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 animate-in fade-in slide-in-from-top-4 duration-500">

                                            {/* KPIs de Desempeño */}
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                                <div className="flex flex-col items-center justify-center p-4 bg-slate-50/50 dark:bg-white/5 rounded-2xl border border-white/40 dark:border-transparent transition-colors shadow-sm">
                                                    <Flame size={24} className="text-orange-500 dark:text-orange-400 mb-2" />
                                                    <span className="text-2xl font-black text-slate-800 dark:text-white">{currentStreak}</span>
                                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">{dict.currentStreak}</span>
                                                </div>

                                                <div className="flex flex-col items-center justify-center p-4 bg-slate-50/50 dark:bg-white/5 rounded-2xl border border-white/40 dark:border-transparent transition-colors shadow-sm">
                                                    <Award size={24} className="text-yellow-500 dark:text-yellow-400 mb-2" />
                                                    <span className="text-2xl font-black text-slate-800 dark:text-white">{bestStreak}</span>
                                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">{dict.bestStreak}</span>
                                                </div>

                                                <div className="flex flex-col items-center justify-center p-4 bg-slate-50/50 dark:bg-white/5 rounded-2xl border border-white/40 dark:border-transparent transition-colors shadow-sm">
                                                    <Calendar size={24} className="text-indigo-500 dark:text-indigo-400 mb-2" />
                                                    <span className="text-2xl font-black text-slate-800 dark:text-white">{habit.completedDates.length}</span>
                                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Días Totales</span>
                                                </div>

                                                <div className="flex flex-col items-center justify-center p-4 bg-slate-50/50 dark:bg-white/5 rounded-2xl border border-white/40 dark:border-transparent transition-colors shadow-sm">
                                                    <span className="text-2xl mt-1 mb-1 font-black text-emerald-500 dark:text-emerald-400 drop-shadow-sm">
                                                        {retention}%
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">{dict.retention}</span>
                                                </div>
                                            </div>

                                            {/* Sub-Gráficos: Line (XP de 10 días) y Bar (Días Semana) */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                                <div className="h-48 w-full bg-slate-50/50 dark:bg-[#080B13]/30 p-4 rounded-2xl border border-white/40 dark:border-white/5 border-dashed">
                                                    <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Frecuencia Últimos 10 Días</p>
                                                    <ResponsiveContainer width="100%" height="80%">
                                                        <LineChart data={last30Days.slice(20)}>
                                                            <XAxis dataKey="dayDisplay" stroke="transparent" tick={{ fill: '#94a3b8', fontSize: 10 }} dy={5} />
                                                            <Tooltip contentStyle={{ borderRadius: '12px', background: 'rgba(11, 15, 25, 0.9)' }} itemStyle={{ color: '#8b5cf6' }} />
                                                            <Line type="step" dataKey="isCompleted" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 3, fill: '#8b5cf6', strokeWidth: 0 }} />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                </div>
                                                <div className="h-48 w-full bg-slate-50/50 dark:bg-[#080B13]/30 p-4 rounded-2xl border border-white/40 dark:border-white/5 border-dashed">
                                                    <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Frecuencia por Día de la Semana</p>
                                                    <ResponsiveContainer width="100%" height="80%">
                                                        <BarChart data={
                                                            (() => {
                                                                const daysOfWeekCount = [0, 0, 0, 0, 0, 0, 0];
                                                                const dayNames = language === 'fr' 
                                                                    ? ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'] 
                                                                    : ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                                                                habit.completedDates.forEach(dateStr => {
                                                                    const d = new Date(dateStr + 'T12:00:00');
                                                                    daysOfWeekCount[d.getDay()]++;
                                                                });
                                                                return dayNames.map((name, i) => ({ name, count: daysOfWeekCount[i] }));
                                                            })()
                                                        }>
                                                            <XAxis dataKey="name" stroke="transparent" tick={{ fill: '#94a3b8', fontSize: 10 }} dy={5} />
                                                            <Tooltip cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }} contentStyle={{ borderRadius: '12px', background: 'rgba(11, 15, 25, 0.9)', border: 'none' }} itemStyle={{ color: '#8b5cf6' }} />
                                                            <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 4, 4]} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>

                                        </div>
                                    )}

                                    {/* 🟩 Tracker Custom (30 Días) SIEMPRE VISIBLE */}
                                    <div className="px-1 mt-4">
                                        <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3 ml-1 uppercase tracking-wider">Últimos 30 Días</h4>
                                        <div className="flex flex-wrap gap-2 justify-start">
                                            {last30Days.map((day, idx) => (
                                                <button
                                                    key={day.dateStr}
                                                    onClick={() => handleToggle(habit.id, day.dateStr, day.isCompleted)}
                                                    title={`${day.dayDisplay} ${day.monthDisplay}`}
                                                    className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all duration-300 ease-out active:scale-75 hover:scale-110 shadow-sm
                                ${day.isCompleted
                                                            ? habit.categoryColor + ' text-white dark:shadow-[0_0_12px_rgba(255,255,255,0.15)]'
                                                            : 'bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-transparent text-slate-400 hover:bg-white dark:hover:bg-white/10'
                                                        }
                             `}
                                                >
                                                    <span className="text-[10px] md:text-xs font-bold opacity-60">
                                                        {day.dayDisplay}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>
        </div>
    );
}
