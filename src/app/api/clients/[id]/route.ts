import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ClientAPI } from "@/lib/api-contracts";
import { z } from "zod";
import { requireTenantAuth } from "@/lib/auth-utils";

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
    const auth = await requireTenantAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    try {
        const resolvedParams = await params;
        const body = await req.json();
        const data = updateSchema.parse(body);

        // Verifica se pertence à conta
        const existing = await prisma.client.findUnique({ where: { id: resolvedParams.id } });
        if (!existing || existing.accountId !== user.accountId) {
            return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Client not found" } }, { status: 404 });
        }

        const client = await prisma.client.update({
            where: { id: resolvedParams.id },
            data,
        });

        return NextResponse.json({
            success: true,
            data: client as any,
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
    const auth = await requireTenantAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    try {
        const resolvedParams = await params;

        // Verifica se pertence à conta
        const existing = await prisma.client.findUnique({ where: { id: resolvedParams.id } });
        if (!existing || existing.accountId !== user.accountId) {
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
