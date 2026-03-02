"use client";

import { useEffect, useState } from "react";
import { User, Mail, Phone, Building2, CreditCard, X, ShieldCheck } from "lucide-react";
import { getMyProfile } from "@/app/actions/auth";
import { useApp } from "@/contexts/AppContext";

// Tipagem do Perfil de UI
type UserProfile = {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    accountId: string;
    account: {
        name: string;
        plan: string;
    }
};

export function AccountModal() {
    const { isAccountModalOpen, closeAccountModal } = useApp();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isAccountModalOpen) {
            setIsLoading(true);
            getMyProfile().then((data: UserProfile | null) => {
                setUser(data);
                setIsLoading(false);
            });
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => { document.body.style.overflow = "unset"; };
    }, [isAccountModalOpen]);

    if (!isAccountModalOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] bg-slate-900/40 dark:bg-black/60 backdrop-blur-md overflow-y-auto p-4 sm:p-6 md:p-10 lg:p-12 flex justify-center items-start animate-in fade-in duration-200"
            onClick={closeAccountModal}
        >
            <div
                className="w-full max-w-5xl mt-2 sm:mt-6 bg-slate-50 dark:bg-slate-950 rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header fixo */}
                <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl flex items-center justify-between sticky top-0 z-10">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 font-outfit">Sua Conta</h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Gerencie seu perfil e assinatura</p>
                    </div>
                    <button
                        onClick={closeAccountModal}
                        className="w-10 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:shadow-md transition-all hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 sm:p-8 min-h-[400px]">
                    {isLoading || !user ? (
                        <div className="flex flex-col items-center justify-center h-64 opacity-50 space-y-4">
                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm font-semibold text-slate-500">Buscando dados seguros...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                            {/* Lateral Esquerda - Avatar e Ações Rápidas */}
                            <div className="col-span-1 space-y-6">
                                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm p-6 flex flex-col items-center text-center transition-all">
                                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-md mb-4 relative">
                                        <span className="text-3xl font-bold text-blue-700 dark:text-blue-400">{user.name.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{user.name}</h2>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-[10px] uppercase font-bold tracking-wider mt-2 border border-slate-200 dark:border-slate-700">
                                        <ShieldCheck size={12} className="text-blue-500" />
                                        {user.role === 'owner' ? 'Administrador' : 'Membro'}
                                    </span>
                                </div>

                                {/* Informações da Assinatura */}
                                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden transition-all">
                                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-800/20">
                                        <CreditCard size={18} className="text-slate-400" />
                                        <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">Sua Assinatura</h3>
                                    </div>
                                    <div className="p-5">
                                        <div className="flex items-center justify-between mb-5">
                                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Plano Atual</span>
                                            <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded flex items-center gap-1 border border-emerald-200 dark:border-emerald-500/20 uppercase tracking-wide shadow-sm">
                                                {user.account.plan === "free" ? "Gratuito" : "Profissional"}
                                            </span>
                                        </div>
                                        <button className="w-full h-10 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-blue-700 dark:text-white text-sm font-bold transition-colors">
                                            Fazer Upgrade
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Direita - Detalhes dos Dados */}
                            <div className="col-span-1 lg:col-span-2 space-y-6">
                                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden transition-all">
                                    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/10">
                                        <h3 className="font-bold text-slate-800 dark:text-slate-100">Informações Pessoais</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Dados de contato do dono do perfil</p>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 -mx-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-slate-700">
                                                <User size={18} className="text-slate-500 dark:text-slate-400" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5 block">Nome Completo</label>
                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.name}</p>
                                            </div>
                                            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 px-3 py-1.5 rounded-md transition-colors self-start sm:self-auto">Editar</button>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 -mx-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-slate-700">
                                                <Mail size={18} className="text-slate-500 dark:text-slate-400" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5 block">E-mail de Acesso</label>
                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 -mx-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-slate-700">
                                                <Phone size={18} className="text-slate-500 dark:text-slate-400" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5 block">Telefone Principal</label>
                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.phone || "Não cadastrado"}</p>
                                            </div>
                                            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 px-3 py-1.5 rounded-md transition-colors self-start sm:self-auto">Adicionar</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Agência Settings */}
                                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden transition-all">
                                    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl flex items-center justify-center shadow-sm">
                                                <Building2 size={18} className="text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 dark:text-slate-100">Dados da Agência</h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Espaço de trabalho</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-slate-50/60 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60">
                                            <div className="flex-1">
                                                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 block">Nome Fantasia</label>
                                                <p className="text-base font-bold text-slate-800 dark:text-slate-200">{user.account.name}</p>
                                            </div>
                                            <button className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg shadow-sm transition-all self-start sm:self-auto">
                                                Gerenciar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
