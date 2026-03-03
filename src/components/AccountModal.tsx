"use client";

import { useEffect, useState, useTransition } from "react";
import { User, Mail, Phone, Building2, CreditCard, X, ShieldCheck, Save, CheckCircle2 } from "lucide-react";
import { getMyProfile, updateProfileAction, updateAccountAction } from "@/app/actions/auth";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";

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
    const [isPending, startTransition] = useTransition();

    // States de edição
    const [editingProfile, setEditingProfile] = useState(false);
    const [editingAccount, setEditingAccount] = useState(false);

    useEffect(() => {
        if (isAccountModalOpen) {
            loadProfile();
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
            setEditingProfile(false);
            setEditingAccount(false);
        }
        return () => { document.body.style.overflow = "unset"; };
    }, [isAccountModalOpen]);

    const loadProfile = async () => {
        setIsLoading(true);
        const data = await getMyProfile();
        setUser(data as UserProfile | null);
        setIsLoading(false);
    };

    const handleUpdateProfile = async (formData: FormData) => {
        startTransition(async () => {
            const result = await updateProfileAction(formData);
            if (result.success) {
                toast.success(result.success);
                setEditingProfile(false);
                loadProfile();
            } else {
                toast.error(result.error);
            }
        });
    };

    const handleUpdateAccount = async (formData: FormData) => {
        startTransition(async () => {
            const result = await updateAccountAction(formData);
            if (result.success) {
                toast.success(result.success);
                setEditingAccount(false);
                loadProfile();
            } else {
                toast.error(result.error);
            }
        });
    };

    if (!isAccountModalOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] bg-slate-900/40 dark:bg-black/60 backdrop-blur-md overflow-y-auto p-4 sm:p-6 md:p-10 lg:p-12 flex justify-center items-start animate-in fade-in duration-200"
            onClick={closeAccountModal}
        >
            <div
                className="w-full max-w-5xl mt-2 sm:mt-6 bg-slate-50 dark:bg-slate-950 rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden relative shadow-indigo-500/10"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header fixo */}
                <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl flex items-center justify-between sticky top-0 z-10 font-outfit">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight">Sua Conta</h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Gerencie seu perfil e assinatura profissional</p>
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
                        <div className="flex flex-col items-center justify-center h-64 opacity-50 space-y-4 font-outfit">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Sincronizando dados...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 font-outfit">
                            {/* Lateral Esquerda - Avatar e Ações Rápidas */}
                            <div className="col-span-1 space-y-6">
                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm p-6 flex flex-col items-center text-center transition-all hover:shadow-md">
                                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-xl mb-4 relative overflow-hidden group">
                                        <span className="text-3xl font-black text-white">{user.name.charAt(0).toUpperCase()}</span>
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                            <span className="text-[10px] text-white font-bold uppercase">Trocar</span>
                                        </div>
                                    </div>
                                    <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{user.name}</h2>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-full text-[10px] uppercase font-black tracking-widest mt-2 border border-blue-100 dark:border-blue-500/20">
                                        <ShieldCheck size={12} />
                                        {user.role === 'OWNER' ? 'Administrador' : 'Membro'}
                                    </span>
                                </div>

                                {/* Informações da Assinatura */}
                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden transition-all hover:shadow-md">
                                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-800/20">
                                        <CreditCard size={18} className="text-slate-400" />
                                        <h3 className="font-black text-xs text-slate-700 dark:text-slate-300 uppercase tracking-widest">Plano Ativado</h3>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Assinatura</span>
                                            <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-lg flex items-center gap-1 uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                                                <CheckCircle2 size={10} />
                                                {user.account.plan === "FREE" ? "Gratuito" : "Profissional"}
                                            </span>
                                        </div>
                                        <button className="w-full h-11 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-500 text-white dark:text-white text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-slate-200 dark:shadow-blue-500/20">
                                            Fazer Upgrade
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Direita - Detalhes dos Dados */}
                            <div className="col-span-1 lg:col-span-2 space-y-6">
                                <form action={handleUpdateProfile} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden transition-all hover:shadow-md">
                                    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/10 flex items-center justify-between">
                                        <div>
                                            <h3 className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest text-sm">Informações Pessoais</h3>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase font-bold tracking-tight">Dados de segurança do seu perfil</p>
                                        </div>
                                        {!editingProfile ? (
                                            <button
                                                type="button"
                                                onClick={() => setEditingProfile(true)}
                                                className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                                            >
                                                Editar Perfil
                                            </button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingProfile(false)}
                                                    className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={isPending}
                                                    className="text-[10px] font-black text-white uppercase tracking-widest bg-blue-600 px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                                                >
                                                    <Save size={12} /> Salvar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                                    <User size={12} /> Nome Completo
                                                </label>
                                                <input
                                                    name="username"
                                                    defaultValue={user.name}
                                                    disabled={!editingProfile}
                                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 transition-all font-outfit"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                                    <Phone size={12} /> Telefone WhatsApp
                                                </label>
                                                <input
                                                    name="phone"
                                                    defaultValue={user.phone || ""}
                                                    disabled={!editingProfile}
                                                    placeholder="(00) 00000-0000"
                                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 transition-all font-outfit"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 pt-2">
                                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                                <Mail size={12} /> E-mail de Acesso (Login)
                                            </label>
                                            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-4 py-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 cursor-not-allowed">
                                                <p className="text-sm font-bold text-slate-400 dark:text-slate-500">{user.email}</p>
                                                <span className="text-[8px] bg-slate-200 dark:bg-slate-700 text-slate-500 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">Imutável</span>
                                            </div>
                                        </div>
                                    </div>
                                </form>

                                {/* Agência Settings */}
                                <form action={handleUpdateAccount} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden transition-all hover:shadow-md">
                                    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-indigo-50/20 dark:bg-indigo-900/10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center shadow-sm">
                                                <Building2 size={18} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest text-sm">Dados da Agência</h3>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 uppercase font-bold tracking-tight">Espaço de trabalho corporativo</p>
                                            </div>
                                        </div>
                                        {!editingAccount ? (
                                            <button
                                                type="button"
                                                onClick={() => setEditingAccount(true)}
                                                className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg hover:shadow-md transition-all active:scale-95"
                                            >
                                                Gerenciar
                                            </button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingAccount(false)}
                                                    className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={isPending}
                                                    className="text-[10px] font-black text-white uppercase tracking-widest bg-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
                                                >
                                                    <Save size={12} /> Salvar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Nome Fantasia / Empresa</label>
                                            <input
                                                name="name"
                                                defaultValue={user.account.name}
                                                disabled={!editingAccount}
                                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-base font-black text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60 transition-all font-outfit"
                                            />
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
