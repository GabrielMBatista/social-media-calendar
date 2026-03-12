"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * /auth/callback — página CLIENT-SIDE
 *
 * Com implicit flow, o Supabase redireciona para cá com #access_token=... no hash.
 * O SDK do browser detecta e processa o hash automaticamente via onAuthStateChange.
 * Sem PKCE, sem sessionStorage, sem verifier — funciona em qualquer aba/dispositivo.
 */
export default function AuthCallbackPage() {
    return (
        <Suspense>
            <CallbackHandler />
        </Suspense>
    );
}

function CallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const next = searchParams.get("next") ?? "/";
        const supabase = createClient();

        // O SDK detecta o #access_token= no hash e cria a sessão automaticamente.
        // Escutamos o evento SIGNED_IN para redirecionar após a sessão estar pronta.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
                subscription.unsubscribe();
                router.replace(next);
            }
            if (event === "PASSWORD_RECOVERY") {
                subscription.unsubscribe();
                router.replace("/reset-password");
            }
        });

        // Timeout de segurança: se não receber evento em 5s, vai para login
        const timeout = setTimeout(() => {
            subscription.unsubscribe();
            router.replace("/login?error=Link+expirado+ou+inválido");
        }, 5000);

        return () => {
            subscription.unsubscribe();
            clearTimeout(timeout);
        };
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-500 font-medium">Autenticando...</p>
            </div>
        </div>
    );
}
