import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth, requirePro } from "@/lib/auth-utils";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createSchema = z.object({
    postId: z.string(),
    expiresAt: z.string().optional().nullable(),
    allowComments: z.boolean().default(false),
});

/**
 * GET /api/share-links
 * Lista share links do account (PRO)
 */
export async function GET() {
    const auth = await requireTenantAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    const pro = requirePro(user.account);
    if (pro.error) return pro.error;

    try {
        const links = await prisma.shareLink.findMany({
            where: { post: { accountId: user.accountId } },
            include: { post: { select: { title: true, clientId: true } } },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ success: true, data: links }, { headers: { "Cache-Control": "no-store" } });
    } catch {
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}

/**
 * POST /api/share-links
 * Cria um share link para um post (PRO)
 */
export async function POST(req: Request) {
    const auth = await requireTenantAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    const pro = requirePro(user.account);
    if (pro.error) return pro.error;

    try {
        const body = await req.json();
        const data = createSchema.parse(body);

        // Verifica que o post pertence à conta
        const post = await prisma.post.findUnique({ where: { id: data.postId } });
        if (!post || post.accountId !== user.accountId) {
            return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
        }

        const link = await prisma.shareLink.create({
            data: {
                postId: data.postId,
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
                allowComments: data.allowComments,
            },
        });

        return NextResponse.json({ success: true, data: link }, { headers: { "Cache-Control": "no-store" } });
    } catch {
        return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
    }
}
