import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth, requirePro } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

/**
 * GET /api/posts/[id]/version
 * Retorna o snapshot anterior do post (se existir), deserializado do JSON
 */
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireTenantAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    try {
        const { id } = await params;

        const post = await prisma.post.findUnique({ where: { id }, select: { accountId: true } });
        if (!post || post.accountId !== user.accountId) {
            return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
        }

        const version = await prisma.postVersion.findUnique({
            where: { postId: id },
            include: { createdBy: { select: { name: true } } },
        });

        if (!version) {
            return NextResponse.json({ success: true, data: null }, { headers: { "Cache-Control": "no-store" } });
        }

        const data = {
            ...JSON.parse(version.snapshot),
            savedBy: version.createdBy,
            createdAt: version.createdAt,
        };

        return NextResponse.json({ success: true, data }, { headers: { "Cache-Control": "no-store" } });
    } catch {
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}

/**
 * POST /api/posts/[id]/version
 * Restaura o post para o snapshot anterior (swap atômico via transação).
 * Requer plano PRO.
 */
export async function POST(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireTenantAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    // Gate: apenas plano PRO pode restaurar versões
    const pro = requirePro(user.account);
    if (pro.error) return pro.error;

    try {
        const { id } = await params;

        const post = await prisma.post.findUnique({ where: { id } });
        if (!post || post.accountId !== user.accountId) {
            return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
        }

        const version = await prisma.postVersion.findUnique({ where: { postId: id } });
        if (!version) {
            return NextResponse.json({ success: false, error: "No version to restore" }, { status: 404 });
        }

        const previousState = JSON.parse(version.snapshot);

        // Snapshot do estado atual (para poder fazer undo do undo)
        const currentSnapshot = JSON.stringify({
            title: post.title,
            description: post.description,
            caption: post.caption,
            hashtags: post.hashtags,
            driveLink: post.driveLink,
            notes: post.notes,
            status: post.status,
            scheduledTime: post.scheduledTime,
            savedAt: new Date().toISOString(),
        });

        // Swap atômico: restaura post para o snapshot e salva estado atual como nova versão
        const [restored] = await prisma.$transaction([
            prisma.post.update({
                where: { id },
                data: {
                    title: previousState.title ?? post.title,
                    description: previousState.description,
                    caption: previousState.caption,
                    hashtags: previousState.hashtags,
                    driveLink: previousState.driveLink,
                    notes: previousState.notes,
                    status: previousState.status ?? post.status,
                    scheduledTime: previousState.scheduledTime,
                },
            }),
            prisma.postVersion.update({
                where: { postId: id },
                data: { snapshot: currentSnapshot, createdById: user.id },
            }),
        ]);

        return NextResponse.json({ success: true, data: restored as any }, { headers: { "Cache-Control": "no-store" } });
    } catch {
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}
