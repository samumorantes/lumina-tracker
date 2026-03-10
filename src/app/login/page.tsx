"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Lock, User, ArrowRight } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                redirect: false,
                username: form.username,
                password: form.password,
            });

            if (res?.error) {
                throw new Error(res.error);
            }

            router.push("/");
            router.refresh(); // Refrescar el estado de sesión root
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
                        <LogIn className="text-white drop-shadow-md" size={32} />
                    </div>
                </div>

                <h1 className="text-3xl font-black text-center text-slate-800 dark:text-white mb-2">Bienvenido</h1>
                <p className="text-center text-slate-500 dark:text-slate-400 font-medium mb-8">Inicia sesión en tu cuenta de Lumina</p>

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
                            required
                            placeholder="Nombre de Usuario"
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
                        {loading ? "Entrando..." : "Acceder"} <ArrowRight size={20} />
                    </button>
                </form>

                <p className="text-center mt-6 text-sm font-medium text-slate-500 dark:text-slate-400">
                    ¿No tienes cuenta? <Link href="/register" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Regístrate</Link>
                </p>
            </div>
        </div>
    );
}
