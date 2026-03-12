"use client";

import Link from "next/link";
import { useActionState, useState, useEffect, Suspense } from "react";
import { CalendarDays, Save, Eye, EyeOff, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signUpAction } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";

function SignupPageContent() {
    const searchParams = useSearchParams();
    const inviteToken = searchParams.get("invite");
    const [inviteData, setInviteData] = useState<any>(null);
    const [isVerifyingInvite, setIsVerifyingInvite] = useState(!!inviteToken);

    const [error, formAction, isPending] = useActionState(
        async (
            prevState: any,
            formData: FormData
        ) => await signUpAction(formData),
        null
    );
    const [showPassword, setShowPassword] = useState(false);
    const [preAuthUser, setPreAuthUser] = useState<any>(null);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) setPreAuthUser(user);
        });

        // Verificar Convite
        if (inviteToken) {
            fetch(`/api/agency/invitations/verify/${inviteToken}`)
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        setInviteData(data.data);
                    } else {
                        console.error("Invite error:", data.error);
                    }
                })
                .finally(() => setIsVerifyingInvite(false));
        }
    }, [inviteToken]);

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
                        {inviteData ? <Users size={24} className="text-white" /> : <CalendarDays size={24} className="text-white" />}
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 text-center" style={{ fontFamily: "Outfit, sans-serif" }}>
                        {inviteData ? `Bem-vindo à ${inviteData.accountName}` : preAuthUser ? "Completar Perfil" : "Criar sua Conta"}
                    </h1>
                    <p className="text-sm text-slate-500 mt-1.5 text-center">
                        {inviteData
                            ? `Você foi convidado para participar como ${inviteData.roleName || "Membro"}. Finalize seu acesso abaixo.`
                            : preAuthUser
                                ? `Olá ${preAuthUser.email}, finalize os detalhes da sua agência.`
                                : "Junte-se ao Social Media Pro e gerencie clientes incrivelmente bem."}
                    </p>
                </div>

                <div className="px-8 pb-8 flex-1">
                    {isVerifyingInvite ? (
                        <div className="py-12 flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Validando convite...</p>
                        </div>
                    ) : (
                        <form action={formAction} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold">
                                    {error.error || "Houve erro ao processar cadastro."}
                                </div>
                            )}

                            {inviteToken && <input type="hidden" name="invitationToken" value={inviteToken} />}

                            {/* Split inputs for names */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label htmlFor="username" className="text-xs font-bold text-slate-700">Seu Nome</label>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        placeholder="João Silva"
                                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
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
                                        defaultValue={inviteData?.accountName || ""}
                                        readOnly={!!inviteData}
                                        placeholder="Studio Criativo"
                                        className={`w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold ${inviteData ? "opacity-60 cursor-not-allowed" : "focus:bg-white"}`}
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
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
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
                                    defaultValue={inviteData?.email || preAuthUser?.email || ""}
                                    readOnly={!!inviteData || !!preAuthUser}
                                    placeholder="seu@email.com"
                                    className={`w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold ${inviteData || preAuthUser ? "opacity-60 cursor-not-allowed" : "focus:bg-white"}`}
                                    required
                                    autoComplete="email"
                                />
                            </div>

                            {!preAuthUser && (
                                <div className="space-y-1.5">
                                    <label htmlFor="password" className="text-xs font-bold text-slate-700">Senha Segura</label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="w-full h-10 px-3 pr-10 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
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
                            )}

                            <Button disabled={isPending} className="w-full h-10 mt-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white dark:text-white gap-2 font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                                <Save size={16} /> {isPending ? "Configurando Conta..." : inviteData ? "Aceitar e Entrar" : "Completar Cadastro"}
                            </Button>
                        </form>
                    )}
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

export default function SignupPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <SignupPageContent />
        </Suspense>
    );
}
