import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scroll - Информационный помощник",
  description: "Официальный информационный портал полицейского департамента СКО",
  keywords: ["полиция", "ПДД", "правила дорожного движения", "Казахстан", "СКО"],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
