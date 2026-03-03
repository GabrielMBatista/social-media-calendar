import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Rota de emergência para forçar logout.
 * Limpa a sessão Supabase e redireciona para /login.
 * Útil quando o usuário fica preso em sessão sem perfil no DB.
 */
export async function GET() {
    const supabase = await createClient();
    await supabase.auth.signOut();

    // Redireciona para login e força limpeza de cookies
    const response = NextResponse.redirect(
        new URL("/login", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
    );

    return response;
}
