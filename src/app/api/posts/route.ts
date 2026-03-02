import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PostAPI } from "@/lib/api-contracts";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-utils";

const createSchema = z.object({
    clientId: z.string(),
    title: z.string().min(1),
    description: z.string(),
    type: z.string(),
    status: z.string(),
    dayOfWeek: z.string(),
    scheduledDate: z.string().optional().nullable(),
    scheduledTime: z.string().optional().nullable(),
    driveLink: z.string().optional().nullable(),
    caption: z.string().optional().nullable(),
    hashtags: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
});

import { unstable_cache, revalidateTag } from "next/cache";

export async function GET(req: Request) {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    try {
        const { searchParams } = new URL(req.url);
        const clientId = searchParams.get("clientId");
        const status = searchParams.get("status");

        // Cache dinâmico baseado nos filtros
        const getPosts = unstable_cache(
            async (accountId: string, cId: string | null, st: string | null) => {
                const whereClause: any = { accountId };
                if (cId) whereClause.clientId = cId;
                if (st) whereClause.status = st;

                return await prisma.post.findMany({
                    where: whereClause,
                    orderBy: { createdAt: "desc" },
                });
            },
            [`posts-${user.accountId}-${clientId || 'all'}-${status || 'all'}`],
            { tags: ["posts", `posts-${user.accountId}`] }
        );

        const posts = await getPosts(user.accountId, clientId, status);

        return NextResponse.json({
            success: true,
            data: posts as any,
        } satisfies PostAPI.GetListResponse);
    } catch (error) {
        return NextResponse.json(
            { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch posts" } },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    try {
        const body = await req.json();
        const data = createSchema.parse(body);

        const client = await prisma.client.findUnique({ where: { id: data.clientId } });
        if (!client || client.accountId !== user.accountId) {
            return NextResponse.json({ success: false, error: { code: "BAD_REQUEST", message: "Invalid client" } }, { status: 400 });
        }

        const post = await prisma.post.create({
            data: {
                ...data,
                accountId: user.accountId,
            },
        });

        // Invalida o cache
        revalidateTag(`posts-${user.accountId}`);

        return NextResponse.json({
            success: true,
            data: post as any,
        } satisfies PostAPI.CreateResponse);
    } catch (error) {
        return NextResponse.json(
            { success: false, error: { code: "BAD_REQUEST", message: "Invalid request data" } },
            { status: 400 }
        );
    }
}
