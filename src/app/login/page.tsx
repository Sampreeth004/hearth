"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FlameMark } from "@/components/ui/HearthLogo";
import { useAuth } from "@/context/AuthContext";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const {
    user,
    initializing,
    signingIn,
    error,
    signIn,
    signInWithRedirect,
    clearError,
  } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initializing && user) {
      router.replace("/chat");
    }
  }, [user, initializing, router]);

  return (
    <main className="login-scene relative flex min-h-dvh items-center justify-center px-5 py-10 portrait:items-start portrait:pt-[8vh] sm:px-8">
      <div
        aria-hidden="true"
        className="login-veil pointer-events-none absolute inset-0"
      />

      {initializing ? (
        <div
          role="status"
          aria-label="Loading"
          className="relative h-8 w-8 animate-spin rounded-full border-2 border-white/70 border-b-accent-text"
        />
      ) : (
        <section className="animate-fade-slide-up relative w-full max-w-sm rounded-[28px] border border-white/70 bg-white/85 px-7 py-9 text-center shadow-[0_24px_60px_rgba(51,39,42,0.16)] backdrop-blur-xl sm:px-9">
          <span className="animate-ember mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-glassline bg-glass-subtle shadow-[0_8px_20px_rgba(51,39,42,0.08)]">
            <FlameMark className="h-9 w-9" />
          </span>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-ink">
            Hearth
          </h1>
          <p className="font-dm mt-1.5 text-sm text-accent-text">
            Chat. Connect. Create.
          </p>

          <Button
            type="button"
            onClick={() => {
              clearError();
              void signIn();
            }}
            loading={signingIn}
            size="lg"
            className="mt-7 w-full"
          >
            {!signingIn && <GoogleIcon />}
            Continue with Google
          </Button>

          {error && (
            <p
              role="alert"
              className="mt-3 text-center text-sm text-danger-strong"
            >
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              clearError();
              void signInWithRedirect();
            }}
            disabled={signingIn}
            className="mt-4 w-full text-center text-xs font-medium text-ink-muted transition-colors hover:text-accent-text disabled:opacity-50"
          >
            Pop-up blocked? Sign in with a redirect instead
          </button>

          <p className="font-dm mt-6 text-xs leading-relaxed text-ink-muted">
            By continuing, you agree to our{" "}
            <span className="font-medium text-ink">Terms of Service</span> and{" "}
            <span className="font-medium text-ink">Privacy Policy</span>.
          </p>
        </section>
      )}
    </main>
  );
}
