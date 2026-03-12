import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    // const next é o destino final, se houver (ex: /reset-password)
    const next = searchParams.get("next") ?? "/";

    if (code) {
        const supabase = await createClient();
        const { error, data } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Verifica o provider para ver se foi Magic Link ou Login
            const provider = data.session?.user?.app_metadata?.provider;

            // Só redireciona para signup se for a primeira vez e não for um fluxo de reset de senha
            if (next !== "/reset-password") {
                const existingUser = await prisma.user.findUnique({
                    where: { email: data.session?.user?.email },
                });

                if (!existingUser) {
                    return NextResponse.redirect(`${origin}/signup`);
                }
            }

            // Redireciona de volta para a origin (two.vercel.app) no next path
            return NextResponse.redirect(`${origin}${next}`);
        } else {
            return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
        }
    }

    // fallback erro se não houer code
    return NextResponse.redirect(`${origin}/login?error=Link+inválido+ou+expirado`);
}
