"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

interface BackLayer {
  id: string;
  onBack: () => void;
}

interface BackNavigationContextValue {
  registerLayer: (id: string, onBack: () => void) => () => void;
  /**
   * Drops every registered layer without touching browser history. Used when
   * the app is about to leave the current document (for example on sign-out),
   * so pending back-traversals cannot cancel the navigation that follows.
   */
  reset: () => void;
}

const BackNavigationContext = createContext<BackNavigationContextValue | null>(null);

/**
 * Keeps the browser history in sync with in-app "layers" (an open
 * conversation, a non-chat tab, a modal...). Every active layer adds one
 * history entry, so Android's back gesture/button pops the top layer instead
 * of exiting Chrome or the installed app.
 */
export function BackNavigationProvider({ children }: { children: ReactNode }) {
  const layersRef = useRef<BackLayer[]>([]);
  const depthRef = useRef(0);
  const pendingPopsRef = useRef(0);
  const popTimerRef = useRef<number | null>(null);

  const cancelPendingPop = useCallback(() => {
    if (popTimerRef.current !== null) {
      window.clearTimeout(popTimerRef.current);
      popTimerRef.current = null;
    }
  }, []);

  const runPendingPop = useCallback(() => {
    popTimerRef.current = null;
    const desired = layersRef.current.length;
    const current = depthRef.current;
    if (desired >= current) return;
    const diff = current - desired;
    pendingPopsRef.current += diff;
    depthRef.current = desired;
    window.history.go(-diff);
  }, []);

  const syncHistory = useCallback(() => {
    // A scheduled pop is stale as soon as the layer stack changes again.
    cancelPendingPop();

    const desired = layersRef.current.length;
    const current = depthRef.current;
    if (desired === current) return;

    if (desired > current) {
      for (let i = 0; i < desired - current; i++) {
        window.history.pushState({ hearthBack: true }, "");
      }
      depthRef.current = desired;
    } else {
      // Defer back traversals to the next tick: React StrictMode mounts
      // effects twice (setup -> cleanup -> setup), and popping immediately
      // would race the follow-up pushState, leaving history out of sync so
      // the next in-app close escapes the app.
      popTimerRef.current = window.setTimeout(runPendingPop, 0);
    }
  }, [cancelPendingPop, runPendingPop]);

  const reset = useCallback(() => {
    cancelPendingPop();
    layersRef.current = [];
    depthRef.current = 0;
    pendingPopsRef.current = 0;
  }, [cancelPendingPop]);

  useEffect(() => {
    return () => cancelPendingPop();
  }, [cancelPendingPop]);

  // Navigations tear this document down; a queued history.go() at that point
  // can cancel the very navigation that is in flight.
  useEffect(() => {
    window.addEventListener("pagehide", cancelPendingPop);
    window.addEventListener("beforeunload", cancelPendingPop);
    return () => {
      window.removeEventListener("pagehide", cancelPendingPop);
      window.removeEventListener("beforeunload", cancelPendingPop);
    };
  }, [cancelPendingPop]);

  useEffect(() => {
    const handlePopState = () => {
      // Programmatic pops (from layers closing in-app) are already accounted
      // for; ignore their popstate events.
      if (pendingPopsRef.current > 0) {
        pendingPopsRef.current -= 1;
        return;
      }
      // The user pressed back: dismiss the top-most active layer.
      const layer = layersRef.current.pop();
      depthRef.current = Math.max(0, depthRef.current - 1);
      layer?.onBack();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const registerLayer = useCallback(
    (id: string, onBack: () => void) => {
      layersRef.current = layersRef.current.filter((layer) => layer.id !== id);
      layersRef.current.push({ id, onBack });
      syncHistory();

      return () => {
        layersRef.current = layersRef.current.filter((layer) => layer.id !== id);
        syncHistory();
      };
    },
    [syncHistory]
  );

  return (
    <BackNavigationContext.Provider value={{ registerLayer, reset }}>
      {children}
    </BackNavigationContext.Provider>
  );
}

export function useBackNavigation() {
  const context = useContext(BackNavigationContext);
  if (!context) {
    throw new Error("useBackNavigation must be used within BackNavigationProvider");
  }
  return context;
}

/**
 * Registers a back layer while `active` is true. When the user presses the
 * Android back button (or browser back), `onBack` is invoked instead of the
 * app exiting.
 */
export function useBackLayer(id: string, active: boolean, onBack: () => void) {
  const { registerLayer } = useBackNavigation();
  const onBackRef = useRef(onBack);

  useEffect(() => {
    onBackRef.current = onBack;
  }, [onBack]);

  useEffect(() => {
    if (!active) return;
    return registerLayer(id, () => onBackRef.current());
  }, [active, id, registerLayer]);
}
