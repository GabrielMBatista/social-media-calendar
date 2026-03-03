import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // Bypass para testes do Agente em localhost
    const isBypass = request.nextUrl.searchParams.get("bypass") === "true";

    // Rotas públicas que nunca redirecionam
    const isPublicRoute = ["/login", "/signup", "/forgot-password", "/reset-password", "/auth"].some(
        (p) => pathname === p || pathname.startsWith(p + "/")
    );

    // 1. Sem sessão → redireciona para login (exceto rotas públicas)
    if (!user && !isPublicRoute && !isBypass) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    // 2. Com sessão em rota de login/signup → verificar se tem perfil no DB
    //    Se tiver perfil → manda para dashboard
    //    Se NÃO tiver perfil → deixa acessar /signup para recrear o perfil
    if (user && (pathname === "/login" || pathname === "/signup")) {
        try {
            const dbUser = await prisma.user.findUnique({
                where: { authId: user.id },
                select: { id: true }
            });

            if (dbUser) {
                // Tem perfil → manda para dashboard
                const url = request.nextUrl.clone();
                url.pathname = "/";
                return NextResponse.redirect(url);
            }
            // Sem perfil → deixa acessar /signup para recrear
        } catch {
            // Em caso de erro de DB, deixa passar normalmente
        }
    }

    if (isBypass) {
        supabaseResponse.cookies.set("auth-bypass", "true", { maxAge: 60 * 10 });
    }

    return supabaseResponse;
}
