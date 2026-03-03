import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cache } from "react";

/**
 * Utilitário para exigir autenticação e retornar o usuário do banco (Prisma)
 * Centraliza a lógica de buscar sessão -> buscar perfil -> validar existência
 * 
 * Envolvido em react cache para evitar múltiplas consultas idênticas no mesmo ciclo de renderização.
 */
export const requireAuth = cache(async () => {
    const supabase = await createClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    // 1. Verificar se há sessão válida no Supabase
    if (authError || !authUser) {
        return { error: NextResponse.json({ error: "Não autorizado" }, { status: 401 }) };
    }

    // 2. Buscar o usuário correspondente no Prisma para pegar o accountId
    const user = await prisma.user.findUnique({
        where: { authId: authUser.id },
        include: { account: true }
    });

    if (!user) {
        return { error: NextResponse.json({ error: "Perfil de usuário não encontrado" }, { status: 404 }) };
    }

    // 3. Superadmins não têm accountId — podem acessar qualquer rota admin
    //    Usuários comuns DEVEM ter accountId para acessar as APIs de tenant
    if (!user.accountId && !user.isSuperAdmin) {
        return { error: NextResponse.json({ error: "Conta não vinculada" }, { status: 403 }) };
    }

    // Retorna o usuário completo (Prisma) para uso nas APIs
    return { user };
});
