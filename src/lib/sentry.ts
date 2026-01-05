import * as Sentry from "@sentry/react";

// Inicializar Sentry apenas em produção
if (import.meta.env.PROD) {
    Sentry.init({
        dsn: "https://4254f391820cc9f16bc82e8a5170ceba@o4510655034556416.ingest.us.sentry.io/4510655055003648",
        environment: "production",

        // Performance Monitoring
        tracesSampleRate: 1.0,

        // Filtrar erros irrelevantes
        beforeSend(event) {
            if (event.exception?.values?.[0]?.value?.includes('chrome-extension://')) {
                return null;
            }
            if (event.exception?.values?.[0]?.type === 'NetworkError') {
                return null;
            }
            return event;
        },
    });
}

export default Sentry;
