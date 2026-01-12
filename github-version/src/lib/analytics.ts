// Analytics utility - Google Analytics 4
// Tracking de eventos sem dependências externas

/**
 * Track page view
 * @param {string} path - Caminho da página
 */
export const trackPageView = (path: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'page_view', {
            page_path: path,
            page_title: document.title
        });
    }
};

/**
 * Track custom event
 * @param {string} eventName - Nome do evento
 * @param {object} params - Parâmetros do evento
 */
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, params);
    }
};

/**
 * Track auth events
 */
export const trackAuth = {
    signup: () => trackEvent('sign_up', { method: 'email' }),
    login: () => trackEvent('login', { method: 'email' }),
    loginGoogle: () => trackEvent('login', { method: 'google' }),
    logout: () => trackEvent('logout')
};

/**
 * Track navigation
 */
export const trackNavigation = {
    toProfile: () => trackEvent('navigate_to_profile'),
    toAdmin: () => trackEvent('navigate_to_admin'),
    toPremium: () => trackEvent('navigate_to_premium'),
    toJobs: () => trackEvent('navigate_to_jobs')
};

// Extend Window interface for TypeScript
declare global {
    interface Window {
        gtag: (...args: any[]) => void;
        dataLayer: any[];
    }
}
