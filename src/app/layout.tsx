import type { Metadata, Viewport } from "next";
import { DM_Sans, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { PWAProvider } from "@/context/PWAContext";
import { BackNavigationProvider } from "@/context/BackNavigationContext";
import { Toaster } from "@/components/ui/Toaster";
import { AmbientBackground } from "@/components/ui/AmbientBackground";

// Variable fonts: one optimized file each covers every weight the UI uses.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Hearth — Chat. Connect. Create.",
  description:
    "Hearth is a soft, pastel chat app for real-time conversations: friends, presence, GIFs, and instant messaging in one warm place.",
  applicationName: "Hearth",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hearth",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Let the soft keyboard resize the layout instead of overlaying it, so the
  // composer stays pinned and the browser never pans the page on send.
  interactiveWidget: "resizes-content",
  themeColor: "#faeee7",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jakarta.variable} ${dmSans.variable}`}
    >
      <body className="antialiased">
        <AmbientBackground />
        <ThemeProvider>
          <PWAProvider>
            <BackNavigationProvider>
              <AuthProvider>
                <ToastProvider>
                  {children}
                  <Toaster />
                </ToastProvider>
              </AuthProvider>
            </BackNavigationProvider>
          </PWAProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
