"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { CalendarDays, Key, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resetPasswordAction } from "@/app/actions/auth";

export default function ResetPasswordPage() {
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const [error, formAction, isPending] = useActionState(
        async (prevState: any, formData: FormData) => {
            setSuccessMsg(null);
            const res = await resetPasswordAction(formData);
            if (res.success) setSuccessMsg(res.success);
            return res;
        },
        null
    );

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
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
                        Nova Senha
                    </h1>
                    <p className="text-sm text-slate-500 mt-1.5 text-center px-4">
                        Agora escolha uma senha forte para proteger sua conta e os dados de seus clientes.
                    </p>
                </div>

                <div className="px-8 pb-8 flex-1">
                    <form action={formAction} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold uppercase tracking-tight">
                                {error.error || "Houve um erro ao atualizar a senha."}
                            </div>
                        )}
                        {successMsg && (
                            <div className="p-6 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-center space-y-4">
                                <div className="flex justify-center">
                                    <CheckCircle2 size={40} className="text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-black uppercase tracking-widest">{successMsg}</p>
                                    <p className="text-[10px] opacity-70 mt-1 uppercase font-bold">Acesse agora sua dashboard premium.</p>
                                </div>
                                <Link href="/login" className="block w-full h-11 bg-slate-900 hover:bg-black dark:bg-slate-900 dark:hover:bg-black text-white dark:text-white rounded-xl flex items-center justify-center text-xs font-black uppercase tracking-widest transition-all">
                                    Fazer Login
                                </Link>
                            </div>
                        )}

                        {!successMsg && (
                            <>
                                <div className="space-y-1.5">
                                    <label htmlFor="password" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha de Alta Segurança</label>
                                    <div className="relative">
                                        <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-outfit"
                                            required
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

                                <div className="space-y-1.5 border-b border-slate-50 pb-2">
                                    <label htmlFor="confirmPassword" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirmar Nova Senha</label>
                                    <div className="relative">
                                        <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-outfit"
                                            required
                                            autoComplete="new-password"
                                        />
                                    </div>
                                </div>

                                <Button disabled={isPending} className="w-full h-11 mt-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white dark:text-white gap-2 font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg shadow-blue-500/20">
                                    {isPending ? "Salvando..." : "Redefinir e Salvar Senha"}
                                </Button>
                            </>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
