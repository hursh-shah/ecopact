import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Ecopact – Eco-friendly Shopping Assistant",
  description: "Rate Amazon products and discover eco-friendly alternatives using Gemini",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className="min-h-screen antialiased text-gray-900">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <header className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-eco/10 ring-1 ring-eco/30 flex items-center justify-center">
                <span className="text-eco font-semibold">E</span>
              </div>
              <a href="/" className="text-xl font-semibold tracking-tight">Ecopact</a>
            </div>
            <nav className="flex items-center gap-4 text-sm">
              <a href="/rate" className="text-gray-700 hover:text-eco">Rate</a>
              <a href="https://github.com/hursh-shah/ecopact" target="_blank" rel="noreferrer" className="text-gray-700 hover:text-eco">GitHub</a>
            </nav>
          </header>
          {children}
          <footer className="mt-12 text-xs text-gray-500">Built with Next.js 14 + Gemini</footer>
        </div>
      </body>
    </html>
  );
} 