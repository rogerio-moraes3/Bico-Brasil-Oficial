import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true

        const run = async () => {


            try {
                // 1) Get code from URL params
                const urlParams = new URLSearchParams(window.location.search)
                const code = urlParams.get('code')

                if (!code) {
                    console.error('🔴 NO CODE IN URL')
                    setError('Código de autenticação não encontrado.')
                    return
                }

                // 2) Exchange code for session (modern method)
                const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

                if (!mounted) return

                if (sessionError) {
                    console.error('🔴 exchangeCodeForSession error:', sessionError)
                    setError('Erro ao processar login. Tente novamente.')
                    return
                }

                if (!data?.session) {
                    console.error('🔴 NO SESSION AFTER EXCHANGE')
                    setError('Sessão não encontrada. Tente fazer login novamente.')
                    return
                }

                // Trigger handle_new_user() já criou o perfil automaticamente
                // Não precisa chamar Edge Function

                // Limpar URL (agora seguro, pois já temos sessão)
                window.history.replaceState({}, '', window.location.pathname)

                // Redirecionando para /app

                // Redirecionar para /app
                if (mounted) {
                    window.location.replace('/app')
                }
            } catch (err) {
                console.error('🔴 CALLBACK UNEXPECTED ERROR:', err)
                if (mounted) {
                    setError('Erro inesperado. Tente novamente.')
                }
            }
        }

        run()

        return () => {
            mounted = false
        }
    }, [])

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.href = '/auth?mode=login'}
                        className="text-blue-600 hover:underline"
                    >
                        Voltar para login
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600">Processando login…</p>
            </div>
        </div>
    )
}
