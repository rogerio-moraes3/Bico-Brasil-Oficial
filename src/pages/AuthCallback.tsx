import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true

        const run = async () => {
            console.log('🔵 CALLBACK START')

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

                console.log('✅ SESSION OK:', data.session.user.id)

                // 2) Chamar Edge Function para sincronizar usuário
                try {
                    console.log('🔵 Chamando Edge Function...')
                    const syncResponse = await fetch(
                        'https://pyelmqmhraczgptagvve.supabase.co/functions/v1/sync_user_profile',
                        {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${data.session.access_token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    )

                    console.log('🔵 SYNC RESPONSE:', syncResponse.status)

                    if (syncResponse.ok) {
                        const syncResult = await syncResponse.json()
                        console.log('✅ USER SYNCED:', syncResult)
                    } else {
                        const syncError = await syncResponse.text()
                        console.warn('⚠️ SYNC FAILED (continuing anyway):', syncError)
                    }
                } catch (syncError) {
                    console.warn('⚠️ SYNC ERROR (continuing anyway):', syncError)
                }

                // 3) Limpar URL (agora seguro, pois já temos sessão)
                console.log('🔵 Limpando URL...')
                window.history.replaceState({}, '', window.location.pathname)

                console.log('🔵 REDIRECTING TO /app')

                // 4) Redirecionar para /app
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
