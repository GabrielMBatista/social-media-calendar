import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth, requirePro } from "@/lib/auth-utils";
import { z } from "zod";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const dynamic = "force-dynamic";

const createSchema = z.object({
    content: z.string().min(1),
    isInternal: z.boolean().default(true),
});

/**
 * GET /api/posts/[id]/comments
 * Lista comentários de um post (PRO)
 */
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireTenantAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    const pro = requirePro(user.account);
    if (pro.error) return pro.error;

    try {
        const { id } = await params;

        const post = await prisma.post.findUnique({ where: { id }, select: { accountId: true } });
        if (!post || post.accountId !== user.accountId) {
            return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
        }

        const comments = await prisma.comment.findMany({
            where: { postId: id },
            include: {
                author: { select: { id: true, name: true, email: true, role: true } }
            },
            orderBy: { createdAt: "asc" },
        });

        return NextResponse.json({ success: true, data: comments }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}

/**
 * POST /api/posts/[id]/comments
 * Cria um comentário em um post (PRO)
 */
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireTenantAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    const pro = requirePro(user.account);
    if (pro.error) return pro.error;

    try {
        const { id } = await params;
        const body = await req.json();
        const data = createSchema.parse(body);

        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                createdBy: true,
                updatedBy: true
            }
        });

        if (!post || post.accountId !== user.accountId) {
            return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
        }

        const comment = await prisma.comment.create({
            data: {
                postId: id,
                content: data.content,
                isInternal: data.isInternal,
                authorId: user.id,
            },
            include: { author: { select: { id: true, name: true, email: true, role: true } } },
        });

        // Notificação Interna
        if (post.createdById && post.createdById !== user.id) {
            try {
                const truncateContent = data.content.length > 50 ? data.content.substring(0, 50) + "..." : data.content;
                const notifTitle = "Novo Comentário Interno";
                const notifMsg = `**${user.name}** comentou no chat de equipe: ${truncateContent}`;

                await prisma.notification.create({
                    data: {
                        accountId: user.accountId!,
                        userId: post.createdById,
                        type: "INTERNAL_COMMENT",
                        title: notifTitle,
                        message: notifMsg,
                        linkUrl: `/dashboard/posts`,
                    }
                });

                if (post.createdBy?.notifyEmailInternalComment) {
                    const senderStr = process.env.RESEND_FROM_EMAIL;
                    if (senderStr) {
                        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
                        resend.emails.send({
                            from: senderStr,
                            to: [post.createdBy.email],
                            subject: `[SM Calendar] ${notifTitle}`,
                            html: `
                              <div style="font-family: Arial, sans-serif; background: #fafafa; padding: 30px;">
                                   <div style="background: white; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px;">
                                        <h2 style="color: #333">${notifTitle}</h2>
                                        <p style="color: #555"><strong>${user.name}</strong> enviou uma mensagem na peça <strong>${post.title}</strong>:</p>
                                        <blockquote style="font-style: italic; border-left: 4px solid #6366f1; padding-left: 15px; background: #f5f3ff; padding: 10px; margin: 20px 0;">
                                             ${data.content}
                                        </blockquote>
                                        <br/>
                                        <a href="${baseUrl}/dashboard" style="background:#6366f1;color:white;text-decoration:none;padding:12px 20px;border-radius:4px;display:inline-block">Ver na Agência</a>
                                   </div>
                              </div>
                            `
                        }).catch(e => console.error("Error sending internal resend email", e));
                    }
                }
            } catch (err) {
                console.error("[INTERNAL_NOTIF_ERROR]", err);
            }
        }

        return NextResponse.json({ success: true, data: comment }, { headers: { "Cache-Control": "no-store", "Content-Type": "application/json" } });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
    }
}
