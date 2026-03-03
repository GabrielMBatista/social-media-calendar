"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Users, Building2, BarChart3, TrendingUp, Shield,
    ChevronDown, Check, Loader2, Crown, AlertCircle
} from "lucide-react";
import { toast } from "sonner";

type Stats = {
    totalAccounts: number;
    totalUsers: number;
    freeAccounts: number;
    proAccounts: number;
    totalPosts: number;
};

type Account = {
    id: string;
    name: string;
    plan: "FREE" | "PRO";
    createdAt: string;
    _count: { users: number; posts: number; clients: number };
    users: { id: string; name: string; email: string; role: string }[];
};

export default function AdminPage() {
    const router = useRouter();
    const [stats, setStats] = useState<Stats | null>(null);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const [statsRes, accountsRes] = await Promise.all([
                    fetch("/api/admin/stats"),
                    fetch("/api/admin/accounts"),
                ]);

                if (statsRes.status === 403 || accountsRes.status === 403) {
                    setError("Acesso restrito a superadmins.");
                    setLoading(false);
                    return;
                }

                const statsData = await statsRes.json();
                const accountsData = await accountsRes.json();

                setStats(statsData.data);
                setAccounts(accountsData.data ?? []);
            } catch {
                setError("Erro ao carregar dados do painel.");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const handlePlanChange = async (accountId: string, newPlan: "FREE" | "PRO") => {
        setUpdatingId(accountId);
        try {
            const res = await fetch("/api/admin/accounts", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: accountId, plan: newPlan }),
            });
            const json = await res.json();
            if (json.success) {
                setAccounts(prev =>
                    prev.map(a => a.id === accountId ? { ...a, plan: newPlan } : a)
                );
                toast.success(`Plano atualizado para ${newPlan}`);
            } else {
                toast.error("Erro ao atualizar plano");
            }
        } catch {
            toast.error("Erro ao atualizar plano");
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={32} className="text-blue-400 animate-spin" />
                    <p className="text-slate-400 text-sm font-medium">Carregando painel...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center max-w-sm">
                    <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <AlertCircle size={24} className="text-red-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white mb-1">Acesso Negado</h2>
                        <p className="text-slate-400 text-sm">{error}</p>
                    </div>
                    <button
                        onClick={() => router.push("/")}
                        className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors"
                    >
                        Voltar ao Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Shield size={18} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-white leading-none">Painel Administrativo</h1>
                            <p className="text-xs text-slate-400 mt-0.5">Superadmin</p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push("/")}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                    >
                        ← Voltar ao App
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <StatCard icon={Building2} label="Contas" value={stats.totalAccounts} color="blue" />
                        <StatCard icon={Users} label="Usuários" value={stats.totalUsers} color="violet" />
                        <StatCard icon={BarChart3} label="Posts" value={stats.totalPosts} color="emerald" />
                        <StatCard icon={TrendingUp} label="Plano PRO" value={stats.proAccounts} color="amber" />
                        <StatCard icon={Shield} label="Plano FREE" value={stats.freeAccounts} color="slate" />
                    </div>
                )}

                {/* Accounts Table */}
                <div>
                    <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
                        Contas ({accounts.length})
                    </h2>
                    <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/50">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-900/80">
                                    <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Conta</th>
                                    <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Usuários</th>
                                    <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Clientes</th>
                                    <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Posts</th>
                                    <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Criada em</th>
                                    <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Plano</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accounts.map((account, i) => (
                                    <tr
                                        key={account.id}
                                        className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${i === accounts.length - 1 ? "border-0" : ""}`}
                                    >
                                        <td className="px-5 py-4">
                                            <div>
                                                <p className="font-semibold text-white">{account.name}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    {account.users[0]?.email ?? "—"}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-slate-300">{account._count.users}</td>
                                        <td className="px-5 py-4 text-slate-300">{account._count.clients}</td>
                                        <td className="px-5 py-4 text-slate-300">{account._count.posts}</td>
                                        <td className="px-5 py-4 text-slate-400 text-xs">
                                            {new Date(account.createdAt).toLocaleDateString("pt-BR")}
                                        </td>
                                        <td className="px-5 py-4">
                                            <PlanToggle
                                                accountId={account.id}
                                                plan={account.plan}
                                                loading={updatingId === account.id}
                                                onChange={handlePlanChange}
                                            />
                                        </td>
                                    </tr>
                                ))}
                                {accounts.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-12 text-center text-slate-500 text-sm">
                                            Nenhuma conta encontrada
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }: {
    icon: any; label: string; value: number; color: "blue" | "violet" | "emerald" | "amber" | "slate"
}) {
    const colors = {
        blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
        violet: "bg-violet-500/10 border-violet-500/20 text-violet-400",
        emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
        amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
        slate: "bg-slate-500/10 border-slate-500/20 text-slate-400",
    };
    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-3 ${colors[color]}`}>
                <Icon size={16} />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">{label}</p>
        </div>
    );
}

function PlanToggle({ accountId, plan, loading, onChange }: {
    accountId: string;
    plan: "FREE" | "PRO";
    loading: boolean;
    onChange: (id: string, plan: "FREE" | "PRO") => void;
}) {
    const isPro = plan === "PRO";

    return (
        <button
            onClick={() => onChange(accountId, isPro ? "FREE" : "PRO")}
            disabled={loading}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all disabled:opacity-50 ${isPro
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                }`}
        >
            {loading
                ? <Loader2 size={11} className="animate-spin" />
                : isPro ? <Crown size={11} /> : <Check size={11} />
            }
            {plan}
        </button>
    );
}
