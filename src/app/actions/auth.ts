"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

// Utiliza o cliente Prisma global a partir da lib/prisma
// importado acima diretamente.

/**
 * Logar com e-mail e senha
 */
export async function signInAction(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        let errorMsg = error.message;
        if (errorMsg.includes("Email not confirmed")) {
            errorMsg = "E-mail ainda não confirmado. Acesse sua caixa de entrada para o link de validação.";
        } else if (errorMsg.includes("Invalid login credentials")) {
            errorMsg = "E-mail ou senha inválidos.";
        }
        return { error: errorMsg };
    }

    return redirect("/");
}

/**
 * Criar conta nova: Cadastro completo
 */
export async function signUpAction(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const username = formData.get("username") as string;
    const agency = formData.get("agency") as string;
    const phone = formData.get("phone") as string;

    const supabase = await createClient();

    // 1. Cadastra no Supabase (Auth)
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                display_name: username,
            },
        }
    });

    if (authError || !authData.user) {
        return { error: authError?.message || "Erro desconhecido ao criar usuário Auth" };
    }

    try {
        // 2. Cria a Empresa e o Usuário Administrativo no Postgres
        await prisma.$transaction(async (tx: any) => {
            // 2.a Criar o "Account" primário
            const newAccount = await tx.account.create({
                data: {
                    name: agency,
                    plan: "free",
                },
            });

            // 2.b Criar o "User" mapeando o authId
            await tx.user.create({
                data: {
                    accountId: newAccount.id,
                    email: email,
                    name: username,
                    phone: phone || null,
                    role: "owner",
                    authId: authData.user!.id,
                },
            });
        });
    } catch (dbError) {
        // Log seguro no servidor (não expõe ao cliente)
        console.error("Database provisioning failed for:", email);
        return { error: "Ocorreu um erro no servidor ao finalizar a criação da conta. Tente novamente mais tarde." };
    }

    return redirect("/");
}

/**
 * Logout
 */
export async function signOutAction() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return redirect("/login");
}

/**
 * Consulta Sessão e Agência
 * Omitir senhas e dados desnecessários por segurança e serialização
 */
export async function getMyProfile() {
    try {
        const supabase = await createClient();
        const { data: authData } = await supabase.auth.getUser();

        if (!authData?.user) return null;

        const user = await prisma.user.findFirst({
            where: { authId: authData.user.id },
            include: { account: true }
        });

        if (!user) return null;

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            accountId: user.accountId,
            account: {
                name: user.account.name,
                plan: user.account.plan
            }
        };
    } catch (e) {
        return null;
    }
}
