import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PostAPI } from "@/lib/api-contracts";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

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
    try {
        const resolvedParams = await params;
        const body = await req.json();
        const data = updateSchema.parse(body);

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "User not authenticated" } }, { status: 401 });
        }

        const dbUser = await prisma.user.findUnique({
            where: { authId: user.id },
            select: { accountId: true }
        });

        if (!dbUser) {
            return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "User not linked to any account" } }, { status: 403 });
        }

        // Verifica se pertence à conta
        const existing = await prisma.post.findUnique({ where: { id: resolvedParams.id } });
        if (!existing || existing.accountId !== dbUser.accountId) {
            return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Post not found" } }, { status: 404 });
        }

        // Se estiver mudando de cliente, valida se novo cliente pertence à conta
        if (data.clientId && data.clientId !== existing.clientId) {
            const client = await prisma.client.findUnique({ where: { id: data.clientId } });
            if (!client || client.accountId !== dbUser.accountId) {
                return NextResponse.json({ success: false, error: { code: "BAD_REQUEST", message: "Invalid client" } }, { status: 400 });
            }
        }

        const post = await prisma.post.update({
            where: { id: resolvedParams.id },
            data,
        });

        return NextResponse.json({
            success: true,
            data: post,
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
    try {
        const resolvedParams = await params;

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "User not authenticated" } }, { status: 401 });
        }

        const dbUser = await prisma.user.findUnique({
            where: { authId: user.id },
            select: { accountId: true }
        });

        if (!dbUser) {
            return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "User not linked to any account" } }, { status: 403 });
        }

        // Verifica se pertence à conta
        const existing = await prisma.post.findUnique({ where: { id: resolvedParams.id } });
        if (!existing || existing.accountId !== dbUser.accountId) {
            return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Post not found" } }, { status: 404 });
        }

        await prisma.post.delete({
            where: { id: resolvedParams.id },
        });

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
