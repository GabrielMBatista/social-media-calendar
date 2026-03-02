import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ClientAPI } from "@/lib/api-contracts";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const updateSchema = z.object({
    name: z.string().optional(),
    brandColor: z.string().optional(),
    brandColorSecondary: z.string().optional(),
    logoUrl: z.string().optional(),
    logoInitials: z.string().optional(),
    industry: z.string().optional(),
    instagramHandle: z.string().optional(),
    active: z.boolean().optional(),
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
        const existing = await prisma.client.findUnique({ where: { id: resolvedParams.id } });
        if (!existing || existing.accountId !== dbUser.accountId) {
            return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Client not found" } }, { status: 404 });
        }

        const client = await prisma.client.update({
            where: { id: resolvedParams.id },
            data,
        });

        return NextResponse.json({
            success: true,
            data: client,
        } satisfies ClientAPI.UpdateResponse);
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
        const existing = await prisma.client.findUnique({ where: { id: resolvedParams.id } });
        if (!existing || existing.accountId !== dbUser.accountId) {
            return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Client not found" } }, { status: 404 });
        }

        await prisma.client.delete({
            where: { id: resolvedParams.id },
        });

        return NextResponse.json({
            success: true,
            data: { deleted: true },
        } satisfies ClientAPI.DeleteResponse);
    } catch (error) {
        return NextResponse.json(
            { success: false, error: { code: "SERVER_ERROR", message: "Failed to delete client" } },
            { status: 500 }
        );
    }
}
