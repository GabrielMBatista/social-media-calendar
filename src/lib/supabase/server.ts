import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet: any[]) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // Server Component — cookies são read-only, ignorar
                    }
                },
            },
        }
    );
}

/**
 * Cliente com flowType: 'implicit' para uso exclusivo em Server Actions
 * que iniciam fluxos de email (magic link, reset de senha).
 *
 * No fluxo PKCE, o verifier é gerado server-side mas precisa estar no browser
 * no momento do callback — isso não funciona de forma confiável em Server Actions.
 * Com implicit, o Supabase usa #access_token= no hash, que o SDK client-side
 * processa automaticamente sem necessidade de code verifier.
 */
export async function createImplicitClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: { flowType: "implicit" },
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet: any[]) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch { }
                },
            },
        }
    );
}
