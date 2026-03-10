"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, UserPlus, Lock, User } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ username: "", name: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Error al registrar");
            }

            router.push("/login?registered=true");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-[#0B0F19] transition-colors duration-500">
            <div className="w-full max-w-md bg-white/60 dark:bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">

                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg dark:shadow-[0_4px_20px_rgba(99,102,241,0.2)]">
                        <UserPlus className="text-white drop-shadow-md" size={32} />
                    </div>
                </div>

                <h1 className="text-3xl font-black text-center text-slate-800 dark:text-white mb-2">Crear Cuenta</h1>
                <p className="text-center text-slate-500 dark:text-slate-400 font-medium mb-8">Únete a Lumina y sincroniza tu progreso</p>

                {error && (
                    <div className="bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 p-3 rounded-xl mb-6 text-sm font-bold text-center border border-red-200 dark:border-red-500/30">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative">
                        <User className="absolute left-4 top-3.5 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Nombre Público (Ej: Alex)"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-[#151B2B]/80 rounded-xl border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 dark:text-slate-200"
                        />
                    </div>
                    <div className="relative">
                        <User className="absolute left-4 top-3.5 text-slate-400" size={20} />
                        <input
                            type="text"
                            required
                            placeholder="Nombre de Usuario (Único)"
                            value={form.username}
                            onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, "") })}
                            className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-[#151B2B]/80 rounded-xl border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 dark:text-slate-200"
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
                        <input
                            type="password"
                            required
                            placeholder="Contraseña"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-[#151B2B]/80 rounded-xl border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 dark:text-slate-200"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? "Creando..." : "Comenzar Aventura"} <ArrowRight size={20} />
                    </button>
                </form>

                <p className="text-center mt-6 text-sm font-medium text-slate-500 dark:text-slate-400">
                    ¿Ya tienes cuenta? <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Inicia Sesión</Link>
                </p>
            </div>
        </div>
    );
}
