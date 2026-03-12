import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth, requireAgency } from "@/lib/auth-utils";
import { z } from "zod";

const portfolioSchema = z.object({
    name: z.string().min(1),
});

/**
 * GET /api/agency/portfolios
 * Lista todas as carteiras (portfolios) da agência.
 */
export async function GET() {
    const auth = await requireTenantAuth();
    if (auth.error) return auth.error;
    const { user: currentUser } = auth;

    const agency = requireAgency(currentUser.account);
    if (agency.error) return agency.error;

    try {
        const portfolios = await prisma.portfolio.findMany({
            where: { accountId: currentUser.accountId },
            include: {
                _count: {
                    select: { clients: true }
                }
            },
            orderBy: { name: "asc" }
        });

        return NextResponse.json({ success: true, data: portfolios });
    } catch (error) {
        console.error("[AGENCY_PORTFOLIOS_GET]", error);
        return NextResponse.json({ success: false, error: "Erro ao listar carteiras" }, { status: 500 });
    }
}

/**
 * POST /api/agency/portfolios
 * Cria uma nova carteira de clientes.
 */
export async function POST(req: Request) {
    const auth = await requireTenantAuth();
    if (auth.error) return auth.error;
    const { user: currentUser } = auth;

    const agency = requireAgency(currentUser.account);
    if (agency.error) return agency.error;

    try {
        const body = await req.json();
        const { name } = portfolioSchema.parse(body);

        const portfolio = await prisma.portfolio.create({
            data: {
                accountId: currentUser.accountId,
                name,
            }
        });

        return NextResponse.json({ success: true, data: portfolio });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: "Nome da carteira é obrigatório" }, { status: 400 });
        }
        console.error("[AGENCY_PORTFOLIOS_POST]", error);
        return NextResponse.json({ success: false, error: "Erro ao criar carteira" }, { status: 500 });
    }
}
