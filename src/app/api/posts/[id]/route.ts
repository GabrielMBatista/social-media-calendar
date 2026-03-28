import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PostAPI } from "@/lib/api-contracts";
import { z } from "zod";
import { requireTenantAuth } from "@/lib/auth-utils";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const updateSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    type: z.string().optional(),
    status: z.string().optional(),
    dayOfWeek: z.string().optional(),
    scheduledDate: z.string().optional().nullable(),
    scheduledTime: z.string().optional().nullable(),
    driveLink: z.string().optional().nullable(),
    caption: z.string().optional().nullable(),
    hashtags: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    clientId: z.string().optional(),
    socialTheme: z.string().optional().nullable(),
});

export const dynamic = "force-dynamic";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireTenantAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    try {
        const resolvedParams = await params;
        const body = await req.json();
        const data = updateSchema.parse(body);

        // Verifica se pertence à conta e traz o criador p/ notificar
        const existing = await prisma.post.findUnique({
            where: { id: resolvedParams.id },
            include: { createdBy: true }
        });

        if (!existing || existing.accountId !== user.accountId) {
            return NextResponse.json(
                { success: false, error: { code: "NOT_FOUND", message: "Post not found" } },
                { status: 404 }
            );
        }

        // Se estiver mudando de cliente, valida se novo cliente pertence à conta
        if (data.clientId && data.clientId !== existing.clientId) {
            const client = await prisma.client.findUnique({ where: { id: data.clientId } });
            if (!client || client.accountId !== user.accountId) {
                return NextResponse.json(
                    { success: false, error: { code: "BAD_REQUEST", message: "Invalid client" } },
                    { status: 400 }
                );
            }
        }

        // Salva snapshot do estado ATUAL como JSON antes de editar (upsert — 1 versão por post)
        const snapshot = JSON.stringify({
            title: existing.title,
            description: existing.description,
            caption: existing.caption,
            hashtags: existing.hashtags,
            driveLink: existing.driveLink,
            notes: existing.notes,
            status: existing.status,
            scheduledTime: existing.scheduledTime,
            savedAt: new Date().toISOString(),
        });

        await prisma.postVersion.upsert({
            where: { postId: existing.id },
            create: { postId: existing.id, createdById: user.id, snapshot },
            update: { createdById: user.id, snapshot },
        });

        const post = await prisma.post.update({
            where: { id: resolvedParams.id },
            data: { ...data },
        });

        // Lógica de Notificação de Status
        if (data.status && data.status !== existing.status && existing.createdById) {
            const statusLabels: Record<string, string> = {
                rascunho: "Rascunho",
                em_producao: "Em Produção",
                pronto: "Pronto / Aprovado",
                publicado: "Publicado",
                cancelado: "Cancelado"
            };

            const newStatusLabel = statusLabels[data.status] || data.status;

            try {
                const notifTitle = "Status do Post Alterado";
                const notifMsg = `O post **${post.title}** foi movido para **${newStatusLabel}** por ${user.name}.`;

                await prisma.notification.create({
                    data: {
                        accountId: user.accountId!,
                        userId: existing.createdById,
                        type: "STATUS_CHANGE",
                        title: notifTitle,
                        message: notifMsg,
                        linkUrl: `/dashboard/posts`,
                    }
                });

                if (existing.createdBy && existing.createdBy.notifyEmailStatusChange && existing.createdById !== user.id) {
                    const senderStr = process.env.RESEND_FROM_EMAIL;
                    if (senderStr) {
                        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
                        resend.emails.send({
                            from: senderStr,
                            to: [existing.createdBy.email],
                            subject: `[SM Calendar] ${notifTitle}`,
                            html: `
                               <div style="font-family: Arial, sans-serif; background: #fafafa; padding: 30px;">
                                    <div style="background: white; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px;">
                                         <h2 style="color: #333">${notifTitle}</h2>
                                         <p style="color: #555">O post <strong>${post.title}</strong> teve o status atualizado:</p>
                                         <div style="margin: 20px 0; padding: 15px; background: #f8fafc; border-radius: 6px; border-left: 4px solid #3b82f6;">
                                              <span style="color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: bold;">Novo Status</span><br/>
                                              <strong style="font-size: 18px; color: #1e293b;">${newStatusLabel}</strong>
                                         </div>
                                         <p style="color: #64748b; font-size: 13px;">Alterado por: ${user.name}</p>
                                         <br/>
                                         <a href="${baseUrl}/dashboard" style="background:#3b82f6;color:white;text-decoration:none;padding:12px 20px;border-radius:4px;display:inline-block">Ver no Painel</a>
                                    </div>
                               </div>
                             `
                        }).catch(e => console.error("Error sending status resend email", e));
                    }
                }
            } catch (err) {
                console.error("[STATUS_NOTIF_ERROR]", err);
            }
        }

        return NextResponse.json(
            { success: true, data: post as any } satisfies PostAPI.UpdateResponse,
            { headers: { "Cache-Control": "no-store" } }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { success: false, error: { code: "BAD_REQUEST", message: "Invalid request data" } },
            { status: 400 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireTenantAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    try {
        const resolvedParams = await params;

        const result = await prisma.post.deleteMany({
            where: {
                id: resolvedParams.id,
                accountId: user.accountId,
            },
        });

        if (result.count === 0) {
            return NextResponse.json(
                { success: false, error: { code: "NOT_FOUND", message: "Post not found or already deleted" } },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, data: { deleted: true } } satisfies PostAPI.DeleteResponse,
            { headers: { "Cache-Control": "no-store" } }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, error: { code: "SERVER_ERROR", message: "Failed to delete post" } },
            { status: 500 }
        );
    }
}
