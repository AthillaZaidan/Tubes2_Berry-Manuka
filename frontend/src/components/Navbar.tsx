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
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        borderBottomColor: "rgba(0, 229, 255, 0.1)",
        background: "rgba(3, 5, 8, 0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="flex items-center gap-3 text-[22px] font-bold"
        >
          <img
            src="/logo-tree.ico"
            alt="Berry-Manuka logo"
            className="h-12 w-12 object-contain md:h-14 md:w-14"
          />
          <span style={{ fontFamily: "Orbitron, sans-serif", color: "#e0f7ff" }}>
            ilove
          </span>
          <span
            style={{
              fontFamily: "Orbitron, sans-serif",
              color: "#00e5ff",
              textShadow: "0 0 16px rgba(0, 229, 255, 0.4)",
            }}
          >
            Tree
          </span>
        </Link>

        <nav className="flex items-center gap-10">
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative rounded-lg px-2 py-1 text-[17px] font-medium transition-all duration-200"
                style={{
                  fontFamily: "Exo 2, sans-serif",
                  color: active ? "#00e5ff" : "#6b8fa3",
                  textShadow: active
                    ? "0 0 12px rgba(0, 229, 255, 0.5)"
                    : "none",
                  transform: active ? "scale(1.05)" : "scale(1)",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = "#00e5ff";
                    e.currentTarget.style.textShadow =
                      "0 0 12px rgba(0, 229, 255, 0.5)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = "#6b8fa3";
                    e.currentTarget.style.textShadow = "none";
                  }
                }}
              >
                {item.label}
                {active && (
                  <span
                    className="absolute -bottom-1 left-1/2 h-[2px] w-6 -translate-x-1/2 rounded-full"
                    style={{
                      background: "#00e5ff",
                      boxShadow: "0 0 8px rgba(0, 229, 255, 0.6)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
