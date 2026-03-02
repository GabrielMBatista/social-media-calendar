import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PostAPI } from "@/lib/api-contracts";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

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

export async function GET(req: Request) {
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

        const { searchParams } = new URL(req.url);
        const clientId = searchParams.get("clientId");
        const status = searchParams.get("status");

        const whereClause: any = { accountId: dbUser.accountId };
        if (clientId) whereClause.clientId = clientId;
        if (status) whereClause.status = status;

        const posts = await prisma.post.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({
            success: true,
            data: posts,
        } satisfies PostAPI.GetListResponse);
    } catch (error) {
        return NextResponse.json(
            { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch posts" } },
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

        // Valida se cliente existe e pertence à conta
        const client = await prisma.client.findUnique({ where: { id: data.clientId } });
        if (!client || client.accountId !== dbUser.accountId) {
            return NextResponse.json({ success: false, error: { code: "BAD_REQUEST", message: "Invalid client" } }, { status: 400 });
        }

        const post = await prisma.post.create({
            data: {
                ...data,
                accountId: dbUser.accountId,
            },
        });

        return NextResponse.json({
            success: true,
            data: post,
        } satisfies PostAPI.CreateResponse);
    } catch (error) {
        return NextResponse.json(
            { success: false, error: { code: "BAD_REQUEST", message: "Invalid request data" } },
            { status: 400 }
        );
    }
}
