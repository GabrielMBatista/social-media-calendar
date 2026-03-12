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
            select: { emailNotifications: true }
        });

        return NextResponse.json({ success: true, emailNotifications: data?.emailNotifications ?? true });
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

        // Fazemos cast pra Boolean puro 
        const val = typeof body.emailNotifications === 'boolean' ? body.emailNotifications : true;

        await prisma.user.update({
            where: { id: user.id },
            data: { emailNotifications: val }
        });

        return NextResponse.json({ success: true, message: "Preferências salvas com sucesso!" });

    } catch (error) {
        console.error("[PREFERENCES_PATCH_ERROR]", error);
        return NextResponse.json({ success: false, error: "Erro interno ao atualizar" }, { status: 500 });
    }
}
