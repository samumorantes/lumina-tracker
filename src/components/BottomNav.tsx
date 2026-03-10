"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart2, Sparkles, Moon, Sun, Globe, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useHabitStore } from "@/store/useHabitStore";
import { getDictionary } from "@/lib/i18n";

export default function BottomNav() {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const { language, toggleLanguage } = useHabitStore();
    const [mounted, setMounted] = useState(false);

    const dict = getDictionary(language).nav;

    useEffect(() => setMounted(true), []);

    const navItems = [
        { name: dict.today, href: "/", icon: Home },
        { name: dict.stats, href: "/stats", icon: BarChart2 },
        { name: dict.coach, href: "/coach", icon: Sparkles },
        { name: dict.profile, href: "/profile", icon: User },
    ];

    return (
        <>
            {/* Botones Flotantes (Global Actions) */}
            {mounted && (
                <div className="fixed top-6 right-6 z-50 flex gap-3">

                    {/* Language Toggle (ES / FR) */}
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_4px_15px_rgba(0,0,0,0.05)] text-slate-700 dark:text-slate-200 hover:scale-105 active:scale-95 transition-all duration-300 ease-out font-bold text-xs uppercase"
                        title="Cambiar Idioma / Changer de Langue"
                    >
                        <Globe size={16} />
                        <span>{language}</span>
                    </button>

                    {/* Theme Toggle (Dark Mode Premium Lumina) */}
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="p-3 rounded-full bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_4px_15px_rgba(0,0,0,0.05)] text-slate-700 dark:text-slate-200 hover:scale-105 active:scale-95 transition-all duration-300 ease-out"
                        title="Alternar Modo Oscuro"
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                </div>
            )}

            {/* Bottom Navigation Bar (Mobile) */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-safe pt-2 bg-white/70 dark:bg-[#080B13]/80 backdrop-blur-2xl border-t border-white/40 dark:border-white/5 shadow-[0_-8px_30px_rgb(0,0,0,0.05)] dark:shadow-[0_-5px_30px_rgba(0,0,0,0.5)] md:hidden transition-colors duration-500">
                <ul className="flex items-center justify-around h-16">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex flex-col items-center justify-center w-16 h-full space-y-1 transition-all duration-500 ease-out ${isActive
                                        ? "text-indigo-600 dark:text-indigo-400 scale-110"
                                        : "text-slate-400 dark:text-slate-500 hover:text-indigo-400 dark:hover:text-indigo-300 hover:scale-105"
                                        }`}
                                >
                                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : ''} />
                                    <span className={`text-[10px] font-bold tracking-wide ${isActive ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
                                        {item.name}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Side Navigation for Desktop */}
            <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-24 bg-white/70 dark:bg-[#080B13]/80 backdrop-blur-2xl border-r border-white/40 dark:border-white/5 shadow-[8px_0_30px_rgb(0,0,0,0.02)] dark:shadow-[8px_0_30px_rgba(0,0,0,0.3)] items-center py-10 z-40 transition-colors duration-500">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-xl mb-12 shadow-[0_4px_15px_rgba(99,102,241,0.4)] hover:scale-110 transition-transform duration-500 ease-out cursor-pointer">
                    L
                </div>
                <ul className="flex flex-col items-center space-y-8 w-full">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <li key={item.href} className="w-full relative group flex justify-center">
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 dark:bg-indigo-400 rounded-r-lg shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                                )}
                                <Link
                                    href={item.href}
                                    className={`flex flex-col items-center p-3 rounded-2xl transition-all duration-500 ease-out ${isActive
                                        ? "bg-indigo-50 dark:bg-white/5 text-indigo-600 dark:text-indigo-400 shadow-inner"
                                        : "text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:scale-110"
                                        }`}
                                    title={item.name}
                                >
                                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </aside>
        </>
    );
}
