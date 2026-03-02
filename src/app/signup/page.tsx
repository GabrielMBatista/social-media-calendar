"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { CalendarDays, Save, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signUpAction } from "@/app/actions/auth";

export default function SignupPage() {
    const [error, formAction, isPending] = useActionState(
        async (
            prevState: any,
            formData: FormData
        ) => await signUpAction(formData),
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

            <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative z-10 flex flex-col">
                {/* Header */}
                <div className="px-8 pt-8 pb-5 flex flex-col items-center">
                    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg mb-4">
                        <CalendarDays size={24} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "Outfit, sans-serif" }}>
                        Criar sua Conta
                    </h1>
                    <p className="text-sm text-slate-500 mt-1.5 text-center">
                        Junte-se ao Social Media Pro e gerencie clientes incrivelmente bem.
                    </p>
                </div>

                <div className="px-8 pb-8 flex-1">
                    <form action={formAction} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold">
                                {error.error || "Houve erro ao processar cadastro."}
                            </div>
                        )}
                        {/* Split inputs for names */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label htmlFor="username" className="text-xs font-bold text-slate-700">Seu Nome</label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    placeholder="João Silva"
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    required
                                    autoComplete="name"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="agency" className="text-xs font-bold text-slate-700">Agência (Nome)</label>
                                <input
                                    id="agency"
                                    name="agency"
                                    type="text"
                                    placeholder="Studio Criativo"
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    required
                                    autoComplete="organization"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="phone" className="text-xs font-bold text-slate-700">Telefone (WhatsApp)</label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="(11) 99999-9999"
                                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                required
                                autoComplete="tel"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="email" className="text-xs font-bold text-slate-700">E-mail</label>
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

                        <div className="space-y-1.5">
                            <label htmlFor="password" className="text-xs font-bold text-slate-700">Senha Segura</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full h-10 px-3 pr-10 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
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

                        <Button disabled={isPending} className="w-full h-10 mt-2 bg-blue-600 hover:bg-blue-700 text-white gap-2 font-semibold">
                            <Save size={16} /> {isPending ? "Configurando Conta..." : "Completar Cadastro"}
                        </Button>
                    </form>

                    {/* Social */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-slate-100" />
                        <span className="text-xs font-medium text-slate-400">OU ENTRE COM</span>
                        <div className="flex-1 h-px bg-slate-100" />
                    </div>

                    <button className="w-full h-10 flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-sm font-semibold text-slate-700">
                        <svg viewBox="0 0 24 24" className="w-5 h-5">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google OAuth
                    </button>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 border-t border-slate-100 p-4 text-center">
                    <p className="text-xs text-slate-500 font-medium">
                        Já possui uma conta?{" "}
                        <Link href="/login" className="text-slate-800 font-bold hover:underline">
                            Fazer login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
