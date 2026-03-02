import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Atualiza o token do usuário se estiver expirando e pega a sessão
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Bypass para testes do Agente em localhost
    const isBypass = request.nextUrl.searchParams.get("bypass") === "true";

    // Rotas restritas e proteção:
    // Se não estiver logado e pedir a Dashboard (/), redireciona pra Login.
    if (!user && request.nextUrl.pathname === "/" && !isBypass) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    // Se já estiver logado e tentar acessar login ou signup, manda pra Dashboard.
    if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup")) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
    }

    if (isBypass) {
        supabaseResponse.cookies.set("auth-bypass", "true", { maxAge: 60 * 10 }); // 10 minutos
    }

    return supabaseResponse;
}
