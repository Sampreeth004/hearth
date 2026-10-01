"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FlameMark, HearthLogo } from "@/components/ui/HearthLogo";
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

const FEATURES = [
  {
    icon: MessageCircle,
    title: "Real-time messaging",
    description: "Instant delivery with read receipts.",
  },
  {
    icon: ImageIcon,
    title: "Photos, GIFs & reactions",
    description: "Share moments and respond your way.",
  },
  {
    icon: Users,
    title: "Friends & presence",
    description: "See who is online and stay close.",
  },
];

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

  if (initializing) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div
          role="status"
          aria-label="Loading"
          className="h-8 w-8 animate-spin rounded-full border-2 border-accent/30 border-b-accent"
        />
      </div>
    );
  }

  return (
    <main className="min-h-dvh lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel — desktop only */}
      <section className="bg-accent-gradient relative hidden flex-col justify-between overflow-hidden p-10 lg:flex">
          <div className="relative z-10">
            <HearthLogo size="lg" tone="inverted" />
          </div>

          <div className="relative z-10 max-w-md py-6">
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-ink">
              Chat. Connect. Create.
            </h2>
            <p className="font-dm mt-2 text-sm leading-relaxed text-ink/85">
              A calm, warm place for conversations that matter.
            </p>

            <ul className="mt-7 space-y-4">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <li key={title} className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white bg-white text-ink">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{title}</p>
                    <p className="font-dm mt-0.5 text-xs text-ink/70">{description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative z-10 pt-4 text-xs font-medium text-ink/60">
            Connect. Chat. Share. Grow.
          </p>
        </section>

      {/* Sign-in panel */}
      <section className="glass-fill flex min-h-dvh flex-col justify-center px-6 py-10 sm:px-10 lg:min-h-0 lg:border-l lg:border-hairline lg:py-12">
          <div className="animate-fade-slide-up mx-auto w-full max-w-sm">
            {/* Mobile brand */}
            <div className="mb-8 flex flex-col items-center text-center lg:hidden">
              <span className="animate-ember flex h-16 w-16 items-center justify-center rounded-2xl border border-glassline bg-glass-subtle shadow-[0_8px_20px_rgba(51,39,42,0.08)]">
                <FlameMark className="h-10 w-10" />
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink">
                Hearth
              </h1>
              <p className="mt-1 text-sm font-semibold text-accent-text">
                Chat. Connect. Create.
              </p>
            </div>

            <h2 className="text-xl font-bold tracking-tight text-ink">
              <span className="lg:hidden">Welcome to Hearth</span>
              <span className="hidden lg:inline">Welcome back</span>
            </h2>
              <p className="font-dm mt-1 text-sm text-ink-muted">
                <span className="lg:hidden">Connect. Chat. Share. Grow.</span>
                <span className="hidden lg:inline">
                  Sign in to continue to Hearth
                </span>
              </p>

            <Button
              type="button"
              onClick={() => {
                clearError();
                void signIn();
              }}
              loading={signingIn}
              size="lg"
              className="mt-5 w-full"
            >
              {!signingIn && <GoogleIcon />}
              Continue with Google
            </Button>

            {error && (
              <p role="alert" className="mt-3 text-center text-sm text-danger-strong">
                {error}
              </p>
            )}

            <div className="my-5 flex items-center gap-3" aria-hidden="true">
              <span className="h-px flex-1 bg-hairline" />
              <span className="text-xs font-medium text-ink-muted">or</span>
              <span className="h-px flex-1 bg-hairline" />
            </div>

            <p className="text-center text-sm font-semibold text-accent-text">
              Secure. Simple. Fast.
            </p>

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

            <p className="font-dm mt-6 text-center text-xs leading-relaxed text-ink-muted">
              By continuing, you agree to our{" "}
              <span className="font-medium text-ink">Terms of Service</span> and{" "}
              <span className="font-medium text-ink">Privacy Policy</span>.
            </p>
          </div>
      </section>
    </main>
  );
}
