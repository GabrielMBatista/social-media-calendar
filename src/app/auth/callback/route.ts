import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /auth/callback
 * Handler para magic link e OAuth — troca o code por uma sessão Supabase.
 * O Supabase redireciona aqui após autenticação com ?code=...
 */
export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Sucesso — redireciona para o destino (dashboard por padrão)
            return NextResponse.redirect(`${origin}${next}`);
        }

        // Falha na troca — redireciona para login com erro
        return NextResponse.redirect(
            `${origin}/login?error=${encodeURIComponent(error.message)}`
        );
    }

    // Sem code → login com erro genérico
    return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent("Link inválido ou expirado")}`
    );
}
