import { useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export default function AuthCallback() {
    useEffect(() => {
        const run = async () => {
            console.log('🔵 CALLBACK START')

            // Aguardar um pouco para garantir que o Supabase processou
            await new Promise(resolve => setTimeout(resolve, 500))

            const { data, error } = await supabase.auth.getSession()

            console.log('🔵 SESSION RESULT', data, error)

            if (!data?.session) {
                console.error('🔴 NO SESSION')
                // Redirecionar para login após 2s
                setTimeout(() => {
                    window.location.href = '/auth?mode=login'
                }, 2000)
                return
            }

            console.log('✅ SESSION OK:', data.session.user.id)

            // Chamar Edge Function para sincronizar usuário
            try {
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
                    console.warn('⚠️ SYNC FAILED, continuing anyway')
                }
            } catch (syncError) {
                console.warn('⚠️ SYNC ERROR, continuing anyway:', syncError)
            }

            // Limpar hash da URL
            window.history.replaceState({}, '', '/')

            console.log('🔵 REDIRECTING TO /app')

            // Redirecionamento HARD (não react-router)
            window.location.href = '/app'
        }

        run()
    }, [])

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Processando login…</p>
            </div>
        </div>
    )
}
