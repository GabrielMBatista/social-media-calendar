import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/agency/invitations/verify/[token]
 * Verifica se um convite é válido e retorna dados públicos para o Signup.
 */
export async function GET(
    req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;

        const invite = await prisma.invitation.findUnique({
            where: { token },
            include: {
                account: {
                    select: { name: true }
                }
            }
        });

        if (!invite) {
            return NextResponse.json({ success: false, error: "Convite não encontrado." }, { status: 404 });
        }

        if (invite.accepted) {
            return NextResponse.json({ success: false, error: "Este convite já foi utilizado." }, { status: 400 });
        }

        if (invite.expiresAt < new Date()) {
            return NextResponse.json({ success: false, error: "Este convite expirou." }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            data: {
                email: invite.email,
                accountName: invite.account.name,
                roleName: invite.roleName,
            }
        });
    } catch (error) {
        console.error("[INVITE_VERIFY]", error);
        return NextResponse.json({ success: false, error: "Erro ao verificar convite." }, { status: 500 });
    }
}
