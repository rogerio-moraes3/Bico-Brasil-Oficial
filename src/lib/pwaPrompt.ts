// Global PWA install prompt helper
// Allows sharing the beforeinstallprompt event across components

export type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

declare global {
    interface Window {
        deferredPwaPrompt?: BeforeInstallPromptEvent | null;
    }
}

export function getDeferredPwaPrompt(): BeforeInstallPromptEvent | null {
    return window.deferredPwaPrompt ?? null;
}

export function setDeferredPwaPrompt(prompt: BeforeInstallPromptEvent | null): void {
    window.deferredPwaPrompt = prompt;
}

export function clearDeferredPwaPrompt(): void {
    window.deferredPwaPrompt = null;
}
