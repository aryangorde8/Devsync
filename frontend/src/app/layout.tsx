import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/components/Notifications";
import { OfflineIndicator } from "@/components/PWAInstallPrompt";
import { PageErrorBoundary } from "@/components/ErrorBoundary";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevSync - Developer Portfolio Dashboard",
  description: "Showcase your projects, skills, and achievements in one beautiful, professional dashboard. Built for developers who want to stand out.",
  keywords: ["developer", "portfolio", "dashboard", "projects", "skills", "github"],
  authors: [{ name: "DevSync" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DevSync",
  },
  openGraph: {
    title: "DevSync - Developer Portfolio Dashboard",
    description: "Showcase your projects, skills, and achievements in one beautiful, professional dashboard.",
    type: "website",
    siteName: "DevSync",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevSync - Developer Portfolio Dashboard",
    description: "Showcase your projects, skills, and achievements in one beautiful, professional dashboard.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

// Service Worker Registration Component
function ServiceWorkerRegistration() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js')
                .then(function(registration) {
                  console.log('SW registered:', registration.scope);
                })
                .catch(function(error) {
                  console.log('SW registration failed:', error);
                });
            });
          }
        `,
      }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <ServiceWorkerRegistration />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PageErrorBoundary>
          <NotificationProvider>
            <AuthProvider>
              <OfflineIndicator />
              {children}
            </AuthProvider>
          </NotificationProvider>
        </PageErrorBoundary>
      </body>
    </html>
  );
}
