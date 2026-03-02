import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ClientAPI } from "@/lib/api-contracts";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

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
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "User not authenticated" } }, { status: 401 });
        }

        const dbUser = await prisma.user.findUnique({
            where: { authId: user.id },
            select: { accountId: true }
        });

        if (!dbUser) {
            return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "User not linked to any account" } }, { status: 403 });
        }

        const clients = await prisma.client.findMany({
            where: {
                accountId: dbUser.accountId,
            },
            orderBy: { createdAt: "asc" },
        });

        return NextResponse.json({
            success: true,
            data: clients,
        } satisfies ClientAPI.GetListResponse);
    } catch (error) {
        return NextResponse.json(
            { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch clients" } },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const data = createSchema.parse(body);

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "User not authenticated" } }, { status: 401 });
        }

        const dbUser = await prisma.user.findUnique({
            where: { authId: user.id },
            select: { accountId: true }
        });

        if (!dbUser) {
            return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "User not linked to any account" } }, { status: 403 });
        }

        const client = await prisma.client.create({
            data: {
                ...data,
                logoInitials: data.logoInitials || data.name.substring(0, 2).toUpperCase(),
                accountId: dbUser.accountId,
            },
        });

        return NextResponse.json({
            success: true,
            data: client,
        } satisfies ClientAPI.CreateResponse);
    } catch (error) {
        return NextResponse.json(
            { success: false, error: { code: "BAD_REQUEST", message: "Invalid request data" } },
            { status: 400 }
        );
    }
}
