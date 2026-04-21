import Link from "next/link";

export default function HomePage() {
  return (
    <section className="relative flex min-h-[calc(100vh-140px)] items-center justify-center overflow-hidden">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <div className="space-y-6">
          <h1 className="font-display text-[64px] font-bold leading-[0.9] tracking-[-0.03em] md:text-[88px] lg:text-[110px]">
            Hello,
            <br />
            Welcome to
            <br />
            <span className="text-gradient drop-shadow-[0_0_25px_rgba(34,197,94,0.25)]">
              Berry-Manuka
            </span>
          </h1>
          <p className="text-base md:text-lg max-w-xl mx-auto leading-8 text-muted-foreground">
            Explore and visualize DOM trees using BFS and DFS traversal
            with CSS selectors in a clean interactive interface.
          </p>

          <div className="pt-4">
            <Link
              href="/explorer"
              className="inline-flex items-center rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground shadow-[0_0_30px_hsl(var(--primary)/0.15)] transition hover:scale-[1.03] hover:opacity-95"
            >
              Open Explorer
            </Link>
          </div>
        </div>
      </div>

      {/* subtle background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.15),transparent_60%)]" />
    </section>
  );
}