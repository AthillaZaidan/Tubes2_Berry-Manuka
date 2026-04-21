export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-card/40 text-foreground">
            N
          </div>
          <p>
            <span className="font-semibold text-foreground">iloveTree</span> - DOM
            Tree Explorer
          </p>
        </div>

        <p>Berry-Manuka • IF2211 Strategi Algoritma</p>
      </div>
    </footer>
  );
}