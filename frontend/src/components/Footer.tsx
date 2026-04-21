export default function Footer() {
  return (
    <footer
      className="border-t"
      style={{
        borderTopColor: "rgba(0, 229, 255, 0.08)",
        background: "rgba(3, 5, 8, 0.9)",
      }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/logo-tree.ico"
            alt="iloveTree logo"
            className="h-11 w-11 object-contain"
          />
          <p>
            <span
              className="font-semibold"
              style={{ color: "#e0f7ff" }}
            >
              iloveTree
            </span>{" "}
            <span style={{ color: "#6b8fa3" }}>— DOM Tree Explorer</span>
          </p>
        </div>

        <p style={{ color: "#6b8fa3" }}>
          Berry-Manuka &bull; IF2211 Strategi Algoritma
        </p>
      </div>
    </footer>
  );
}
