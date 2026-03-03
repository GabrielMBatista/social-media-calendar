import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth, requirePro } from "@/lib/auth-utils";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createSchema = z.object({
    content: z.string().min(1),
    isInternal: z.boolean().default(true),
});

/**
 * GET /api/posts/[id]/comments
 * Lista comentários de um post (PRO)
 */
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireTenantAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    const pro = requirePro(user.account);
    if (pro.error) return pro.error;

    try {
        const { id } = await params;

        const post = await prisma.post.findUnique({ where: { id }, select: { accountId: true } });
        if (!post || post.accountId !== user.accountId) {
            return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
        }

        const comments = await prisma.comment.findMany({
            where: { postId: id },
            include: { author: { select: { name: true } } },
            orderBy: { createdAt: "asc" },
        });

        return NextResponse.json({ success: true, data: comments }, { headers: { "Cache-Control": "no-store" } });
    } catch {
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}

/**
 * POST /api/posts/[id]/comments
 * Cria um comentário em um post (PRO)
 */
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireTenantAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    const pro = requirePro(user.account);
    if (pro.error) return pro.error;

    try {
        const { id } = await params;
        const body = await req.json();
        const data = createSchema.parse(body);

        const post = await prisma.post.findUnique({ where: { id }, select: { accountId: true } });
        if (!post || post.accountId !== user.accountId) {
            return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
        }

        const comment = await prisma.comment.create({
            data: {
                postId: id,
                content: data.content,
                isInternal: data.isInternal,
                authorId: user.id,
            },
            include: { author: { select: { name: true } } },
        });

        return NextResponse.json({ success: true, data: comment }, { headers: { "Cache-Control": "no-store" } });
    } catch {
        return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
    }
}
