import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    if (!user.isSuperAdmin) {
        return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    try {
        const accounts = await prisma.account.findMany({
            include: {
                _count: { select: { users: true, posts: true, clients: true } },
                users: { select: { id: true, name: true, email: true, role: true, isSuperAdmin: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ success: true, data: accounts }, { headers: { "Cache-Control": "no-store" } });
    } catch (err) {
        console.error("[admin/accounts GET]", err);
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}

const updateSchema = z.object({
    id: z.string(),
    plan: z.enum(["FREE", "PRO"]),
});

export async function PATCH(req: Request) {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    if (!user.isSuperAdmin) {
        return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { id, plan } = updateSchema.parse(body);

        const account = await prisma.account.update({
            where: { id },
            data: { plan: plan as any },
        });

        return NextResponse.json({ success: true, data: account }, { headers: { "Cache-Control": "no-store" } });
    } catch (err) {
        console.error("[admin/accounts PATCH]", err);
        return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
    }
}
