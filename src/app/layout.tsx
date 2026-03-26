import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/navbar";
import { MobileBottomBar } from "@/components/mobile-bottom-bar";
import { NavigationProgress } from "@/components/navigation-progress";
import { Analytics } from "@vercel/analytics/next";
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
  title: "FinanzApp",
  description: "Gestión de finanzas personales",
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

function checkAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const user = session?.user
    ? { name: session.user.name ?? null, image: session.user.image ?? null }
    : null;
  const admin = checkAdmin(session?.user?.email);

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <NavigationProgress />
        <Navbar />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-20 md:pb-6">
          {children}
        </main>
        <footer className="border-t py-4 pb-20 md:pb-4">
          <div className="mx-auto flex max-w-5xl items-center justify-center gap-4 px-4 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} FinanzApp</span>
            <Link href="/privacy" className="hover:underline">Privacidad</Link>
            <Link href="/terms" className="hover:underline">Términos</Link>
          </div>
        </footer>
        {user && <MobileBottomBar user={user} isAdmin={admin} />}
        <Analytics />
      </body>
    </html>
  );
}
