import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    // 1. Validar se o token existe e tem tamanho adequado
    const { token } = await params;
    if (!token || typeof token !== "string") {
        return NextResponse.json({ success: false, error: "Invalid token" }, { status: 400 });
    }

    try {
        // 2. Buscar o ShareLink e informações profundas relacionadas: Post, Client
        const link = await prisma.shareLink.findUnique({
            where: { token },
            include: {
                post: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        caption: true,
                        hashtags: true,
                        type: true,
                        status: true,
                        dayOfWeek: true,
                        scheduledDate: true,
                        scheduledTime: true,
                        driveLink: true,
                        createdAt: true,
                        updatedAt: true,
                        client: {
                            select: {
                                name: true,
                                brandColor: true,
                                logoUrl: true,
                                logoInitials: true,
                            }
                        }
                    }
                }
            }
        });

        // 3. Verificações de validade
        if (!link) {
            return NextResponse.json({ success: false, error: "Link not found or deactivated" }, { status: 404 });
        }

        if (link.expiresAt && new Date() > new Date(link.expiresAt)) {
            return NextResponse.json({ success: false, error: "Link expired" }, { status: 410 }); // 410 Gone
        }

        // Return da data de forma pública / limpa
        return NextResponse.json({
            success: true,
            data: {
                id: link.id,
                token: link.token,
                allowComments: link.allowComments,
                createdAt: link.createdAt,
                expiresAt: link.expiresAt,
                post: link.post
            }
        }, { headers: { "Cache-Control": "no-store" } });

    } catch (error) {
        console.error("Public share link error:", error);
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}
