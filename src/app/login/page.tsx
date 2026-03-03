"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { CalendarDays, LogIn, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signInAction, signInWithOtpAction } from "@/app/actions/auth";
import { Save } from "lucide-react";

export default function LoginPage() {
    const [loginMode, setLoginMode] = useState<"password" | "magic">("magic");
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const [error, formAction, isPending] = useActionState(
        async (
            prevState: any,
            formData: FormData
        ) => {
            setSuccessMsg(null);
            if (loginMode === "magic") {
                const res = await signInWithOtpAction(formData);
                if (res.success) setSuccessMsg(res.success);
                return res;
            }
            return await signInAction(formData);
        },
        null
    );
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            {/* Background patterns */}
            <div className="fixed inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-3xl" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative z-10 flex flex-col">
                {/* Header */}
                <div className="px-8 pt-8 pb-6 flex flex-col items-center">
                    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg mb-4">
                        <CalendarDays size={24} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "Outfit, sans-serif" }}>
                        Bem-vindo de volta
                    </h1>
                    <p className="text-sm text-slate-500 mt-1.5 text-center">
                        Faça login para gerenciar o calendário de conteúdo da sua agência.
                    </p>
                </div>

                {/* Formulário Fake (Implementaremos Server Actions depois) */}
                <div className="px-8 pb-8 flex-1">
                    {/* Formulário */}
                    <div className="px-8 pb-8 flex-1">
                        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                            <button
                                onClick={() => setLoginMode("magic")}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${loginMode === "magic" ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                Link Mágico
                            </button>
                            <button
                                onClick={() => setLoginMode("password")}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${loginMode === "password" ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                Senha
                            </button>
                        </div>

                        <form action={formAction} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold">
                                    {error.error || "Houve um erro no acesso."}
                                </div>
                            )}
                            {successMsg && (
                                <div className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-xs font-semibold">
                                    {successMsg}
                                </div>
                            )}
                            <div className="space-y-1.5">
                                <label htmlFor="email" className="text-xs font-bold text-slate-700">Seu E-mail</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    required
                                    autoComplete="email"
                                />
                            </div>

                            {loginMode === "password" && (
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="password" className="text-xs font-bold text-slate-700">Senha</label>
                                        <Link href="/forgot-password" className="text-[10px] font-semibold text-blue-600 hover:text-blue-700">
                                            Esqueceu a senha?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            placeholder="••••••••"
                                            className="w-full h-10 px-3 pr-10 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            required={loginMode === "password"}
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <Button disabled={isPending} className="w-full h-10 mt-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 text-white dark:text-white gap-2 font-semibold">
                                {loginMode === "magic" ? <Save size={16} /> : <LogIn size={16} />}
                                {isPending ? (loginMode === "magic" ? "Enviando..." : "Entrando...") : (loginMode === "magic" ? "Enviar Link de Acesso" : "Entrar no sistema")}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 border-t border-slate-100 p-4 text-center">
                    <p className="text-xs text-slate-500 font-medium">
                        Sua agência não tem uma conta?{" "}
                        <Link href="/signup" className="text-blue-600 font-semibold hover:underline">
                            Crie grátis
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
