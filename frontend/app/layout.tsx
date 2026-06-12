import type { Metadata } from "next";
import { Rajdhani, Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/QueryProvider";
import "./globals.css";

const rajdhani = Rajdhani({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-rajdhani",
  display: "swap",
});

const inter = Inter({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CRATE//BR — Skins de CS com os melhores preços",
  description: "Marketplace brasileiro de skins de Counter-Strike. Karambit Doppler, AK-47 Redline, AWP Dragon Lore e muito mais.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${rajdhani.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      style={{
        "--font-display": "var(--font-rajdhani), 'Oswald', sans-serif",
        "--font-body": "var(--font-inter), system-ui, sans-serif",
        "--font-mono": "var(--font-jetbrains), 'Courier New', monospace",
      } as React.CSSProperties}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          {children}
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border-default)",
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-sm)",
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
