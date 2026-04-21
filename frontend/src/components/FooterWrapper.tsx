"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function FooterWrapper() {
  const pathname = usePathname();

  // Hide footer on landing page only
  if (pathname === "/") return null;

  return <Footer />;
}
