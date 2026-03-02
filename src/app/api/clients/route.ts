import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ClientAPI } from "@/lib/api-contracts";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-utils";

import { unstable_cache, revalidateTag } from "next/cache";

const createSchema = z.object({
    name: z.string().min(1),
    brandColor: z.string().min(4),
    brandColorSecondary: z.string().optional(),
    logoUrl: z.string().optional(),
    logoInitials: z.string().optional(),
    industry: z.string().optional(),
    instagramHandle: z.string().optional(),
});

export async function GET() {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    try {
        const getClients = unstable_cache(
            async (accountId: string) => {
                return await prisma.client.findMany({
                    where: { accountId },
                    orderBy: { createdAt: "asc" },
                });
            },
            [`clients-${user.accountId}`],
            { tags: ["clients", `clients-${user.accountId}`] }
        );

        const clients = await getClients(user.accountId);

        return NextResponse.json({
            success: true,
            data: clients as any,
        } satisfies ClientAPI.GetListResponse);
    } catch (error) {
        return NextResponse.json(
            { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch clients" } },
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

        const client = await prisma.client.create({
            data: {
                ...data,
                logoInitials: data.logoInitials || data.name.substring(0, 2).toUpperCase(),
                accountId: user.accountId,
            },
        });

        // Invalida o cache
        revalidateTag(`clients-${user.accountId}`);

        return NextResponse.json({
            success: true,
            data: client as any,
        } satisfies ClientAPI.CreateResponse);
    } catch (error) {
        return NextResponse.json(
            { success: false, error: { code: "BAD_REQUEST", message: "Invalid request data" } },
            { status: 400 }
        );
    }
}
