export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

type PromptWindow = Window & {
  deferredPwaPrompt?: BeforeInstallPromptEvent | null;
};

export const getDeferredPwaPrompt = (): BeforeInstallPromptEvent | null | undefined =>
  (window as PromptWindow).deferredPwaPrompt;

export const setDeferredPwaPrompt = (prompt: BeforeInstallPromptEvent | null) => {
  (window as PromptWindow).deferredPwaPrompt = prompt;
};
