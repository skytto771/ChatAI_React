import { useEffect, useRef } from "react";
import styles from "./index.module.scss";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  pulseSpeed: number;
  pulseOffset: number;
  connectionDist: number;
  currentOpacity: number;
  reset: () => void;
  update: (time: number) => void;
  draw: (ctx: CanvasRenderingContext2D, time: number) => void;
}

const ParticlesBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number>(0);

  const resizeCanvas = (canvas: HTMLCanvasElement) => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  const initParticles = (canvas: HTMLCanvasElement): Particle[] => {
    const count = Math.min(
      90,
      Math.floor((canvas.width * canvas.height) / 10000),
    );
    return Array.from({ length: count }, () => createParticle(canvas));
  };

  const createParticle = (canvas: HTMLCanvasElement): Particle => {
    const p = {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2.2 + 0.6,
      speedX: (Math.random() - 0.5) * 0.35,
      speedY: (Math.random() - 0.5) * 0.35,
      opacity: Math.random() * 0.5 + 0.2,
      pulseSpeed: Math.random() * 0.015 + 0.005,
      pulseOffset: Math.random() * Math.PI * 2,
      connectionDist: Math.random() * 100 + 80,
      currentOpacity: 0,
      reset() {
        Object.assign(this, createParticle(canvas));
      },
      update(time: number) {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < -20) this.x = canvas.width + 20;
        if (this.x > canvas.width + 20) this.x = -20;
        if (this.y < -20) this.y = canvas.height + 20;
        if (this.y > canvas.height + 20) this.y = -20;
        this.currentOpacity = Math.max(
          0.08,
          Math.min(
            0.75,
            this.opacity +
              Math.sin(time * this.pulseSpeed + this.pulseOffset) * 0.2,
          ),
        );
      },
      draw(ctx: CanvasRenderingContext2D, _time: number) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,170,220,${this.currentOpacity})`;
        ctx.fill();
        if (this.size > 1.5) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(140,120,210,${this.currentOpacity * 0.25})`;
          ctx.fill();
        }
      },
    };
    return p;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    resizeCanvas(canvas);
    particlesRef.current = initParticles(canvas);

    const handleResize = () => {
      resizeCanvas(canvas);
      particlesRef.current = initParticles(canvas);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const handleTouchEnd = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    const drawConnections = (
      ctx: CanvasRenderingContext2D,
      particles: Particle[],
      mouse: { x: number; y: number },
    ) => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist =
            (particles[i].connectionDist + particles[j].connectionDist) / 2;
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.18;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(160,140,220,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      if (mouse.x > 0 && mouse.y > 0) {
        for (const p of particles) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            const alpha = (1 - dist / 180) * 0.35;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(180,150,240,${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
            p.x += dx * 0.0015;
            p.y += dy * 0.0015;
          }
        }
      }
    };

    const animate = (timestamp: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const time = timestamp;
      const particles = particlesRef.current;
      for (const p of particles) {
        p.update(time);
        p.draw(ctx, time);
      }
      drawConnections(ctx, particles, mouseRef.current);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} />;
};

export default ParticlesBackground;
