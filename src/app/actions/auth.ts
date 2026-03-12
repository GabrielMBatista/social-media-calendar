"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cache } from "react";
import { headers } from "next/headers";

/** URL base do app — detecta estritamente pelo host para manter match com PKCE cookies */
async function getBaseUrl(): Promise<string> {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
    const proto = host.includes("localhost") ? "http" : "https";
    return `${proto}://${host}`;
}

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
 * Enviar Link Mágico (OTP)
 */
export async function signInWithOtpAction(formData: FormData) {
    const email = formData.get("email") as string;
    const supabase = await createClient();
    const baseUrl = await getBaseUrl();

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: `${baseUrl}/auth/callback`,
        },
    });

    if (error) {
        return { error: error.message };
    }

    return { success: "Link enviado! Verifique seu e-mail." };
}

/**
 * Criar conta nova: Cadastro completo
 */
export async function signUpAction(formData: FormData) {
    const emailFromForm = formData.get("email") as string;
    const password = formData.get("password") as string;
    const username = formData.get("username") as string;
    const agency = formData.get("agency") as string;
    const phone = formData.get("phone") as string;
    const invitationToken = formData.get("invitationToken") as string;

    const supabase = await createClient();

    // 0. Verifica se já existe uma sessão
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    let authUser = currentUser;

    if (!authUser) {
        // Caso A: Usuário novo total (Email/Senha)
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: emailFromForm,
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

        authUser = authData.user;
    }

    const finalEmail = authUser.email || emailFromForm;

    try {
        const existingUser = await prisma.user.findUnique({
            where: { authId: authUser!.id },
            select: { id: true }
        });

        if (existingUser) {
            return redirect("/");
        }

        // --- Lógica de Convite ---
        let targetAccountId: string | null = null;
        let targetRole: any = "OWNER";

        if (invitationToken) {
            const invite = await prisma.invitation.findUnique({
                where: { token: invitationToken },
                include: { account: true }
            });

            if (!invite || invite.accepted || invite.expiresAt < new Date()) {
                return { error: "Convite inválido ou expirado." };
            }

            if (invite.email.toLowerCase() !== finalEmail.toLowerCase()) {
                return { error: "Este convite foi enviado para outro endereço de e-mail." };
            }

            targetAccountId = invite.accountId;
            targetRole = invite.roleName === "ADMIN" ? "ADMIN" : "MEMBER";

            // Marcar convite como usado
            await prisma.invitation.update({
                where: { id: invite.id },
                data: { accepted: true }
            });
        }

        // 2. Cria a Empresa (se não for convite) e o Usuário
        await prisma.$transaction(async (tx: any) => {
            if (!targetAccountId) {
                // Criar nova conta se não for convite
                const newAccount = await tx.account.create({
                    data: {
                        name: agency || "Minha Agência",
                        plan: "FREE",
                    },
                });
                targetAccountId = newAccount.id;
            }

            // Criar o "User"
            await tx.user.create({
                data: {
                    accountId: targetAccountId!,
                    email: finalEmail,
                    name: username,
                    phone: phone || null,
                    role: targetRole,
                    authId: authUser!.id,
                },
            });
        });
    } catch (dbError) {
        console.error("Database provisioning failed:", dbError);
        return { error: "Erro ao finalizar criação da conta." };
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
export const getMyProfile = cache(async () => {
    try {
        const supabase = await createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) return null;

        const user = await prisma.user.findFirst({
            where: { authId: authUser.id },
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
            account: user.account ? {
                name: user.account.name,
                plan: user.account.plan
            } : null
        };
    } catch (e) {
        return null;
    }
});

/**
 * Atualizar Perfil do Usuário
 */
export async function updateProfileAction(formData: FormData) {
    const username = formData.get("username") as string;
    const phone = formData.get("phone") as string;

    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) return { error: "Não autorizado" };

    try {
        await prisma.user.update({
            where: { authId: authUser.id },
            data: {
                name: username,
                phone: phone || null,
            }
        });

        // Opcional: Atualizar metadados no Supabase Auth também para consistência
        await supabase.auth.updateUser({
            data: { display_name: username }
        });

        return { success: "Perfil atualizado com sucesso!" };
    } catch (error) {
        return { error: "Erro ao atualizar perfil." };
    }
}

/**
 * Atualizar Dados da Agência (Account)
 */
export async function updateAccountAction(formData: FormData) {
    const name = formData.get("name") as string;

    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) return { error: "Não autorizado" };

    try {
        const dbUser = await prisma.user.findUnique({
            where: { authId: authUser.id },
            select: { accountId: true }
        });

        if (!dbUser || !dbUser.accountId) return { error: "Conta não encontrada" };

        await prisma.account.update({
            where: { id: dbUser.accountId },
            data: { name }
        });

        return { success: "Dados da agência atualizados!" };
    } catch (error) {
        return { error: "Erro ao atualizar agência." };
    }
}

/**
 * Enviar Link de Recuperação de Senha
 */
export async function forgotPasswordAction(formData: FormData) {
    const email = formData.get("email") as string;
    const supabase = await createClient();

    // Prioriza NEXT_PUBLIC_SITE_URL (URL de produção fixa)
    const baseUrl = await getBaseUrl();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${baseUrl}/auth/callback?next=/reset-password`,

    });

    if (error) return { error: error.message };
    return { success: "Link de recuperação enviado para seu e-mail!" };
}

/**
 * Redefinir Senha do Usuário
 */
export async function resetPasswordAction(formData: FormData) {
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
        return { error: "As senhas não coincidem." };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) return { error: error.message };
    return { success: "Senha redefinida com sucesso! Você já pode entrar." };
}
