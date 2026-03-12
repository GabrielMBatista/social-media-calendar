import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth, requirePro } from "@/lib/auth-utils";
import { z } from "zod";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

// Inicializa resend caso possua a chave
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const sendSchema = z.object({
  token: z.string(),
  emailTo: z.string().min(1, "E-mail é obrigatório"),
  message: z.string().optional(),
});

export async function POST(req: Request) {
  const auth = await requireTenantAuth();
  if (auth.error) return auth.error;
  const { user } = auth;

  // Envio de email é considerado um recurso PRO
  const pro = requirePro(user.account);
  if (pro.error) return pro.error;

  if (!resend) {
    return NextResponse.json(
      { success: false, error: "A chave da API do Resend não está configurada" },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const data = sendSchema.parse(body);

    const link = await prisma.shareLink.findUnique({
      where: { token: data.token },
      include: {
        post: {
          include: {
            client: true,
            account: true,
          },
        },
      },
    });

    if (!link || link.post.accountId !== user.accountId) {
      return NextResponse.json({ success: false, error: "ShareLink não encontrado ou acesso negado" }, { status: 404 });
    }

    const brandColor = link.post.client.brandColor || "#3b82f6";
    const postTitle = link.post.title;
    const clientName = link.post.client.name;
    const senderName = user.name || "Sua Agência";
    const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://gestaoconteudo.com'}/p/${link.token}`;

    const emailsStr = data.emailTo;
    const emailsArray = emailsStr.split(",").map(e => e.trim()).filter(Boolean);

    const emailValidator = z.string().email();
    for (const email of emailsArray) {
      const parse = emailValidator.safeParse(email);
      if (!parse.success) {
        return NextResponse.json({ success: false, error: `E-mail inválido: ${email}` }, { status: 400 });
      }
    }

    if (emailsArray.length === 0) {
      return NextResponse.json({ success: false, error: "Nenhum e-mail válido fornecido" }, { status: 400 });
    }

    const customMessage = data.message ? `<p style="color:#475569; padding: 16px; background: #f8fafc; border-radius: 8px; margin-bottom: 24px; font-style: italic;">"${data.message}"</p>` : "";

    // HTML Template embutido e responsivo
    const emailHtml = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background-color: #f1f5f9; color: #334155; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background-color: ${brandColor}; padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; color: #ffffff; font-size: 24px; letter-spacing: -0.5px; }
        .content { padding: 40px 32px; }
        .title { font-size: 20px; font-weight: 600; color: #0f172a; margin-top: 0; margin-bottom: 24px; line-height: 1.4; }
        .text { font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
        .button-wrapper { text-align: center; margin-top: 32px; margin-bottom: 32px; }
        .button { display: inline-block; padding: 14px 28px; background-color: ${brandColor}; color: #ffffff !important; text-decoration: none; font-weight: 600; border-radius: 8px; font-size: 16px; transition: opacity 0.2s; }
        .footer { padding: 24px; text-align: center; font-size: 13px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${clientName}</h1>
        </div>
        
        <div class="content">
          <h2 class="title">Olá! Há uma nova publicação aguardando sua aprovação.</h2>
          
          <p class="text">
            <strong>${senderName}</strong> da equipe encerrou o trabalho no post <strong>"${postTitle}"</strong> e compartilhou este material para sua avaliação.
          </p>
          
          ${customMessage}

          <div class="button-wrapper">
            <a href="${publicUrl}" class="button" target="_blank">Acessar Peça Completa</a>
          </div>

          <p class="text" style="font-size: 14px; color: #64748b;">
            Ou copie e cole o link no seu navegador:<br>
            <a href="${publicUrl}" style="color: ${brandColor}; word-break: break-all;">${publicUrl}</a>
          </p>
        </div>

        <div class="footer">
          Enviado com ❤️ por Social Media Calendar Studio<br>
          Esta é uma mensagem automática.
        </div>
      </div>
    </body>
    </html>
    `;

    // Disparando via Resend
    const { error } = await resend.emails.send({
      from: `Gestão de Conteúdo <onboarding@resend.dev>`, // Trocar para o domínio verificado depois
      to: emailsArray,
      subject: `Aprovação de Conteúdo: ${postTitle}`,
      html: emailHtml,
    });

    if (error) {
      console.error(error);
      return NextResponse.json({ success: false, error: "Falha ao enviar e-mail pelo Resend" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "E-mail enviado com sucesso" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "E-mail inválido", details: error.errors }, { status: 400 });
    }
    console.error("Houve um error ao enviar email:", error);
    return NextResponse.json({ success: false, error: "Erro de Servidor Inesperado" }, { status: 500 });
  }
}
