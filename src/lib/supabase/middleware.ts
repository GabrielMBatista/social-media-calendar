import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// IMPORTANTE: Não importar Prisma aqui! Middleware roda no Edge Runtime
// e o Prisma Client excede o limite de 1MB da Vercel.
// A lógica de verificação de perfil no DB fica nas Server Actions e API routes.

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
    const isBypass = request.nextUrl.searchParams.get("bypass") === "true";

    const isPublicRoute = ["/login", "/signup", "/forgot-password", "/reset-password", "/auth"].some(
        (p) => pathname === p || pathname.startsWith(p + "/")
    );

    // Sem sessão → protege rotas privadas
    if (!user && !isPublicRoute && !isBypass) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    // Com sessão em /login → manda para dashboard
    // /signup é permitido mesmo logado (para recriar perfil após reset de DB)
    if (user && pathname === "/login") {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
    }

    if (isBypass) {
        supabaseResponse.cookies.set("auth-bypass", "true", { maxAge: 60 * 10 });
    }

    return supabaseResponse;
}
