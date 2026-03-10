"use client";

import { useMemo, useState, useEffect } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { useSession } from 'next-auth/react';
import { getDictionary } from '@/lib/i18n';
import Link from 'next/link';
import { ArrowLeft, Trophy, Crown, User, UserPlus, Check, X, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

// Definición de niveles Memes (Internacional)
export const getLevelFromXP = (xp: number) => {
    if (xp < 5) return { level: 0, title: "NPC Base 😐", color: "text-slate-500", nextAt: 5 };
    if (xp < 15) return { level: 1, title: "Sigma En Proceso 🍷", color: "text-blue-500", nextAt: 15 };
    if (xp < 30) return { level: 2, title: "Chad Respetable 🗿", color: "text-emerald-500", nextAt: 30 };
    if (xp < 60) return { level: 3, title: "Looksmaxxer Letal 🤫🧏‍♂️", color: "text-purple-500", nextAt: 60 };
    return { level: 4, title: "Gigachad Supremo 🚀", color: "text-amber-500", nextAt: xp + 100 }; // Max level
};

interface ProfileFriend {
    id: string;      // friendship id
    userId: string;  // friend user id
    username: string;
    name: string;
    xp: number;
    levelTitle: string;
}

interface PendingRequest {
    id: string; // friendship id
    senderId: string;
    username: string;
    name: string;
}

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const { habits, language, userName } = useHabitStore();
    const [isMounted, setIsMounted] = useState(false);

    const [friends, setFriends] = useState<ProfileFriend[]>([]);
    const [requests, setRequests] = useState<PendingRequest[]>([]);
    const [searchUsername, setSearchUsername] = useState("");
    const [searchMsg, setSearchMsg] = useState({ text: "", type: "" });

    const dict = getDictionary(language);

    // Calcular XP Total del usuario actual
    const totalXP = useMemo(() => {
        return habits.reduce((acc, currentHabit) => acc + currentHabit.completedDates.length, 0);
    }, [habits]);

    const { level, title, color, nextAt } = getLevelFromXP(totalXP);
    const progressPercent = level === 4 ? 100 : Math.min(100, Math.round((totalXP / nextAt) * 100));

    const fetchSocialData = async () => {
        try {
            const res = await fetch('/api/friends');
            if (res.ok) {
                const data = await res.json();
                setFriends(data.friends || []);
                setRequests(data.pendingRequests || []);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        setIsMounted(true);
        if (status === 'authenticated') {
            fetchSocialData();
        }
    }, [status]);

    // Combinar amigos con el usuario y ordenarlos por XP para el Ranking
    const ranking = useMemo(() => {
        const friendsFormatted = friends.map(f => ({ ...f, isMe: false }));
        const myName = session?.user?.name || (session?.user as any)?.username || userName || 'Yo';
        const all = [...friendsFormatted, { id: 'me', name: myName, xp: totalXP, levelTitle: title, isMe: true }];
        return all.sort((a, b) => b.xp - a.xp);
    }, [totalXP, title, userName, friends, session]);

    const handleSendRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchUsername.trim()) return;
        setSearchMsg({ text: "Buscando...", type: "info" });

        try {
            const res = await fetch('/api/friends', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUsername: searchUsername.trim() })
            });
            const data = await res.json();

            if (res.ok) {
                setSearchMsg({ text: "¡Solicitud enviada a " + searchUsername + "!", type: "success" });
                setSearchUsername("");
            } else {
                setSearchMsg({ text: data.message, type: "error" });
            }
        } catch (err) {
            setSearchMsg({ text: "Error de red", type: "error" });
        }
    };

    const handleAccept = async (id: string) => {
        try {
            const res = await fetch(`/api/friends/${id}`, { method: 'PUT' });
            if (res.ok) {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                fetchSocialData();
            }
        } catch (e) { }
    };

    const handleReject = async (id: string) => {
        try {
            await fetch(`/api/friends/${id}`, { method: 'DELETE' });
            fetchSocialData();
        } catch (e) { }
    };

    if (!isMounted) return null;

    if (status === 'unauthenticated') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0F19] flex-col p-6 text-center">
                <ShieldAlert size={64} className="text-indigo-500 mb-6" />
                <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-4">Zona Restringida</h1>
                <p className="text-slate-500 mb-8 max-w-sm">Debes iniciar sesión para conectar con la red de hábitos y competir con amigos locales.</p>
                <Link href="/login" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-xl transition-all">Ir a Iniciar Sesión</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 md:p-12 font-sans text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-[#0B0F19] transition-colors duration-500 pb-28 md:pb-12">
            {/* HEADER */}
            <header className="mb-10 pt-4 flex items-center gap-4">
                <Link href="/" className="p-3 bg-white/40 dark:bg-white/5 rounded-full hover:scale-110 active:scale-95 transition-all duration-500 ease-out shadow-sm backdrop-blur-md dark:border dark:border-white/10">
                    <ArrowLeft size={24} className="text-slate-700 dark:text-slate-300" />
                </Link>
                <div>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3 transition-colors duration-500">
                        Lumina Social
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium transition-colors duration-500">Progreso Global y Amigos</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

                {/* COLUMNA IZQUIERDA: TARJETA DE USUARIO Y BANDEJA DE ENTRADA */}
                <div className="lg:col-span-1 space-y-8">
                    {/* TARJETA DE JUGADOR */}
                    <div className="p-8 rounded-[2rem] bg-indigo-600 text-white shadow-[0_12px_40px_rgba(79,70,229,0.3)] relative overflow-hidden group">
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 ease-out"></div>
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4 border-2 border-white/50 shadow-inner">
                                <User size={48} className="text-white drop-shadow-md" />
                            </div>
                            <h2 className="text-2xl font-black mb-1">{session?.user?.name || (session?.user as any)?.username}</h2>
                            <p className={`text-sm font-bold opacity-90 px-3 py-1 bg-black/20 rounded-full flex items-center gap-2 ${color.replace('text-', 'text-white ')}`}>
                                {level === 4 && <Crown size={14} className="text-amber-300" />} {title}
                            </p>

                            <div className="w-full mt-8">
                                <div className="flex justify-between text-xs font-bold mb-2 opacity-80 uppercase tracking-wider">
                                    <span>Nivel {level}</span>
                                    <span>{level === 4 ? 'MAX' : `${totalXP} / ${nextAt} XP`}</span>
                                </div>
                                <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden relative">
                                    <div
                                        className="h-full bg-white rounded-full transition-all duration-1000 ease-out relative"
                                        style={{ width: `${progressPercent}%` }}
                                    >
                                        <div className="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-r from-transparent to-white/50 animate-[shimmer_2s_infinite]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BANDEJA DE ENTRADA (SOLICITUDES) */}
                    {requests.length > 0 && (
                        <div className="p-6 rounded-[2rem] bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span> Solicitudes Recibidas
                            </h3>
                            <div className="space-y-3">
                                {requests.map(req => (
                                    <div key={req.id} className="flex items-center justify-between p-3 bg-white/50 dark:bg-[#151B2B]/80 rounded-xl border border-slate-200 dark:border-white/5">
                                        <div>
                                            <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{req.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">@{req.username}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button title="Aceptar Solicitud" aria-label="Aceptar" onClick={() => handleAccept(req.id)} className="p-2 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors"><Check size={16} /></button>
                                            <button title="Rechazar Solicitud" aria-label="Rechazar" onClick={() => handleReject(req.id)} className="p-2 bg-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-colors"><X size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* BUSCAR / AÑADIR AMIGO */}
                    <div className="p-6 rounded-[2rem] bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <UserPlus size={18} className="text-indigo-500" /> Añadir Conexión
                        </h3>
                        <form onSubmit={handleSendRequest} className="space-y-4">
                            <input
                                type="text"
                                value={searchUsername}
                                onChange={(e) => setSearchUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
                                placeholder="Buscar por @usuario"
                                className="w-full bg-white/50 dark:bg-[#151B2B]/80 px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 dark:text-slate-200 text-sm"
                            />
                            <button
                                type="submit"
                                disabled={!searchUsername.trim()}
                                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold transition-all active:scale-95 text-sm"
                            >
                                Enviar Solicitud
                            </button>
                            {searchMsg.text && (
                                <p className={`text-xs font-bold text-center ${searchMsg.type === 'error' ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    {searchMsg.text}
                                </p>
                            )}
                        </form>
                    </div>

                </div>

                {/* COLUMNA DERECHA: LEADERBOARD REAL */}
                <div className="lg:col-span-2 p-6 md:p-10 rounded-[2rem] bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-xl">
                            <Trophy className="text-indigo-600 dark:text-indigo-400" size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white">Leaderboard Global</h2>
                            <p className="text-sm font-medium text-slate-500">Compite contra tus amigos reales.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {ranking.map((user, index) => (
                            <div
                                key={user.id}
                                className={`flex items-center justify-between p-4 md:p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.01] ${user.isMe
                                    ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 shadow-md'
                                    : 'bg-white/40 dark:bg-[#151B2B]/60 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 shadow-sm'
                                    }`}
                            >
                                <div className="flex items-center gap-4 md:gap-6">
                                    <span className={`text-xl md:text-2xl font-black w-8 text-center ${index === 0 ? 'text-amber-500 drop-shadow-md' :
                                        index === 1 ? 'text-slate-400 drop-shadow-md' :
                                            index === 2 ? 'text-amber-700 drop-shadow-md' :
                                                'text-slate-300 dark:text-slate-600'
                                        }`}>
                                        #{index + 1}
                                    </span>

                                    <div>
                                        <h3 className={`font-bold text-base md:text-lg flex items-center gap-2 ${user.isMe ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-800 dark:text-slate-200'}`}>
                                            {user.name} {user.isMe && <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Tú</span>}
                                        </h3>
                                        <p className={`text-xs md:text-sm font-bold mt-1 ${user.levelTitle.includes('NPC') ? 'text-slate-500' :
                                            user.levelTitle.includes('Sigma') ? 'text-blue-500' :
                                                user.levelTitle.includes('Chad Respetable') ? 'text-emerald-500' :
                                                    user.levelTitle.includes('Looksmaxxer') ? 'text-purple-500' :
                                                        'text-amber-500'
                                            }`}>
                                            {user.levelTitle}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <span className={`text-2xl md:text-3xl font-black block tracking-tighter ${user.isMe ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {user.xp}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">XP</span>
                                </div>
                            </div>
                        ))}

                        {ranking.length === 1 && (
                            <div className="pt-8 text-center text-slate-500 text-sm font-medium">
                                Parece que estás solo en la cima. ¡Invita a amigos y descubre quién manda!
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
