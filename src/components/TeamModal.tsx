"use client";

import { useState, useEffect } from "react";
import { X, Users, Mail, Shield, Trash2, Plus, Clock, CheckCircle2, AlertCircle, Briefcase, FolderPlus, ChevronRight } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Member = {
    id: string;
    name: string;
    email: string;
    role: "OWNER" | "ADMIN" | "MEMBER";
    createdAt: string;
};

type Invitation = {
    id: string;
    email: string;
    roleName: string | null;
    accepted: boolean;
    expiresAt: string;
    createdAt: string;
};

type Portfolio = {
    id: string;
    name: string;
    _count: {
        clients: number;
    };
};

export function TeamModal() {
    const { isTeamModalOpen, closeTeamModal } = useApp();
    const [members, setMembers] = useState<Member[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isInviting, setIsInviting] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [isCreatingPortfolio, setIsCreatingPortfolio] = useState(false);
    const [portfolioName, setPortfolioName] = useState("");
    const [activeTab, setActiveTab] = useState<"members" | "invites" | "portfolios">("members");

    useEffect(() => {
        if (isTeamModalOpen) {
            loadData();
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => { document.body.style.overflow = "unset"; };
    }, [isTeamModalOpen]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [mRes, iRes, pRes] = await Promise.all([
                fetch("/api/agency/members"),
                fetch("/api/agency/invitations"),
                fetch("/api/agency/portfolios")
            ]);
            const mData = await mRes.json();
            const iData = await iRes.json();
            const pData = await pRes.json();

            if (mData.success) setMembers(mData.data);
            if (iData.success) setInvitations(iData.data);
            if (pData.success) setPortfolios(pData.data);
        } catch (error) {
            toast.error("Erro ao carregar dados da agência");
        } finally {
            setIsLoading(false);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail) return;

        setIsInviting(true);
        try {
            const res = await fetch("/api/agency/invitations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: inviteEmail }),
            });
            const data = await res.json();

            if (data.success) {
                toast.success("Convite enviado com sucesso!");
                setInviteEmail("");
                loadData();
            } else {
                toast.error(data.error || "Erro ao enviar convite");
            }
        } catch (error) {
            toast.error("Erro na conexão");
        } finally {
            setIsInviting(false);
        }
    };

    const handleCreatePortfolio = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!portfolioName) return;

        setIsCreatingPortfolio(true);
        try {
            const res = await fetch("/api/agency/portfolios", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: portfolioName }),
            });
            const data = await res.json();

            if (data.success) {
                toast.success("Carteira criada com sucesso!");
                setPortfolioName("");
                loadData();
            } else {
                toast.error(data.error || "Erro ao criar carteira");
            }
        } catch (error) {
            toast.error("Erro na conexão");
        } finally {
            setIsCreatingPortfolio(false);
        }
    };

    if (!isTeamModalOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[110] bg-slate-900/40 dark:bg-black/60 backdrop-blur-md overflow-y-auto p-4 flex justify-center items-start animate-in fade-in duration-200"
            onClick={closeTeamModal}
        >
            <div
                className="w-full max-w-4xl mt-10 bg-white dark:bg-slate-950 rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden relative font-outfit mb-12"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600">
                            <Users size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Gestão da Agência</h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Controle de equipe, permissões e carteiras</p>
                        </div>
                    </div>
                    <button
                        onClick={closeTeamModal}
                        className="w-10 h-10 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex px-6 border-b border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveTab("members")}
                        className={cn(
                            "px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap",
                            activeTab === "members"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-slate-400 hover:text-slate-600"
                        )}
                    >
                        Membros ({members.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("portfolios")}
                        className={cn(
                            "px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap",
                            activeTab === "portfolios"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-slate-400 hover:text-slate-600"
                        )}
                    >
                        Carteiras ({portfolios.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("invites")}
                        className={cn(
                            "px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap",
                            activeTab === "invites"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-slate-400 hover:text-slate-600"
                        )}
                    >
                        Convites ({invitations.filter(i => !i.accepted).length})
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === "members" && (
                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl animate-pulse" />)}
                                </div>
                            ) : members.length === 0 ? (
                                <div className="text-center py-12 opacity-50 font-bold uppercase text-xs tracking-widest">Nenhum membro encontrado.</div>
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    {members.map(member => (
                                        <div key={member.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:shadow-md transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-black">
                                                    {member.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">{member.name}</h4>
                                                    <p className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5 uppercase tracking-tight">
                                                        <Mail size={10} /> {member.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                                                    member.role === 'OWNER' ? 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800/50' :
                                                        member.role === 'ADMIN' ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800/50' :
                                                            'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800/50 dark:border-slate-700'
                                                )}>
                                                    {member.role === 'OWNER' ? 'Dono' : member.role === 'ADMIN' ? 'Admin' : 'Membro'}
                                                </span>
                                                <button className="p-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "portfolios" && (
                        <div className="space-y-6">
                            {/* Create Portfolio Form */}
                            <form onSubmit={handleCreatePortfolio} className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                                <div className="flex flex-col md:flex-row gap-3">
                                    <div className="relative flex-1">
                                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Nome da Carteira (ex: Clientes Imobiliários)"
                                            value={portfolioName}
                                            onChange={(e) => setPortfolioName(e.target.value)}
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-12 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isCreatingPortfolio}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                                    >
                                        <FolderPlus size={16} />
                                        {isCreatingPortfolio ? "Criando..." : "Criar Carteira"}
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-3 font-bold uppercase tracking-tight text-center md:text-left">
                                    Carteiras permitem organizar clientes por grupos e gerenciar acessos em lote.
                                </p>
                            </form>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {isLoading ? (
                                    <div className="h-24 bg-slate-100 dark:bg-slate-900 rounded-2xl animate-pulse" />
                                ) : portfolios.length === 0 ? (
                                    <div className="col-span-2 text-center py-8 text-slate-400 text-xs font-bold uppercase tracking-widest">Nenhuma carteira criada.</div>
                                ) : (
                                    portfolios.map(portfolio => (
                                        <div key={portfolio.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-900/50 transition-all group flex flex-col justify-between">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600">
                                                    <Briefcase size={22} />
                                                </div>
                                                <button className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <div>
                                                <h4 className="text-base font-black text-slate-800 dark:text-slate-100 mb-1">{portfolio.name}</h4>
                                                <div className="flex items-center justify-between mt-4">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
                                                        {portfolio._count.clients} {portfolio._count.clients === 1 ? 'Cliente' : 'Clientes'}
                                                    </span>
                                                    <button className="flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                                                        Ver Clientes <ChevronRight size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "invites" && (
                        <div className="space-y-6">
                            {/* Invite Form */}
                            <form onSubmit={handleInvite} className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                                <div className="flex flex-col md:flex-row gap-3">
                                    <div className="relative flex-1">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="email"
                                            placeholder="E-mail do novo membro"
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-12 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isInviting}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                                    >
                                        <Plus size={16} />
                                        {isInviting ? "Enviando..." : "Convidar"}
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-3 font-bold uppercase tracking-tight text-center md:text-left">
                                    O convidado receberá um e-mail para participar da sua agência.
                                </p>
                            </form>

                            {/* Invites List */}
                            <div className="space-y-3">
                                {isLoading ? (
                                    <div className="h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl animate-pulse" />
                                ) : invitations.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 text-xs font-bold uppercase tracking-widest">Nenhum convite pendente.</div>
                                ) : (
                                    invitations.map(invite => (
                                        <div key={invite.id} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 font-black">
                                                    <Clock size={18} />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">{invite.email}</h4>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                                        Válido até {new Date(invite.expiresAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {invite.accepted ? (
                                                    <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                                        <CheckCircle2 size={12} /> Aceito
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-[10px] font-black text-amber-600 uppercase tracking-widest">
                                                        <Clock size={12} /> Pendente
                                                    </span>
                                                )}
                                                <button className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest px-2 py-1 transition-colors">
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer / Plan Notice */}
                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-500">
                        <Shield size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Plano Agência Ativo</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-amber-600">
                            <AlertCircle size={14} />
                            <span className="text-[10px] font-black uppercase tracking-tight">Permissões de Carteira em Breve</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
