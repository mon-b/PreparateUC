import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import ClientNavbar from "@/components/ClientNavbar";
import Sidebar from "@/components/Sidebar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "PreparateUC",
  description: "Usa IA para predecir qué entrará en tu próximo examen. Sube tus materiales y recibe predicciones inteligentes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ClientNavbar />
          <div className="flex">
            <Sidebar />
            <div className="flex-1 md:ml-64">
              {children}
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
