"use client";

import { useEffect, useRef, useCallback } from "react";

interface Star {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
  layer: number; // 0 = far, 1 = mid, 2 = near
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  opacity: number;
  life: number;
  maxLife: number;
}

function generateStars(width: number, height: number): Star[] {
  const stars: Star[] = [];
  const counts = [150, 80, 40]; // far, mid, near
  const sizes = [0.4, 1.0, 1.8];
  const opacities = [0.25, 0.55, 0.85];

  for (let layer = 0; layer < 3; layer++) {
    for (let i = 0; i < counts[layer]; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      stars.push({
        x,
        y,
        baseX: x,
        baseY: y,
        size: sizes[layer] + Math.random() * 0.4,
        opacity: opacities[layer] + Math.random() * 0.15,
        twinkleSpeed: 0.5 + Math.random() * 2,
        twinklePhase: Math.random() * Math.PI * 2,
        layer,
      });
    }
  }
  return stars;
}

export default function CinematicStarfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = {
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      starsRef.current = generateStars(width, height);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);

    const spawnShootingStar = () => {
      if (Math.random() > 0.015) return; // ~1.5% chance per frame
      const side = Math.random();
      let x: number, y: number, vx: number, vy: number;

      if (side < 0.25) {
        // from top
        x = Math.random() * width;
        y = -20;
        vx = (Math.random() - 0.5) * 6;
        vy = 3 + Math.random() * 5;
      } else if (side < 0.5) {
        // from left
        x = -20;
        y = Math.random() * height * 0.5;
        vx = 4 + Math.random() * 6;
        vy = 1 + Math.random() * 3;
      } else if (side < 0.75) {
        // from top-right
        x = width + 20;
        y = Math.random() * height * 0.3;
        vx = -(4 + Math.random() * 6);
        vy = 2 + Math.random() * 4;
      } else {
        // from top-left diagonal
        x = Math.random() * width * 0.3;
        y = -20;
        vx = 3 + Math.random() * 4;
        vy = 3 + Math.random() * 5;
      }

      shootingStarsRef.current.push({
        x,
        y,
        vx,
        vy,
        length: 40 + Math.random() * 80,
        opacity: 0.6 + Math.random() * 0.4,
        life: 0,
        maxLife: 40 + Math.random() * 40,
      });
    };

    const animate = () => {
      timeRef.current += 0.016;
      const time = timeRef.current;
      const mouse = mouseRef.current;

      ctx.clearRect(0, 0, width, height);

      // Draw stars with parallax + twinkle
      for (const star of starsRef.current) {
        const parallaxStrength = (star.layer + 1) * 12;
        const offsetX = (mouse.x - 0.5) * parallaxStrength;
        const offsetY = (mouse.y - 0.5) * parallaxStrength;

        star.x = star.baseX - offsetX;
        star.y = star.baseY - offsetY;

        // Wrap around for infinite feel
        if (star.x < 0) star.x += width;
        if (star.x > width) star.x -= width;
        if (star.y < 0) star.y += height;
        if (star.y > height) star.y -= height;

        // Twinkle
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase);
        const finalOpacity = star.opacity * (0.6 + 0.4 * twinkle);

        // Glow for near stars
        if (star.layer === 2) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 229, 255, ${finalOpacity * 0.08})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`;
        ctx.fill();
      }

      // Spawn and draw shooting stars
      spawnShootingStar();
      const shootingStars = shootingStarsRef.current;
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.life++;
        s.x += s.vx;
        s.y += s.vy;

        const progress = s.life / s.maxLife;
        const fade = progress < 0.2 ? progress / 0.2 : 1 - (progress - 0.2) / 0.8;
        const alpha = s.opacity * Math.max(0, fade);

        if (alpha <= 0 || s.x < -200 || s.x > width + 200 || s.y > height + 200) {
          shootingStars.splice(i, 1);
          continue;
        }

        // Draw trail
        const gradient = ctx.createLinearGradient(
          s.x, s.y,
          s.x - s.vx * (s.length / Math.sqrt(s.vx * s.vx + s.vy * s.vy)),
          s.y - s.vy * (s.length / Math.sqrt(s.vx * s.vx + s.vy * s.vy))
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        gradient.addColorStop(0.3, `rgba(0, 229, 255, ${alpha * 0.6})`);
        gradient.addColorStop(1, "rgba(0, 229, 255, 0)");

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(
          s.x - s.vx * 3,
          s.y - s.vy * 3
        );
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Head glow
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [handleMouseMove]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Nebula blobs */}
      <div
        className="absolute -top-1/4 -left-1/4 w-[80vw] h-[80vw] rounded-full opacity-[0.07] blur-[120px]"
        style={{
          background: "radial-gradient(circle, #00e5ff, transparent 70%)",
          animation: "nebula-drift-1 20s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -bottom-1/4 -right-1/4 w-[70vw] h-[70vw] rounded-full opacity-[0.05] blur-[100px]"
        style={{
          background: "radial-gradient(circle, #ff9e00, transparent 70%)",
          animation: "nebula-drift-2 25s ease-in-out infinite",
        }}
      />
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] rounded-full opacity-[0.04] blur-[140px]"
        style={{
          background: "radial-gradient(circle, #7c3aed, transparent 70%)",
          animation: "nebula-drift-3 30s ease-in-out infinite",
        }}
      />

      {/* Star canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ opacity: 0.9 }}
      />

      {/* Subtle vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(3,5,8,0.6) 100%)",
        }}
      />

      <style jsx>{`
        @keyframes nebula-drift-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(10vw, 5vh) scale(1.1); }
          66% { transform: translate(-5vw, 10vh) scale(0.95); }
        }
        @keyframes nebula-drift-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-8vw, -5vh) scale(1.05); }
          66% { transform: translate(5vw, -8vh) scale(0.9); }
        }
        @keyframes nebula-drift-3 {
          0%, 100% { transform: translate(-50%, 0) scale(1); }
          50% { transform: translate(-40%, 5vh) scale(1.15); }
        }
      `}</style>
    </div>
  );
}
