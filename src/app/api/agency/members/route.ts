import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth, requireAgency } from "@/lib/auth-utils";

/**
 * GET /api/agency/members
 * Lista todos os membros da agência (OWNER, ADMIN, MEMBER).
 */
export async function GET() {
    const auth = await requireTenantAuth();
    if (auth.error) return auth.error;
    const { user: currentUser } = auth;

    const agency = requireAgency(currentUser.account);
    if (agency.error) return agency.error;

    try {
        const members = await prisma.user.findMany({
            where: { accountId: currentUser.accountId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
            orderBy: { name: "asc" }
        });

        return NextResponse.json({ success: true, data: members });
    } catch (error) {
        console.error("[AGENCY_MEMBERS_GET]", error);
        return NextResponse.json({ success: false, error: "Erro ao listar membros" }, { status: 500 });
    }
}

/**
 * PATCH /api/agency/members/[id]
 * Altera o SystemRole ou remove um membro (Implementar quando necessário)
 */
