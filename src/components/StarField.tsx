import { useEffect, useRef } from "react";

export default function GalaxyField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Galaxy star colors
    const colors = ["#744f4fff", "#191970", "#280569ff", "#b71be6ff"];

    // Initialize stars
    const stars = Array.from({ length: 400 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      len: Math.random() * 2 + 1,
      speed: Math.random() * 0.5 + 0.05,
      opacity: Math.random() * 0.8 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
      angle: Math.random() * Math.PI * 2, // for swirl
    }));

    // Draw loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let s of stars) {
        ctx.globalAlpha = s.opacity;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 1;

        // Draw star streak
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + Math.sin(s.angle) * s.len * 4, s.y + s.len * 4);
        ctx.stroke();

        // Update position with slight swirl
        s.y += s.speed;
        s.x += Math.sin(s.y / 50 + s.angle) * 0.3;

        // Reset if off screen
        if (s.y > height) {
          s.y = -10;
          s.x = Math.random() * width;
          s.angle = Math.random() * Math.PI * 2;
        }
      }

      requestAnimationFrame(draw);
    };

    draw();

    // Resize handler
    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);

    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="galaxyfield"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
