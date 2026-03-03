import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

export async function GET() {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    if (!user.isSuperAdmin) {
        return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    try {
        const [totalAccounts, totalUsers, totalPosts] = await Promise.all([
            prisma.account.count(),
            prisma.user.count(),
            prisma.post.count(),
        ]);

        const [freeAccounts, proAccounts] = await Promise.all([
            prisma.account.count({ where: { plan: "FREE" as any } }),
            prisma.account.count({ where: { plan: "PRO" as any } }),
        ]);

        return NextResponse.json({
            success: true,
            data: { totalAccounts, totalUsers, freeAccounts, proAccounts, totalPosts },
        }, { headers: { "Cache-Control": "no-store" } });
    } catch (err) {
        console.error("[admin/stats]", err);
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}
