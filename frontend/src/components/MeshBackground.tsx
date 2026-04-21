"use client";

export default function MeshBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Base dark */}
      <div className="absolute inset-0 bg-[#030508]" />

      {/* Blob 1 — cyan */}
      <div
        className="absolute w-[70vw] h-[70vw] rounded-full opacity-[0.12] blur-[100px]"
        style={{
          top: "10%",
          left: "20%",
          background: "radial-gradient(circle, #00e5ff, transparent 70%)",
          animation: "mesh-float-1 18s ease-in-out infinite",
        }}
      />

      {/* Blob 2 — deep blue */}
      <div
        className="absolute w-[60vw] h-[60vw] rounded-full opacity-[0.10] blur-[90px]"
        style={{
          top: "40%",
          left: "50%",
          background: "radial-gradient(circle, #0066ff, transparent 70%)",
          animation: "mesh-float-2 22s ease-in-out infinite",
        }}
      />

      {/* Blob 3 — subtle purple */}
      <div
        className="absolute w-[50vw] h-[50vw] rounded-full opacity-[0.08] blur-[80px]"
        style={{
          top: "60%",
          left: "10%",
          background: "radial-gradient(circle, #5b21b6, transparent 70%)",
          animation: "mesh-float-3 26s ease-in-out infinite",
        }}
      />

      {/* Blob 4 — far corner cyan glow */}
      <div
        className="absolute w-[40vw] h-[40vw] rounded-full opacity-[0.09] blur-[70px]"
        style={{
          top: "-10%",
          right: "-5%",
          background: "radial-gradient(circle, #22d3ee, transparent 70%)",
          animation: "mesh-float-4 20s ease-in-out infinite",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(3,5,8,0.75) 100%)",
        }}
      />

      {/* Noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      <style jsx>{`
        @keyframes mesh-float-1 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(8vw, -6vh) scale(1.15);
          }
          66% {
            transform: translate(-4vw, 5vh) scale(0.9);
          }
        }
        @keyframes mesh-float-2 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(-7vw, 8vh) scale(1.1);
          }
          66% {
            transform: translate(5vw, -4vh) scale(0.95);
          }
        }
        @keyframes mesh-float-3 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(10vw, 3vh) scale(1.2);
          }
        }
        @keyframes mesh-float-4 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-6vw, 10vh) scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}
