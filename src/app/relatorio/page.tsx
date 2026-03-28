import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { SOCIAL_THEME_CONFIG, POST_TYPE_CONFIG, SocialTheme, PostType } from "@/lib/types";
import { BarChart2, ArrowLeft, Leaf, Users, FileText, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

async function getReportData(accountId: string) {
  const [posts, clients] = await Promise.all([
    prisma.post.findMany({
      where: { accountId },
      select: { type: true, status: true, socialTheme: true, clientId: true, createdAt: true },
    }),
    prisma.client.findMany({
      where: { accountId },
      select: { id: true, name: true, brandColor: true, logoInitials: true },
    }),
  ]);

  const total = posts.length;
  const published = posts.filter(p => p.status === "publicado").length;
  const withTheme = posts.filter(p => p.socialTheme).length;
  const socialPct = total > 0 ? Math.round((withTheme / total) * 100) : 0;

  // Breakdown por tipo
  const byType: Record<string, number> = {};
  for (const p of posts) {
    byType[p.type] = (byType[p.type] ?? 0) + 1;
  }

  // Breakdown por tema social
  const byTheme: Record<string, number> = {};
  for (const p of posts) {
    if (p.socialTheme) {
      byTheme[p.socialTheme] = (byTheme[p.socialTheme] ?? 0) + 1;
    }
  }

  // Breakdown por cliente
  const byClient: Record<string, number> = {};
  for (const p of posts) {
    byClient[p.clientId] = (byClient[p.clientId] ?? 0) + 1;
  }

  return { total, published, withTheme, socialPct, byType, byTheme, byClient, clients };
}

export default async function RelatorioPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { authId: authUser.id },
    select: { accountId: true },
  });
  if (!dbUser?.accountId) redirect("/login");

  const { total, published, withTheme, socialPct, byType, byTheme, byClient, clients } =
    await getReportData(dbUser.accountId);

  const maxType = Math.max(...Object.values(byType), 1);
  const maxClient = Math.max(...Object.values(byClient), 1);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors font-medium"
          >
            <ArrowLeft size={14} />
            Voltar
          </Link>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-2">
            <BarChart2 size={18} className="text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-base font-bold text-slate-800 dark:text-white">Relatório de Impacto</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* ODS badge */}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 w-fit">
          <Leaf size={14} className="text-emerald-600 dark:text-emerald-400" />
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            Alinhado às ODS da ONU — ODS 8, 10 e 12
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard
            icon={FileText}
            label="Posts criados"
            value={total}
            color="blue"
          />
          <SummaryCard
            icon={TrendingUp}
            label="Publicados"
            value={published}
            sub={total > 0 ? `${Math.round((published / total) * 100)}% do total` : "—"}
            color="emerald"
          />
          <SummaryCard
            icon={Leaf}
            label="Com tema social"
            value={withTheme}
            sub={`${socialPct}% do total`}
            color="violet"
          />
          <SummaryCard
            icon={Users}
            label="Clientes ativos"
            value={clients.length}
            color="amber"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Breakdown por Tipo */}
          <Section title="Distribuição por Tipo de Conteúdo">
            {Object.keys(byType).length === 0 ? (
              <EmptyState message="Nenhum post criado ainda." />
            ) : (
              <div className="space-y-3">
                {Object.entries(byType)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => {
                    const cfg = POST_TYPE_CONFIG[type as PostType];
                    const pct = Math.round((count / maxType) * 100);
                    return (
                      <div key={type}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                            {cfg?.label ?? type}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-white">{count}</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-500 dark:bg-blue-400 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </Section>

          {/* Breakdown por Tema Social */}
          <Section title="Conteúdo com Impacto Social" badge="ODS 5 e 10">
            {Object.keys(byTheme).length === 0 ? (
              <EmptyState message="Nenhum post com tema social definido. Edite seus posts e adicione um Tema Social para rastrear o impacto." />
            ) : (
              <div className="space-y-3">
                {Object.entries(byTheme)
                  .sort(([, a], [, b]) => b - a)
                  .map(([theme, count]) => {
                    const cfg = SOCIAL_THEME_CONFIG[theme as SocialTheme];
                    const pct = withTheme > 0 ? Math.round((count / withTheme) * 100) : 0;
                    return (
                      <div key={theme}>
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${cfg?.bg ?? ""} ${cfg?.color ?? ""}`}>
                            {cfg?.label ?? theme}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-white">{count} post{count !== 1 ? "s" : ""} ({pct}%)</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
                  {socialPct}% da produção total tem temática social.
                </p>
              </div>
            )}
          </Section>
        </div>

        {/* Breakdown por Cliente */}
        <Section title="Volume por Cliente">
          {clients.length === 0 ? (
            <EmptyState message="Nenhum cliente cadastrado." />
          ) : (
            <div className="space-y-3">
              {clients
                .map(c => ({ ...c, count: byClient[c.id] ?? 0 }))
                .sort((a, b) => b.count - a.count)
                .map(client => {
                  const pct = maxClient > 0 ? Math.round((client.count / maxClient) * 100) : 0;
                  return (
                    <div key={client.id}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center text-white shrink-0"
                            style={{ backgroundColor: client.brandColor }}
                          >
                            {client.logoInitials.charAt(0)}
                          </span>
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate max-w-[180px]">
                            {client.name}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-white">{client.count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: client.brandColor }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </Section>

        {/* ODS explanation */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">Sobre este relatório</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Este relatório apoia o compromisso com os Objetivos de Desenvolvimento Sustentável (ODS) da ONU:
            <strong className="text-slate-700 dark:text-slate-300"> ODS 8</strong> (Trabalho Decente) ao profissionalizar a gestão de conteúdo para agências e MEIs,
            <strong className="text-slate-700 dark:text-slate-300"> ODS 10</strong> (Redução de Desigualdades) ao democratizar ferramentas profissionais para ONGs e pequenos criadores, e
            <strong className="text-slate-700 dark:text-slate-300"> ODS 12</strong> (Consumo Responsável) ao rastrear e otimizar a produção de conteúdo, evitando desperdício de recursos criativos.
          </p>
        </div>
      </main>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  sub?: string;
  color: "blue" | "emerald" | "violet" | "amber";
}) {
  const colors = {
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-500",
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
    violet: "bg-violet-500/10 border-violet-500/20 text-violet-500",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-500",
  };
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5">
      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon size={16} />
      </div>
      <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{label}</p>
      {sub && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function Section({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6">
      <div className="flex items-center gap-2 mb-5">
        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">{title}</h2>
        {badge && (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-4">{message}</p>
  );
}
