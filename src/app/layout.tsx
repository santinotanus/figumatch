import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import RightPanel from "@/components/RightPanel";
import BottomNav from "@/components/BottomNav";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FiguMatch – Intercambiá figuritas del Mundial",
  description:
    "El marketplace de figuritas del Mundial. Encontrá usuarios con las figuritas que te faltan y ofrecé las tuyas repetidas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased bg-gray-50`}>
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Desktop right panel */}
        <RightPanel />

        {/* Page content */}
        {children}

        {/* Mobile bottom navigation */}
        <BottomNav />
      </body>
    </html>
  );
}
