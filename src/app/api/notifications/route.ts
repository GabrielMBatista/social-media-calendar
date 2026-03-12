import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth } from "@/lib/auth-utils";

export async function GET(req: Request) {
    try {
        const auth = await requireTenantAuth();
        if (auth.error) return auth.error;
        const { user } = auth;

        // Busca apenas as últimas 30 notificações da conta
        const notifications = await prisma.notification.findMany({
            where: {
                accountId: user.accountId,
                userId: user.id,
            },
            orderBy: { createdAt: "desc" },
            take: 30,
        });

        return NextResponse.json({ success: true, data: notifications });
    } catch (error) {
        console.error("[NOTIFICATIONS_GET_ERROR]", error);
        return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
    }
}

// Rota PATCH genérica na base da listagem, usada para "Marcar como Lida" (isread = true)
export async function PATCH(req: Request) {
    try {
        const auth = await requireTenantAuth();
        if (auth.error) return auth.error;
        const { user } = auth;

        const body = await req.json();
        const { id } = body;

        if (!id) return NextResponse.json({ success: false, error: "ID não fornecido" }, { status: 400 });

        const updated = await prisma.notification.updateMany({
            where: {
                id,
                userId: user.id // Trava forte garantindo que o chamador é o próprio dono da notificação
            },
            data: {
                read: true
            }
        });

        return NextResponse.json({ success: true, updated: updated.count > 0 });

    } catch (error) {
        console.error("[NOTIFICATIONS_PATCH_ERROR]", error);
        return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
    }
}
