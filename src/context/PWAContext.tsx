"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type InstallOutcome = "accepted" | "dismissed" | "unavailable";

interface PWAContextValue {
  canInstall: boolean;
  isInstalled: boolean;
  isIos: boolean;
  promptInstall: () => Promise<InstallOutcome>;
}

const PWAContext = createContext<PWAContextValue | null>(null);

function detectStandalone(): boolean {
  const standalone = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone =
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return standalone || iosStandalone;
}

function detectIos(): boolean {
  const ua = window.navigator.userAgent;
  const isIosDevice = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return isIosDevice && isSafari;
}

export function PWAProvider({ children }: { children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          // Pick up new deploys as soon as the app regains focus instead of
          // waiting for a cold start.
          const checkForUpdate = () => {
            if (document.visibilityState === "visible") {
              registration.update().catch(() => {});
            }
          };
          document.addEventListener("visibilitychange", checkForUpdate);
          return () => document.removeEventListener("visibilitychange", checkForUpdate);
        })
        .catch((error) => {
          console.error("Service worker registration failed", error);
        });

      // When a freshly deployed service worker takes control, reload once so
      // every device is always running the latest app code. Skipped on the
      // very first registration (no controller yet).
      const hadController = Boolean(navigator.serviceWorker.controller);
      let reloaded = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!hadController || reloaded) return;
        reloaded = true;
        window.location.reload();
      });
    }

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    // Deferred so the state updates happen outside the effect body.
    const timer = window.setTimeout(() => {
      setIsInstalled(detectStandalone());
      setIsIos(detectIos());
    }, 0);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<InstallOutcome> => {
    if (!deferredPrompt) return "unavailable";
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
    return choice.outcome;
  }, [deferredPrompt]);

  return (
    <PWAContext.Provider
      value={{
        canInstall: deferredPrompt !== null,
        isInstalled,
        isIos,
        promptInstall,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  const context = useContext(PWAContext);
  if (!context) throw new Error("usePWA must be used within PWAProvider");
  return context;
}
