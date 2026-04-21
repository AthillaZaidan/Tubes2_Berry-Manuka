export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/logo-tree.ico"
            alt="iloveTree logo"
            className="h-11 w-11 object-contain"
          />
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
