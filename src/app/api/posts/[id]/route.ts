import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PostAPI } from "@/lib/api-contracts";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-utils";
import { revalidateTag } from "next/cache";

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
});

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    try {
        const resolvedParams = await params;
        const body = await req.json();
        const data = updateSchema.parse(body);

        // Verifica se pertence à conta
        const existing = await prisma.post.findUnique({ where: { id: resolvedParams.id } });
        if (!existing || existing.accountId !== user.accountId) {
            return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Post not found" } }, { status: 404 });
        }

        // Se estiver mudando de cliente, valida se novo cliente pertence à conta
        if (data.clientId && data.clientId !== existing.clientId) {
            const client = await prisma.client.findUnique({ where: { id: data.clientId } });
            if (!client || client.accountId !== user.accountId) {
                return NextResponse.json({ success: false, error: { code: "BAD_REQUEST", message: "Invalid client" } }, { status: 400 });
            }
        }

        const post = await prisma.post.update({
            where: { id: resolvedParams.id },
            data: {
                ...data,
            },
        });

        revalidateTag(`posts`);
        revalidateTag(`posts-${user.accountId}`);

        return NextResponse.json({
            success: true,
            data: post as any,
        } satisfies PostAPI.UpdateResponse);
    } catch (error) {
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
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    try {
        const resolvedParams = await params;

        // Usa deleteMany com accountId para garantir segurança contra deleções de outros tenants
        // Isso evita o erro de 404 (Not Found) causado pelo findUnique() falhando em IDs recentes no cache
        const result = await prisma.post.deleteMany({
            where: {
                id: resolvedParams.id,
                accountId: user.accountId
            },
        });

        if (result.count === 0) {
            return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Post not found or already deleted" } }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: { deleted: true },
        } satisfies PostAPI.DeleteResponse);
    } catch (error) {
        return NextResponse.json(
            { success: false, error: { code: "SERVER_ERROR", message: "Failed to delete post" } },
            { status: 500 }
        );
    }
}
