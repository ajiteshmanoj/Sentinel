import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sentinel — The control layer for AI agents that move money",
  description:
    "Sentinel is an audit-grade control layer between an AI agent and the real-world actions it takes. Risky, irreversible, or policy-violating actions are frozen and escalated to a human — in seconds, with a tamper-evident trail.",
};

export const viewport: Viewport = {
  themeColor: "#07070C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="bg-ink-900 text-white/90 antialiased selection:bg-indigo/40">
        {children}
      </body>
    </html>
  );
}
