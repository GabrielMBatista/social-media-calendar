import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth, requireAgency } from "@/lib/auth-utils";
import { z } from "zod";
import { nanoid } from "nanoid";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const inviteSchema = z.object({
    email: z.string().email(),
    roleName: z.string().optional(),
});

export async function POST(req: Request) {
    const auth = await requireTenantAuth();
    if (auth.error) return auth.error;
    const { user: currentUser } = auth;

    const agency = requireAgency(currentUser.account);
    if (agency.error) return agency.error;

    try {
        const body = await req.json();
        const { email, roleName } = inviteSchema.parse(body);

        // 1. Verificar se o usuário já existe na conta
        const existingUser = await prisma.user.findFirst({
            where: {
                accountId: currentUser.accountId,
                email: email
            }
        });

        if (existingUser) {
            return NextResponse.json({ success: false, error: "Este usuário já faz parte da sua agência." }, { status: 400 });
        }

        // 2. Verificar se já existe convite pendente ativo
        const existingInvite = await prisma.invitation.findFirst({
            where: {
                accountId: currentUser.accountId,
                email,
                accepted: false,
                expiresAt: { gt: new Date() }
            }
        });

        if (existingInvite) {
            return NextResponse.json({ success: false, error: "Já existe um convite pendente para este e-mail." }, { status: 400 });
        }

        // 3. Gerar Token único
        const token = nanoid(32);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias de validade

        // 4. Criar no banco
        const invitation = await prisma.invitation.create({
            data: {
                accountId: currentUser.accountId,
                email,
                token,
                roleName,
                expiresAt,
            }
        });

        // 5. Enviar E-mail (Opcional - Silencioso se falhar)
        const senderStr = process.env.RESEND_FROM_EMAIL;
        if (senderStr) {
            const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
            const inviteUrl = `${baseUrl}/signup?invite=${token}`;

            resend.emails.send({
                from: senderStr,
                to: [email],
                subject: `Convite para participar da agência ${currentUser.account?.name || "Social Media"}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; color: #334155;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #0f172a; font-size: 24px; margin-bottom: 10px;">Você foi convidado!</h1>
                            <p style="font-size: 16px; color: #64748b;"><strong>${currentUser.name}</strong> convidou você para fazer parte do time da agência <strong>${currentUser.account?.name}</strong> no Social Media Calendar.</p>
                        </div>
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="${inviteUrl}" style="background-color: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Aceitar Convite e Criar Conta</a>
                        </div>
                        <p style="font-size: 14px; color: #94a3b8; text-align: center; margin-top: 40px;">
                            Este convite é válido por 7 dias.<br>
                            Se você não esperava este convite, pode ignorar este e-mail.
                        </p>
                    </div>
                `
            }).catch(e => console.error("Error sending invite email:", e));
        }

        return NextResponse.json({ success: true, data: invitation });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: "E-mail inválido" }, { status: 400 });
        }
        console.error(error);
        return NextResponse.json({ success: false, error: "Erro interno ao criar convite" }, { status: 500 });
    }
}

export async function GET() {
    const auth = await requireTenantAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    const agency = requireAgency(user.account);
    if (agency.error) return agency.error;

    try {
        const invitations = await prisma.invitation.findMany({
            where: { accountId: user.accountId },
            orderBy: { createdAt: "desc" }
        });
        return NextResponse.json({ success: true, data: invitations });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Erro ao listar convites" }, { status: 500 });
    }
}
