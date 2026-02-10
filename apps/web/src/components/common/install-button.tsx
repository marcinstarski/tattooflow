"use client";

import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallButton({ className = "" }: { className?: string }) {
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null);
  const [showIos, setShowIos] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferred(event as InstallPromptEvent);
    };

    const onAppInstalled = () => setInstalled(true);

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onAppInstalled);

    const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as Navigator & { standalone?: boolean }).standalone;
    if (isIos && !isStandalone) {
      setShowIos(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  if (installed) return null;

  if (!deferred && !showIos) return null;

  const handleClick = async () => {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") {
        setInstalled(true);
      }
      setDeferred(null);
      return;
    }
    setShowIos((prev) => !prev);
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        className="rounded-full border border-ink-700 px-3 py-1.5 text-xs text-ink-200 hover:bg-ink-800"
      >
        Zainstaluj aplikację
      </button>
      {showIos && !deferred && (
        <div className="mt-2 max-w-xs rounded-lg border border-ink-800 bg-ink-900/90 p-3 text-[11px] text-ink-300">
          iPhone: w Safari kliknij Udostępnij → Do ekranu głównego.
        </div>
      )}
    </div>
  );
}
