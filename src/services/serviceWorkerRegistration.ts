export type ServiceWorkerUpdateCallback = () => void;

let updateCallback: ServiceWorkerUpdateCallback | null = null;
let updatePending = false;
let reloadRequested = false;

export const registerServiceWorker = () => {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        registration.update();

        const onControllerChange = () => {
          if (reloadRequested) {
            window.location.reload();
          }
        };

        navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

        setInterval(() => {
          registration.update();
        }, 5 * 60 * 1000);

        if (registration.waiting) {
          updatePending = true;
          updateCallback?.();
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              updatePending = true;
              updateCallback?.();
            }
          });
        });
      })
      .catch(() => {
        // noop
      });
  });
};

export const onServiceWorkerUpdate = (callback: ServiceWorkerUpdateCallback) => {
  updateCallback = callback;
  if (updatePending) {
    callback();
  }
};

export const reloadForServiceWorkerUpdate = async () => {
  const registration = await navigator.serviceWorker.getRegistration();
  if (registration?.waiting) {
    reloadRequested = true;
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
};
