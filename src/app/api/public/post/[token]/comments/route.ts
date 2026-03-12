import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Essa rota é acessada pelo /p/[token]/page.tsx
const externalCommentSchema = z.object({
    content: z.string().min(1, "O comentário não pode estar vazio"),
    authorName: z.string().min(1, "O nome do autor é obrigatório na rota pública"),
    authorEmail: z.string().email("O e-mail do autor é obrigatório e deve ser válido"),
    action: z.enum(["COMMENT", "APPROVE"]).default("COMMENT"),
});

export async function GET(
    req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;

        // 1. Busca ShareLink validando se p/ ele os comentários estão ativos
        const link = await prisma.shareLink.findUnique({
            where: { token },
            include: { post: true }
        });

        if (!link) {
            return NextResponse.json({ success: false, error: "Link não encontrado" }, { status: 404 });
        }

        if (!link.allowComments) {
            return NextResponse.json({ success: false, error: "Comentários desativados" }, { status: 403 });
        }

        // 2. Traz SOMENTE os comentários da thread Cliente (isInternal: false)
        // O cliente NUNCA pode enxergar o bate-papo da Equipe
        const comments = await prisma.comment.findMany({
            where: {
                postId: link.postId,
                isInternal: false
            },
            orderBy: { createdAt: "asc" },
            include: {
                author: { select: { name: true } } // Caso a agência tenha respondido esse comentário externamente
            }
        });

        return NextResponse.json({ success: true, data: comments }, { headers: { "Cache-Control": "no-store", "Content-Type": "application/json" } });

    } catch (error) {
        console.error("[PUBLIC_COMMENT_GET_ERROR]", error);
        return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;
        const body = await req.json();
        const data = externalCommentSchema.parse(body);

        // 1. Validando o Link
        const link = await prisma.shareLink.findUnique({
            where: { token },
            include: {
                post: {
                    include: {
                        createdBy: true // P/ mandar a notificação pra quem fez o post
                    }
                }
            }
        });

        if (!link || !link.allowComments) {
            return NextResponse.json({ success: false, error: "Link inválido ou comentários bloqueados." }, { status: 404 });
        }

        // 2. Operação Atômica: Inserindo o Comentário como Público
        const comment = await prisma.comment.create({
            data: {
                postId: link.postId,
                content: data.content,
                isInternal: false, // Força as trava de segurança! Visitante nunca cria thread da Equipe.
                authorName: data.authorName,
                authorEmail: data.authorEmail,
            }
        });

        // 3. Se a ação foi de [Aprovação], muda o status do Post
        if (data.action === "APPROVE") {
            await prisma.post.update({
                where: { id: link.postId },
                data: { status: "pronto" }
            });
        }

        // 4. Cria a Notificação no Banco e Envia E-mail (Try/Catch Isolado p/ evitar que erro no push quebre o Post)
        if (link.post.createdById) {
            try {
                const notifType = data.action === "APPROVE" ? "POST_APPROVED" : "NEW_COMMENT";
                const notifTitle = data.action === "APPROVE" ? "Peça Aprovada 🎉" : "Novo Feedback Recebido";
                const truncateFeedback = data.content.length > 50 ? data.content.substring(0, 50) + "..." : data.content;
                const notifMsg = `**${data.authorName}** comentou no post *${link.post.title}*: ${truncateFeedback}`;

                await prisma.notification.create({
                    data: {
                        accountId: link.post.accountId,
                        userId: link.post.createdById, // Dono do Post
                        type: notifType,
                        title: notifTitle,
                        message: notifMsg,
                        linkUrl: `/dashboard/posts`, // Idealmente um link de trigger p/ abrir o modal
                    }
                });

                // 5. Integração com o Resend Email (Assíncrono sem await principal)
                if (link.post.createdBy?.notifyEmailClientComment) {
                    const agcEmail = link.post.createdBy.email;
                    const senderStr = process.env.RESEND_FROM_EMAIL;
                    if (senderStr) {
                        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

                        resend.emails.send({
                            from: senderStr,
                            to: [agcEmail],
                            subject: `[SM Calendar] ${notifTitle}`,
                            html: `
                              <div style="font-family: Arial, sans-serif; background: #fafafa; padding: 30px;">
                                   <div style="background: white; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px;">
                                        <h2 style="color: #333">${notifTitle}</h2>
                                        <p style="color: #555">Seu cliente <strong>${data.authorName}</strong> enviou a seguinte mensagem na peça <strong>${link.post.title}</strong>:</p>
                                        <blockquote style="font-style: italic; border-left: 4px solid #3b82f6; padding-left: 15px; background: #eef2ff; padding: 10px; margin: 20px 0;">
                                             ${data.content}
                                        </blockquote>
                                        <br/>
                                        <a href="${baseUrl}/dashboard" style="background:#3b82f6;color:white;text-decoration:none;padding:12px 20px;border-radius:4px;display:inline-block">Ver no Painel</a>
                                   </div>
                              </div>
                              `
                        }).catch((err) => console.error("Error sending user resend mail:", err));
                    }
                }
            } catch (notifError) {
                console.error("[PUBLIC_COMMENT_NOTIFICATION_ERROR]", notifError);
            }
        }

        return NextResponse.json({ success: true, data: comment }, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: "Dados inválidos", details: error.errors }, { status: 400 });
        }
        console.error("[PUBLIC_COMMENT_POST_ERROR]", error);
        return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
    }
}
