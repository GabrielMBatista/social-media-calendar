import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User, Mail, Phone, Building2, CreditCard, ChevronLeft, ShieldCheck, BarChart2, Leaf, Globe } from "lucide-react";
import { SOCIAL_THEME_CONFIG } from "@/lib/types";
import type { SocialTheme } from "@/lib/types";

export default async function MinhaContaPage() {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
        redirect("/login");
    }

    // Buscar dados estendidos no Prisma
    const user = await prisma.user.findFirst({
        where: { authId: authData.user.id },
        include: { account: true }
    });

    // Métricas de impacto
    const impactData = user?.accountId ? await (async () => {
        const posts = await prisma.post.findMany({
            where: { accountId: user.accountId! },
            select: { status: true, socialTheme: true },
        });
        const total = posts.length;
        const publicados = posts.filter(p => p.status === "publicado").length;
        const comTema = posts.filter(p => p.socialTheme).length;
        const pct = total > 0 ? Math.round((comTema / total) * 100) : 0;
        const topTema = Object.entries(
            posts.reduce((acc, p) => {
                if (p.socialTheme) acc[p.socialTheme] = (acc[p.socialTheme] ?? 0) + 1;
                return acc;
            }, {} as Record<string, number>)
        ).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null;
        return { total, publicados, comTema, pct, topTema };
    })() : null;

    if (!user) {
        // Fallback de segurança caso a transação de criação não tenha salvo no Prisma
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
                    <h1 className="text-xl font-bold text-slate-800 mb-2">Perfil Incompleto</h1>
                    <p className="text-slate-500 text-sm mb-6">Não localizamos a agência vinculada a este usuário no banco de dados.</p>
                    <Link href="/" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white dark:text-white rounded-lg text-sm font-semibold transition-colors">Voltar</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-10 lg:p-12 flex justify-center">
            <div className="w-full max-w-6xl mt-4 sm:mt-8">
                {/* Cabeçalho de Navegação */}
                <div className="flex items-center gap-3 mb-8">
                    <Link href="/" className="w-10 h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:shadow-sm transition-all">
                        <ChevronLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-outfit">Sua Conta</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie seu perfil e detalhes da assinatura</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Lateral Esquerda - Avatar e Ações Rápidas */}
                    <div className="col-span-1 space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-md mb-4">
                                <span className="text-3xl font-bold text-blue-700 dark:text-blue-400">{user.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{user.name}</h2>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-[10px] uppercase font-bold tracking-wider mt-2">
                                <ShieldCheck size={12} className="text-blue-500" />
                                {user.role === 'OWNER' ? 'Administrador' : 'Membro'}
                            </span>
                        </div>

                        {/* Informações da Assinatura (Account) */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                                <CreditCard size={18} className="text-slate-400" />
                                <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">Assinatura</h3>
                            </div>
                            <div className="p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Plano Atual</span>
                                    <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded flex items-center gap-1 border border-emerald-200 dark:border-emerald-500/20 uppercase tracking-wide">
                                        {user.account?.plan === "FREE" ? "Gratuito" : "Profissional"}
                                    </span>
                                </div>
                                <button className="w-full h-10 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 text-sm font-bold transition-colors">
                                    Fazer Upgrade
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Direita - Detalhes dos Dados */}
                    <div className="col-span-1 lg:col-span-3 space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="font-bold text-slate-800 dark:text-slate-100">Informações Pessoais</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Dados de contato do dono do perfil</p>
                            </div>
                            <div className="p-6 space-y-5">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                        <User size={18} className="text-slate-400" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome Completo</label>
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">{user.name}</p>
                                    </div>
                                    <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 p-2">Editar</button>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                        <Mail size={18} className="text-slate-400" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">E-mail</label>
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">{user.email}</p>
                                    </div>
                                    <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 p-2">Alterar</button>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                        <Phone size={18} className="text-slate-400" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Telefone</label>
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">{user.phone || "Não informado"}</p>
                                    </div>
                                    <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 p-2">Editar</button>
                                </div>
                            </div>
                        </div>

                        {/* Agência Settings */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                    <Building2 size={18} className="text-slate-600 dark:text-slate-300" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Dados da Agência</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Representação comercial do workspace</p>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome da Agência / Empresa</label>
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">{user.account?.name}</p>
                                    </div>
                                    <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md">Gerenciar Agência</button>
                                </div>
                            </div>
                        </div>

                        {/* Card de Impacto ODS */}
                        {impactData && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                                            <Leaf size={18} className="text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 dark:text-slate-100">Impacto de Conteúdo</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Alinhado às ODS da ONU</p>
                                        </div>
                                    </div>
                                    <Link
                                        href="/relatorio"
                                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
                                    >
                                        <BarChart2 size={13} />
                                        Ver relatório
                                    </Link>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-3 gap-4 mb-5">
                                        <div className="text-center">
                                            <p className="text-2xl font-black text-slate-800 dark:text-white">{impactData.total}</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">Posts criados</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{impactData.publicados}</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">Publicados</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{impactData.pct}%</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">Com tema social</p>
                                        </div>
                                    </div>

                                    {/* Barra de cobertura */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                                            <span>{impactData.comTema} posts com tema social</span>
                                            <span>{impactData.total - impactData.comTema} sem tema</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-emerald-500 transition-all"
                                                style={{ width: `${impactData.pct}%` }}
                                            />
                                        </div>
                                    </div>

                                    {impactData.topTema && SOCIAL_THEME_CONFIG[impactData.topTema as SocialTheme] && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] text-slate-400">Tema principal:</span>
                                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${SOCIAL_THEME_CONFIG[impactData.topTema as SocialTheme].bg} ${SOCIAL_THEME_CONFIG[impactData.topTema as SocialTheme].color}`}>
                                                {SOCIAL_THEME_CONFIG[impactData.topTema as SocialTheme].label}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
