import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { UIProvider } from "@/context/UIContext";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "FinSaarthi AI - Government Scheme & Benefit Discovery Platform",
  description: "Discover government benefits, verify eligibility with confidence, manage documents, and apply on official portals.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#1E3A8A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900 selection:bg-blue-100 selection:text-blue-900">
        <LanguageProvider>
          <AuthProvider>
            <UIProvider>
              <Navbar />
              <Sidebar />
              <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {children}
              </main>
              <Footer />
            </UIProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
