import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /auth/callback
 * Handler para magic link e OAuth.
 * - Troca o ?code= por sessão Supabase
 * - Primeiro acesso (sem perfil no DB) → redireciona para /signup
 * - Acesso normal → redireciona para o dashboard
 */
export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

    if (code) {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data.user) {
            // Verifica se o usuário já tem perfil no DB
            const existingUser = await prisma.user.findUnique({
                where: { authId: data.user.id },
                select: { id: true },
            });

            if (!existingUser) {
                // Primeiro acesso → redireciona para criar perfil
                return NextResponse.redirect(`${origin}/signup`);
            }

            // Usuário existente → dashboard
            return NextResponse.redirect(`${origin}${next}`);
        }

        return NextResponse.redirect(
            `${origin}/login?error=${encodeURIComponent(error?.message ?? "Erro ao autenticar")}`
        );
    }

    return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent("Link inválido ou expirado")}`
    );
}
