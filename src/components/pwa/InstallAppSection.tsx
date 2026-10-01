"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { usePWA } from "@/context/PWAContext";
import { useToast } from "@/context/ToastContext";

export function InstallAppSection() {
  const { canInstall, isInstalled, isIos, promptInstall } = usePWA();
  const { addToast } = useToast();

  if (isInstalled || (!canInstall && !isIos)) return null;

  const handleInstall = async () => {
    if (canInstall) {
      const outcome = await promptInstall();
      if (outcome === "accepted") {
        addToast("Hearth is installing", "info");
      }
      return;
    }
    if (isIos) {
      addToast('Tap Share, then "Add to Home Screen"', "info");
    }
  };

  return (
    <div className="glass-tint rounded-3xl px-5 py-5">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-muted">
        App
      </h3>
      <Button
        type="button"
        variant="outline"
        onClick={() => void handleInstall()}
        className="w-full"
      >
        <Download className="h-4 w-4" />
        Install Hearth
      </Button>
      <p className="font-dm mt-2 text-xs text-ink-muted">
        Add Hearth to your home screen for a full-screen, app-like experience.
      </p>
    </div>
  );
}
