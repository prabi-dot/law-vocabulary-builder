import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";
import { VocabProvider } from "@/components/vocab-provider";

export const metadata: Metadata = {
  title: "Law Vocabulary Builder",
  description:
    "A personal vocabulary notebook for law students to capture, organize, and review legal terms.",
};

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/review", label: "Review" },
  { href: "/doodles", label: "Doodles" },
  { href: "/ai-lab", label: "AI Lab" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <VocabProvider>
          <div className="page-shell">
            <header className="topbar">
              <div>
                <p className="eyebrow">Personal study notebook</p>
                <Link href="/" className="brand">
                  Law Vocabulary Builder
                </Link>
              </div>
              <nav className="topnav" aria-label="Primary">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} className="nav-link">
                    {item.label}
                  </Link>
                ))}
              </nav>
            </header>
            <main className="page-content">{children}</main>
          </div>
        </VocabProvider>
      </body>
    </html>
  );
}
