import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth } from "@/lib/auth-utils";

export async function GET(req: Request) {
    try {
        const auth = await requireTenantAuth();
        if (auth.error) return auth.error;
        const { user } = auth;

        // Buscamos qual o estado salvo atualizado
        const data = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                emailNotifications: true,
                notifyEmailClientComment: true,
                notifyEmailInternalComment: true,
                notifyEmailStatusChange: true
            }
        });

        return NextResponse.json({
            success: true,
            preferences: {
                emailNotifications: data?.emailNotifications ?? true,
                notifyEmailClientComment: data?.notifyEmailClientComment ?? true,
                notifyEmailInternalComment: data?.notifyEmailInternalComment ?? true,
                notifyEmailStatusChange: data?.notifyEmailStatusChange ?? true
            }
        });
    } catch {
        return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const auth = await requireTenantAuth();
        if (auth.error) return auth.error;
        const { user } = auth;

        const body = await req.json();

        const dataToUpdate: any = {};
        if (typeof body.emailNotifications === 'boolean') dataToUpdate.emailNotifications = body.emailNotifications;
        if (typeof body.notifyEmailClientComment === 'boolean') dataToUpdate.notifyEmailClientComment = body.notifyEmailClientComment;
        if (typeof body.notifyEmailInternalComment === 'boolean') dataToUpdate.notifyEmailInternalComment = body.notifyEmailInternalComment;
        if (typeof body.notifyEmailStatusChange === 'boolean') dataToUpdate.notifyEmailStatusChange = body.notifyEmailStatusChange;

        await prisma.user.update({
            where: { id: user.id },
            data: dataToUpdate
        });

        return NextResponse.json({ success: true, message: "Preferências salvas com sucesso!" });

    } catch (error) {
        console.error("[PREFERENCES_PATCH_ERROR]", error);
        return NextResponse.json({ success: false, error: "Erro interno ao atualizar" }, { status: 500 });
    }
}
