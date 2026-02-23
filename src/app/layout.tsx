import type { Metadata, Viewport } from "next";
import { Inter, Baloo_2 } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

const inter = Inter({ subsets: ["latin"] });
const baloo2 = Baloo_2({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-baloo-2"
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

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
      <body className={`${inter.className} ${baloo2.variable} antialiased bg-gray-50`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
