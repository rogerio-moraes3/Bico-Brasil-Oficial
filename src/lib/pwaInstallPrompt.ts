export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

type PromptWindow = Window & {
  deferredPWAInstallPrompt?: BeforeInstallPromptEvent | null;
};

export const getDeferredPwaPrompt = () =>
  (window as PromptWindow).deferredPWAInstallPrompt ?? null;

export const setDeferredPwaPrompt = (prompt: BeforeInstallPromptEvent | null) => {
  (window as PromptWindow).deferredPWAInstallPrompt = prompt;
};
