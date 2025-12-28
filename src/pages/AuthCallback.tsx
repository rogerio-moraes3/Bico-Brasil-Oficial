import { useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export default function AuthCallback() {
    useEffect(() => {
        const run = async () => {
            console.log('🔵 CALLBACK START')

            // FORÇAR processamento do hash (Implicit Flow)
            // O Supabase processa automaticamente ao chamar getSession()
            await new Promise(resolve => setTimeout(resolve, 1000))

            const { data, error } = await supabase.auth.getSession()

            console.log('🔵 SESSION RESULT', data, error)

            if (error) {
                console.error('🔴 SESSION ERROR:', error)
                setTimeout(() => {
                    window.location.href = '/auth?mode=login'
                }, 2000)
                return
            }

            if (!data?.session) {
                console.error('🔴 NO SESSION')
                setTimeout(() => {
                    window.location.href = '/auth?mode=login'
                }, 2000)
                return
            }

            console.log('✅ SESSION OK:', data.session.user.id)

            // Chamar Edge Function para sincronizar usuário
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
                    console.warn('⚠️ SYNC FAILED:', syncError)
                }
            } catch (syncError) {
                console.warn('⚠️ SYNC ERROR:', syncError)
            }

            // Limpar hash da URL
            console.log('🔵 Limpando hash da URL...')
            window.history.replaceState({}, '', window.location.pathname)

            console.log('🔵 REDIRECTING TO /app')

            // Redirecionamento HARD
            setTimeout(() => {
                window.location.href = '/app'
            }, 500)
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
