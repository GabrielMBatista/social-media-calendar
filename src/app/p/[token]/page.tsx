import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { STATUS_CONFIG, POST_TYPE_CONFIG, DAYS_OF_WEEK } from "@/lib/types";
import {
    Calendar, Clock, ExternalLink, Hash, Link2,
    Image, Play, LayoutGrid, Music, Youtube, Linkedin, Twitter
} from "lucide-react";

// Forçamos dinâmico para garantir validação do token e expiração a cada acesso
export const dynamic = "force-dynamic";

const ICON_MAP: Record<string, React.ElementType> = {
    Image, Play, Clock, LayoutGrid, Music, Youtube, Linkedin, Twitter,
};

async function getShareLinkData(token: string) {
    const link = await prisma.shareLink.findUnique({
        where: { token },
        include: {
            post: {
                include: {
                    client: true,
                }
            }
        }
    });

    if (!link) return null;
    if (link.expiresAt && new Date() > new Date(link.expiresAt)) return null;

    return link;
}

export async function generateMetadata(
    { params }: { params: Promise<{ token: string }> }
): Promise<Metadata> {
    const resolvedParams = await params;
    const link = await getShareLinkData(resolvedParams.token);

    if (!link) return { title: "Post não encontrado" };

    return {
        title: `${link.post.title} | ${link.post.client.name}`,
        description: link.post.description || "Visualização de publicação",
    };
}

export default async function PublicPostPage(
    { params }: { params: Promise<{ token: string }> }
) {
    const resolvedParams = await params;
    const link = await getShareLinkData(resolvedParams.token);

    if (!link) {
        notFound();
    }

    const { post } = link;
    const { client } = post;

    const statusCfg = STATUS_CONFIG[post.status as keyof typeof STATUS_CONFIG];
    const typeCfg = POST_TYPE_CONFIG[post.type as keyof typeof POST_TYPE_CONFIG];
    const TypeIcon = ICON_MAP[typeCfg?.icon] || Image;
    const dayLabel = DAYS_OF_WEEK.find(d => d.key === post.dayOfWeek)?.label || post.dayOfWeek;

    const brandColor = client.brandColor || "#3b82f6"; // fallbacks azuis

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center">
            {/* Whitelabel Header */}
            <div
                className="w-full flex justify-center py-6 px-4 shadow-sm relative overflow-hidden"
                style={{ backgroundColor: brandColor }}
            >
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                <div className="max-w-2xl w-full flex items-center gap-4 relative z-10">
                    <div
                        className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center font-bold text-lg overflow-hidden flex-shrink-0"
                        style={{ color: brandColor }}
                    >
                        {client.logoUrl ? (
                            <img src={client.logoUrl} alt={client.name} className="w-full h-full object-cover" />
                        ) : (
                            client.logoInitials
                        )}
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-xl drop-shadow-sm">{client.name}</h1>
                        <p className="text-white/80 text-sm">Aprovação de Conteúdo</p>
                    </div>
                </div>
            </div>

            {/* Main Content Card */}
            <main className="w-full max-w-2xl px-4 py-8 flex-1">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">

                    {/* Post Title & Meta */}
                    <div className="p-6 border-b border-slate-100 flex flex-col gap-4">
                        <h2 className="text-2xl font-bold text-slate-800">{post.title}</h2>

                        <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${statusCfg?.bg} ${statusCfg?.color} ${statusCfg?.ring || "border-transparent"}`}>
                                <span className={`w-2 h-2 rounded-full ${statusCfg?.dot || "bg-slate-400"}`}></span>
                                {statusCfg?.label || post.status}
                            </span>

                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
                                <TypeIcon size={14} className={typeCfg?.color} />
                                {typeCfg?.label || post.type}
                            </span>

                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
                                <Calendar size={13} />
                                {dayLabel} {post.scheduledTime && `às ${post.scheduledTime}`}
                            </span>
                        </div>
                    </div>

                    {/* Details Body */}
                    <div className="p-6 space-y-6">

                        {/* Drive Link Spotlight */}
                        {post.driveLink && (
                            <div>
                                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Anexo / Mídia</h3>
                                <a
                                    href={post.driveLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-4 rounded-xl transition-all hover:-translate-y-0.5"
                                    style={{
                                        backgroundColor: `${brandColor}10`,
                                        border: `1px solid ${brandColor}30`,
                                        color: brandColor
                                    }}
                                >
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: brandColor }}>
                                        <Link2 size={20} className="text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate">Acessar Pasta de Mídia</p>
                                        <p className="text-xs opacity-80 truncate">{post.driveLink}</p>
                                    </div>
                                    <ExternalLink size={18} />
                                </a>
                            </div>
                        )}

                        {/* Description */}
                        {post.description && (
                            <div>
                                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Briefing da Arte</h3>
                                <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 border border-slate-100">
                                    {post.description}
                                </div>
                            </div>
                        )}

                        {/* Caption (Legenda) */}
                        {post.caption && (
                            <div>
                                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Legenda</h3>
                                <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 border border-slate-100 whitespace-pre-wrap">
                                    {post.caption}
                                </div>
                            </div>
                        )}

                        {/* Hashtags */}
                        {post.hashtags && (
                            <div>
                                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                                    <Hash size={14} /> Hashtags
                                </h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {post.hashtags.split(" ").filter(Boolean).map((tag, i) => (
                                        <span
                                            key={i}
                                            className="px-2.5 py-1 rounded-md text-sm font-medium"
                                            style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Footer Area For Future Comments (If allowed) */}
                    {link.allowComments && (
                        <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
                            <p className="text-sm text-slate-500 font-medium">✨ Área de comentários será disponibilizada em breve.</p>
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center pb-8 border-t border-slate-200 pt-6">
                    <p className="text-xs font-medium text-slate-400">Powered by Social Media Calendar Studio</p>
                </div>
            </main>
        </div>
    );
}
