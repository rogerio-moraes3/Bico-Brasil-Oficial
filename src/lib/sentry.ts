import * as Sentry from "@sentry/react";

// Inicializar Sentry apenas em produção
if (import.meta.env.PROD) {
    Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        environment: import.meta.env.MODE,

        // Performance Monitoring
        tracesSampleRate: 1.0, // Capturar 100% das transações em produção

        // Session Replay
        replaysSessionSampleRate: 0.1, // 10% das sessões normais
        replaysOnErrorSampleRate: 1.0, // 100% das sessões com erro

        integrations: [
            new Sentry.BrowserTracing({
                // Rastrear navegação
                routingInstrumentation: Sentry.reactRouterV6Instrumentation(
                    React.useEffect,
                    // @ts-ignore
                    window.location,
                    // @ts-ignore
                    window.history
                ),
            }),
            new Sentry.Replay({
                maskAllText: true, // LGPD - mascarar textos
                blockAllMedia: true, // LGPD - bloquear mídia
            }),
        ],

        // Filtrar erros conhecidos/irrelevantes
        beforeSend(event, hint) {
            // Ignorar erros de extensões do navegador
            if (event.exception?.values?.[0]?.value?.includes('chrome-extension://')) {
                return null;
            }

            // Ignorar erros de network (já são tratados)
            if (event.exception?.values?.[0]?.type === 'NetworkError') {
                return null;
            }

            return event;
        },
    });
}

export default Sentry;
