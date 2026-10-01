"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

type Motion = "system" | "full" | "reduced";

interface ThemeContextType {
  motion: Motion;
  setMotion: (motion: Motion) => void;
  reducedMotion: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function getInitialMotion(): Motion {
  if (typeof window === "undefined") return "system";
  return (localStorage.getItem("motion") as Motion | null) ?? "system";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [motion, setMotionState] = useState<Motion>(getInitialMotion);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateMotion = () => {
      const reduce =
        motion === "reduced" || (motion === "system" && mediaQuery.matches);
      setReducedMotion(reduce);
      document.documentElement.classList.toggle("reduce-motion", reduce);
      document.documentElement.classList.toggle("motion-full", motion === "full");
    };

    updateMotion();
    mediaQuery.addEventListener("change", updateMotion);
    return () => mediaQuery.removeEventListener("change", updateMotion);
  }, [motion]);

  const setMotion = useCallback((newMotion: Motion) => {
    setMotionState(newMotion);
    localStorage.setItem("motion", newMotion);
  }, []);

  return (
    <ThemeContext.Provider value={{ motion, setMotion, reducedMotion }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
