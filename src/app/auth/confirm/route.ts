import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null
    const next = searchParams.get('next') ?? '/'

    if (token_hash && type) {
        const supabase = await createClient()

        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        })
        if (!error) {
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                // Verificar se o usuário já tem um registro no nosso banco Prisma
                const dbUser = await prisma.user.findUnique({
                    where: { authId: user.id }
                })

                if (!dbUser) {
                    // Se não existir, mandamos para o signup completar os dados da agência
                    redirect('/signup')
                }
            }

            // redirect user to specified redirect URL or root of app
            redirect(next)
        }
    }

    // redirect the user to an error page with some instructions
    redirect('/login?error=Could not verify OTP')
}
