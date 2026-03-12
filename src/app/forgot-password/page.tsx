"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { CalendarDays, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { forgotPasswordAction } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const [error, formAction, isPending] = useActionState(
        async (prevState: any, formData: FormData) => {
            setSuccessMsg(null);
            const res = await forgotPasswordAction(formData);
            if (res.success) {
                setSuccessMsg(res.success);
                return null; // sucesso: não mostrar erro
            }
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
                        Recuperar Senha
                    </h1>
                    <p className="text-sm text-slate-500 mt-1.5 text-center px-4">
                        Insira seu e-mail e enviaremos um link seguro para você redefinir sua senha.
                    </p>
                </div>

                <div className="px-8 pb-8 flex-1">
                    <form action={formAction} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold uppercase tracking-tight">
                                {error.error || "Houve um erro ao solicitar o link."}
                            </div>
                        )}
                        {successMsg && (
                            <div className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold uppercase tracking-widest leading-relaxed">
                                <p className="mb-2">✓ {successMsg}</p>
                                <p className="text-[10px] opacity-80 uppercase">DICA: Verifique também sua pasta de spam.</p>
                            </div>
                        )}

                        {!successMsg && (
                            <>
                                <div className="space-y-1.5">
                                    <label htmlFor="email" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seu E-mail Corporativo</label>
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="seu@email.com"
                                            className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-outfit"
                                            required
                                            autoComplete="email"
                                        />
                                    </div>
                                </div>

                                <Button disabled={isPending} className="w-full h-11 mt-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 text-white dark:text-white gap-2 font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg shadow-slate-200">
                                    {isPending ? "Processando..." : "Enviar link de recuperação"}
                                </Button>
                            </>
                        )}

                        <div className="pt-2">
                            <Link href="/login" className="flex items-center justify-center gap-2 text-xs font-black text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest">
                                <ArrowLeft size={14} /> Voltar para o login
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 border-t border-slate-100 p-4 text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Social Media Calendar Pro &copy; 2026
                    </p>
                </div>
            </div>
        </div>
    );
}
