export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

type PromptWindow = Window & {
  deferredPwaPrompt?: BeforeInstallPromptEvent | null;
};

export const getDeferredPwaPrompt = () =>
  (window as PromptWindow).deferredPwaPrompt ?? null;

export const setDeferredPwaPrompt = (prompt: BeforeInstallPromptEvent | null) => {
  (window as PromptWindow).deferredPwaPrompt = prompt;
};
