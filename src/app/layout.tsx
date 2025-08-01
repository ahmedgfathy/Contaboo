import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap", // Better loading performance
  fallback: ["system-ui", "arial"], // Fallback fonts
  preload: true, // Preload for better performance
});

export const metadata: Metadata = {
  title: "نظام إدارة العقارات - كونتابو | Contaboo Real Estate",
  description: "نظام شامل لإدارة العقارات والوكلاء والعملاء - الحل الأمثل للشركات العقارية في مصر",
  keywords: "عقارات, إدارة عقارات, وكلاء عقاريين, عملاء, مصر, cairo, real estate",
  authors: [{ name: "Ahmed Gfathy" }],
  creator: "Ahmed Gfathy",
  publisher: "Contaboo",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#0ea5e9",
  openGraph: {
    title: "نظام إدارة العقارات - كونتابو",
    description: "نظام شامل لإدارة العقارات والوكلاء والعملاء",
    type: "website",
    locale: "ar_EG",
    alternateLocale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${cairo.variable} font-cairo antialiased arabic-text`}
        suppressHydrationWarning={true}
      >
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
