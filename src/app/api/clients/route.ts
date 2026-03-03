import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ClientAPI } from "@/lib/api-contracts";
import { z } from "zod";
import { requireTenantAuth } from "@/lib/auth-utils";

const createSchema = z.object({
    name: z.string().min(1),
    brandColor: z.string().min(4),
    brandColorSecondary: z.string().optional(),
    logoUrl: z.string().optional(),
    logoInitials: z.string().optional(),
    industry: z.string().optional(),
    instagramHandle: z.string().optional(),
});

export const dynamic = "force-dynamic";

export async function GET() {
    const auth = await requireTenantAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    try {
        const clients = await prisma.client.findMany({
            where: { accountId: user.accountId },
            orderBy: { createdAt: "asc" },
        });

        return NextResponse.json(
            { success: true, data: clients as any } satisfies ClientAPI.GetListResponse,
            { headers: { "Cache-Control": "no-store" } }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch clients" } },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    const auth = await requireTenantAuth();
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

        return NextResponse.json(
            { success: true, data: client as any } satisfies ClientAPI.CreateResponse,
            { headers: { "Cache-Control": "no-store" } }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, error: { code: "BAD_REQUEST", message: "Invalid request data" } },
            { status: 400 }
        );
    }
}
