import Link from "next/link";
import { ArrowLeft, Globe, Briefcase, TrendingUp, Users, Leaf, Zap, Heart, AlertTriangle, Code2 } from "lucide-react";

export const metadata = { title: "Sobre — Social Media Calendar Pro" };

const ODS_ITEMS = [
  {
    num: "8",
    color: "bg-red-500",
    title: "Trabalho Decente e Crescimento Econômico",
    desc: "Profissionaliza a gestão de conteúdo para agências, freelancers, MEIs e pequenas empresas — gerando renda e formalização digital no setor criativo.",
    icon: Briefcase,
  },
  {
    num: "9",
    color: "bg-orange-500",
    title: "Indústria, Inovação e Infraestrutura",
    desc: "Plataforma SaaS moderna com arquitetura multi-tenant, stack cloud-native e automação de fluxos de aprovação — infraestrutura digital acessível para qualquer tamanho de equipe.",
    icon: Zap,
  },
  {
    num: "10",
    color: "bg-pink-600",
    title: "Redução das Desigualdades",
    desc: "Plano gratuito democratiza o acesso a ferramentas profissionais para ONGs, MEIs e criadores independentes que não teriam acesso a softwares pagos equivalentes.",
    icon: Users,
  },
  {
    num: "12",
    color: "bg-amber-600",
    title: "Consumo e Produção Responsáveis",
    desc: "Rastreamento de tema social em cada post incentiva a produção de conteúdo com propósito. O relatório de impacto torna visível o compromisso da agência com causas sociais.",
    icon: Leaf,
  },
];

const FEATURES = [
  { label: "Calendário editorial semanal", desc: "Visualize toda a produção da semana por cliente, status e tipo de conteúdo." },
  { label: "Múltiplos clientes", desc: "Gerencie diferentes marcas no mesmo workspace com identidade visual separada." },
  { label: "Tema Social (ODS)", desc: "Classifique posts por impacto: educativo, diversidade, sustentabilidade e mais." },
  { label: "Fluxo de aprovação", desc: "Compartilhe posts com clientes via link público para aprovação sem login." },
  { label: "Relatório de Impacto", desc: "Veja o percentual do seu conteúdo alinhado a causas sociais e ODS." },
  { label: "Notificações em tempo real", desc: "Equipe e clientes recebem alertas de comentários e mudanças de status." },
];

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors font-medium"
          >
            <ArrowLeft size={14} />
            Voltar
          </Link>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-blue-600" />
            <h1 className="text-sm font-bold text-slate-800 dark:text-white">Sobre a Plataforma</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-16">

        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-blue-700 dark:text-blue-300">
            <Globe size={12} />
            Alinhado às ODS da ONU
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">
            Social Media Calendar Pro
          </h2>
          <p className="text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Uma plataforma SaaS para agências e criadores de conteúdo organizarem, aprovarem e
            rastrearem a produção de social media — com foco em eficiência, colaboração
            e impacto social mensurável.
          </p>
        </div>

        {/* Missão */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 p-8 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Heart size={18} className="text-red-400" />
            <span className="text-sm font-bold uppercase tracking-widest text-slate-300">Nossa Missão</span>
          </div>
          <p className="text-lg font-medium leading-relaxed text-slate-100">
            Democratizar o acesso a ferramentas profissionais de gestão de conteúdo,
            permitindo que pequenas agências, ONGs e criadores independentes produzam
            com a mesma qualidade de grandes estúdios — e com propósito social.
          </p>
        </div>

        {/* ODS */}
        <div>
          <div className="text-center mb-10">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
              Objetivos de Desenvolvimento Sustentável
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Como esta plataforma contribui para a Agenda 2030 da ONU
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {ODS_ITEMS.map(item => (
              <div
                key={item.num}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex gap-4"
              >
                <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <span className="text-white font-black text-sm">{item.num}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1.5">{item.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Funcionalidades */}
        <div>
          <div className="text-center mb-10">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Funcionalidades</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Tudo que você precisa em um só lugar</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(f => (
              <div key={f.label} className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
                <div className="w-2 h-2 rounded-full bg-blue-500 mb-3" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">{f.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tipos de conta */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={18} className="text-emerald-600" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Para quem é esta plataforma?</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { tipo: "Agência Comercial", desc: "Gerencie múltiplos clientes, equipes e aprovações com fluxo profissional.", cor: "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20" },
              { tipo: "ONG / Sem fins lucrativos", desc: "Acesse ferramentas profissionais gratuitamente para comunicar causas com impacto.", cor: "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20" },
              { tipo: "MEI / Freelancer", desc: "Organize sua produção de conteúdo e impressione clientes com fluxo de aprovação.", cor: "border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20" },
            ].map(t => (
              <div key={t.tipo} className={`rounded-xl p-4 border ${t.cor}`}>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1.5">{t.tipo}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Transparência e limitações */}
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/10 p-8 space-y-5">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Transparência sobre a plataforma</h3>
          </div>

          <div className="flex items-start gap-3">
            <Code2 size={15} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Projeto independente, mantido por uma pessoa</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Esta plataforma é desenvolvida e mantida integralmente por um único desenvolvedor —
                sem equipe, sem financiamento externo e sem apoio institucional.
                Isso significa que melhorias, correções e suporte dependem exclusivamente da disponibilidade pessoal do criador.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Leaf size={15} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Plano gratuito real — plano pago ainda não disponível</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Atualmente <strong className="text-slate-600 dark:text-slate-300">tudo é gratuito</strong> — não existe cobrança de nenhum tipo.
                A estrutura técnica para um plano pago já foi construída (controle de acesso, funcionalidades PRO),
                mas o plano pago <strong className="text-slate-600 dark:text-slate-300">não está disponível nem ativado</strong>.
                Enquanto isso, todos os usuários têm acesso completo à plataforma sem qualquer custo.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Algumas funcionalidades ainda não estão completas</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Certos botões e seções visíveis na interface podem não estar funcionais —
                seja porque a funcionalidade ainda está em desenvolvimento,
                seja porque foi originalmente planejada para o plano pago que ainda não existe.
                A plataforma está em evolução contínua e estas lacunas serão endereçadas gradualmente.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Possibilidade de indisponibilidade</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Por ser um projeto sem receita garantida, a plataforma pode enfrentar períodos de instabilidade
                ou indisponibilidade caso os custos de hospedagem ultrapassem a capacidade de manutenção.
                Não é recomendado para uso em produção crítica sem considerar esse risco.
              </p>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 italic pt-1">
            Esta transparência faz parte do compromisso com os valores da plataforma —
            honestidade e responsabilidade são também princípios das ODS.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center pb-4">
          <Link
            href="/relatorio"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Leaf size={15} />
            Ver Relatório de Impacto
          </Link>
          <p className="text-xs text-slate-400 mt-3">
            Acompanhe o impacto social da sua produção de conteúdo
          </p>
        </div>

      </main>
    </div>
  );
}
