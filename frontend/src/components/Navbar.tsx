"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Explorer", href: "/explorer" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-[22px] font-bold">
          <span className="text-foreground">ilove</span>
          <span className="text-primary">Tree</span>
        </Link>

        <nav className="flex items-center gap-10">
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-2 py-1 text-[17px] font-semibold transition-all duration-200 ${
                  active
                    ? "scale-105 text-primary drop-shadow-[0_0_8px_rgba(34,197,94,0.35)]"
                    : "text-muted-foreground hover:-translate-y-0.5 hover:scale-105 hover:text-primary hover:drop-shadow-[0_0_8px_rgba(34,197,94,0.35)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}