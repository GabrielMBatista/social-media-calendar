import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cache } from "react";

type PrismaUser = Awaited<ReturnType<typeof prisma.user.findUnique>> & {};

/**
 * Autenticação base — permite superadmins (sem accountId) e usuários com conta.
 * Use nas rotas /admin. Para rotas de tenant, prefira requireTenantAuth.
 */
export const requireAuth = cache(async () => {
    const supabase = await createClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
        return { error: NextResponse.json({ error: "Não autorizado" }, { status: 401 }) };
    }

    const user = await prisma.user.findUnique({
        where: { authId: authUser.id },
        include: { account: true }
    });

    if (!user) {
        return { error: NextResponse.json({ error: "Perfil de usuário não encontrado" }, { status: 404 }) };
    }

    // Usuários sem conta e sem isSuperAdmin são bloqueados
    if (!user.accountId && !user.isSuperAdmin) {
        return { error: NextResponse.json({ error: "Conta não vinculada" }, { status: 403 }) };
    }

    return { user };
});

/**
 * Autenticação para rotas de tenant — garante que user.accountId é string (não null).
 * Superadmins sem accountId são bloqueados (não devem acessar dados de tenants via essa rota).
 */
export const requireTenantAuth = cache(async () => {
    const supabase = await createClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
        return { error: NextResponse.json({ error: "Não autorizado" }, { status: 401 }) };
    }

    const user = await prisma.user.findUnique({
        where: { authId: authUser.id },
        include: { account: true }
    });

    if (!user) {
        return { error: NextResponse.json({ error: "Perfil de usuário não encontrado" }, { status: 404 }) };
    }

    if (!user.accountId) {
        return { error: NextResponse.json({ error: "Acesso negado: sem conta vinculada" }, { status: 403 }) };
    }

    // Type narrowing: accountId é garantidamente string a partir daqui
    return { user: { ...user, accountId: user.accountId } };
});

/**
 * Paywall — verifica se o account é PRO.
 * Deve ser chamado APÓS requireTenantAuth.
 * Retorna { error } se FREE, ou { account } se PRO.
 */
export function requirePro(account: { plan: string } | null | undefined) {
    if (!account || account.plan !== "PRO") {
        return {
            error: NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "PLAN_REQUIRED",
                        message: "Este recurso está disponível apenas no plano Profissional.",
                    },
                },
                { status: 403 }
            ),
        };
    }
    return { error: null };
}

