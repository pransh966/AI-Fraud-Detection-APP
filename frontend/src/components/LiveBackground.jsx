import { useEffect, useRef } from "react";

// A quiet, ambient particle network that drifts on its own and gently
// reacts to the cursor — meant to sit behind the whole app at z-index 0.
// Respects prefers-reduced-motion by rendering a single static frame.

const PARTICLE_COUNT = 46;
const LINK_DISTANCE = 150;
const MOUSE_RADIUS = 170;
const COLORS = ["#3E63DD", "#9b51e0", "#2fb677"];

function LiveBackground() {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    particles: [],
    mouse: { x: -9999, y: -9999 },
    raf: null,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const seed = () => {
      stateRef.current.particles = Array.from({ length: PARTICLE_COUNT }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.6 + 0.8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      }));
    };
    seed();

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      stateRef.current.mouse.x = e.clientX - rect.left;
      stateRef.current.mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      stateRef.current.mouse.x = -9999;
      stateRef.current.mouse.y = -9999;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", resize);

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      stateRef.current.particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + "55";
        ctx.fill();
      });
    };

    if (reduceMotion) {
      drawStatic();
      return () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseleave", onLeave);
        window.removeEventListener("resize", resize);
      };
    }

    const tick = () => {
      const { particles, mouse } = stateRef.current;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < MOUSE_RADIUS) {
          const force = (1 - dist / MOUSE_RADIUS) * 0.6;
          p.x += (dx / (dist || 1)) * force;
          p.y += (dy / (dist || 1)) * force;
        }
      });

      // links
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK_DISTANCE) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(62,99,221,${0.12 * (1 - d / LINK_DISTANCE)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + "77";
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      stateRef.current.raf = requestAnimationFrame(tick);
    };
    stateRef.current.raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(stateRef.current.raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="live-bg-canvas" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 12% 8%, rgba(62,99,221,0.10), transparent 42%), radial-gradient(circle at 88% 92%, rgba(155,81,224,0.08), transparent 45%)",
        }}
      />
      <div
        className="absolute w-[520px] h-[520px] rounded-full blur-3xl opacity-[0.10] animate-blob-slow"
        style={{ top: "-8%", left: "-6%", background: "radial-gradient(circle, #3E63DD, transparent 70%)" }}
      />
      <div
        className="absolute w-[460px] h-[460px] rounded-full blur-3xl opacity-[0.09] animate-blob"
        style={{ bottom: "-10%", right: "-6%", background: "radial-gradient(circle, #9b51e0, transparent 70%)" }}
      />
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}

export default LiveBackground;
