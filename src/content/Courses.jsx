import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

// Particle class (same lightweight one used across pages)
class Particle {
  constructor(x, y, opts = {}) {
    this.x = x;
    this.y = y;
    const ang = Math.random() * Math.PI * 2;
    const speed = (opts.speed || 0.6) + Math.random() * (opts.spread || 1.6);
    this.vx = Math.cos(ang) * speed;
    this.vy = Math.sin(ang) * speed - (opts.upward ? 0.6 : 0);
    this.life = (opts.life || 40) + Math.floor(Math.random() * (opts.lifeVary || 30));
    this.remaining = this.life;
    this.size = (opts.size || 1.6) + Math.random() * (opts.sizeVary || 2.2);
    this.h = opts.hue || Math.floor(200 + Math.random() * 90);
    this.friction = opts.friction || 0.985;
    this.alpha = 1;
  }
  step() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.vy += 0.03;
    this.remaining -= 1;
    this.alpha = Math.max(0, this.remaining / this.life);
  }
  draw(ctx) {
    ctx.beginPath();
    ctx.fillStyle = `hsla(${this.h},85%,60%,${this.alpha})`;
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export default function Courses() {
  const fade = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  // Cursor + particles refs
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const particlesRef = useRef([]);
  const pointerRef = useRef({ x: -9999, y: -9999 });
  const spawnRef = useRef(null);
  const cursorOuterRef = useRef(null);
  const cursorInnerRef = useRef(null);
  const lerpRef = useRef({ x: -9999, y: -9999 });

  // Canvas + Particles effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let DPR = window.devicePixelRatio || 1;

    const resize = () => {
      DPR = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * DPR);
      canvas.height = Math.floor(window.innerHeight * DPR);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();

    const spawn = (x, y, count = 6, opts = {}) => {
      for (let i = 0; i < count; i++) {
        particlesRef.current.push(
          new Particle(x + (Math.random() - 0.5) * 10, y + (Math.random() - 0.5) * 10, opts)
        );
      }
      if (particlesRef.current.length > 1200) particlesRef.current.splice(0, 300);
    };
    spawnRef.current = spawn;

    let lastSpawn = 0;
    const loop = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const { x, y } = pointerRef.current;
      if (x > -1000) {
        const grd = ctx.createRadialGradient(x, y, 2, x, y, 140);
        grd.addColorStop(0, "rgba(180,220,255,0.14)");
        grd.addColorStop(0.2, "rgba(140,180,255,0.08)");
        grd.addColorStop(1, "rgba(88,83,255,0)");
        ctx.fillStyle = grd;
        ctx.fillRect(x - 200, y - 200, 400, 400);
      }

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        if (!p || typeof p.step !== "function") {
          particlesRef.current.splice(i, 1);
          continue;
        }
        p.step();
        p.draw(ctx);
        if (p.remaining <= 0) particlesRef.current.splice(i, 1);
      }

      if (Date.now() - lastSpawn > 28) {
        if (pointerRef.current.x > -1000 && Math.random() > 0.5 && spawnRef.current) {
          spawnRef.current(pointerRef.current.x + (Math.random() - 0.5) * 8, pointerRef.current.y + (Math.random() - 0.5) * 8, 1, { size: 1.2, life: 36 });
        }
        lastSpawn = Date.now();
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      spawnRef.current = null;
    };
  }, []);

  // Cursor movement handlers
  useEffect(() => {
    const onMove = (e) => {
      pointerRef.current.x = e.clientX;
      pointerRef.current.y = e.clientY;

      lerpRef.current.x += (e.clientX - lerpRef.current.x) * 0.18;
      lerpRef.current.y += (e.clientY - lerpRef.current.y) * 0.18;

      if (cursorInnerRef.current)
        cursorInnerRef.current.style.transform = `translate3d(${e.clientX - 6}px, ${e.clientY - 6}px, 0)`;
      if (cursorOuterRef.current)
        cursorOuterRef.current.style.transform = `translate3d(${lerpRef.current.x - 18}px, ${lerpRef.current.y - 18}px, 0)`;

      if (spawnRef.current && Math.random() > 0.65) {
        spawnRef.current(e.clientX, e.clientY, 2, { size: 1.4, life: 36 });
      }
    };

    const onLeave = () => {
      pointerRef.current.x = -9999;
      pointerRef.current.y = -9999;
      if (cursorInnerRef.current) cursorInnerRef.current.style.transform = `translate3d(-9999px,-9999px,0)`;
      if (cursorOuterRef.current) cursorOuterRef.current.style.transform = `translate3d(-9999px,-9999px,0)`;
    };

    const down = (e) => {
      if (spawnRef.current) spawnRef.current(e.clientX, e.clientY, 12, { size: 2.3, life: 60 });
      if (cursorOuterRef.current) cursorOuterRef.current.style.transform += " scale(0.88)";
    };

    const up = () => {
      if (cursorOuterRef.current) cursorOuterRef.current.style.transform = cursorOuterRef.current.style.transform.replace(" scale(0.88)", "");
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
    };
  }, []);

  // sample course list (BPSC-focused)
  const courses = [
    "BPSC Prelims Foundation",
    "BPSC Mains Complete GS",
    "BPSC Optional – History",
    "BPSC Optional – Geography",
    "BPSC Optional – PSIR",
    "BPSC Economy Special",
    "Current Affairs 1-Year Program",
    "Answer Writing Batch",
    "BPSC Marathon Revision"
  ];

  return (
    <div className="page-container">
      {/* particle canvas */}
      <canvas ref={canvasRef} className="particle-canvas" />

      {/* cursor */}
      <div ref={cursorOuterRef} className="cursor-outer" aria-hidden="true" />
      <div ref={cursorInnerRef} className="cursor-inner" aria-hidden="true" />

      {/* background blobs */}
      <div className="blob-container" aria-hidden="true">
        <div className="blob-1" />
        <div className="blob-2" />
        <div className="blob-3" />
      </div>

      {/* header */}
      <header className="header">
        <Navbar />
      </header>

      {/* hero */}
      <section className="courses-hero" style={{ position: "relative", zIndex: 10 }}>
        <motion.h1 variants={fade} initial="hidden" animate="visible" className="courses-title">
          BPSC Complete Course Collection
        </motion.h1>

        <motion.p variants={fade} initial="hidden" animate="visible" className="courses-subtitle">
          Hand-crafted study programs covering BPSC Prelims, Mains & Optional.
        </motion.p>
      </section>

      {/* course grid */}
      <section className="courses-list-section">
        <h3 className="section-title">Available Programs</h3>

        <div className="courses-grid">
          {courses.map((course, i) => (
            <motion.div
              key={course}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.03 }}
              className="course-card"
            >
              <div className="course-thumb">📘</div>
              <h4 className="course-name">{course}</h4>
              <p className="course-desc">Detailed theory + practice + PYQs + mock tests.</p>

              <div className="course-meta">
                <span>🔥 4.9</span><span>•</span><span>20+ Modules</span>
              </div>

              <div className="course-links">
                <Link to="/content" className="view-link">Coming Soon...</Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div>© {new Date().getFullYear()} Sure Success Wala — All rights reserved.</div>
          <div className="footer-links">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </footer>

      {/* page styles (self-contained) */}
      <style>{`
/* fonts + root background */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap');

.page-container {
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  background: linear-gradient(180deg, #0f172a 0%, #000000 50%, #1e293b 100%);
  color: #e2e8f0;
  position: relative;
  overflow-x: hidden;
}

/* particle canvas + cursor */
.particle-canvas {
  position: fixed;
  inset: 0;
  z-index: 30;
  pointer-events: none;
  mix-blend-mode: screen;
}

.cursor-outer {
  position: fixed;
  top: 0;
  left: 0;
  width: 36px;
  height: 36px;
  pointer-events: none;
  z-index: 60;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(150,140,255,0.6), rgba(120,120,255,0.25), transparent);
  filter: blur(6px);
  transition: transform 0.12s ease-out;
}

.cursor-inner {
  position: fixed;
  width: 10px;
  height: 10px;
  pointer-events: none;
  z-index: 61;
  border-radius: 50%;
  background: #d7ccff;
  box-shadow: 0 0 12px rgba(170,150,255,0.85);
  transition: transform 0.08s ease-out;
}

/* blobs */
.blob-container {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}
.blob-1, .blob-2, .blob-3 {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.55;
  transition: transform 0.7s ease-out;
}
.blob-1 { width: 520px; height: 520px; top: -160px; left: -160px; background: radial-gradient(circle, rgba(79,70,229,0.25), rgba(168,85,247,0.12)); }
.blob-2 { width: 640px; height: 640px; right: -220px; bottom: -220px; background: radial-gradient(circle, rgba(140,90,246,0.25), rgba(99,102,241,0.12)); }
.blob-3 { width: 440px; height: 440px; left: 50%; top: 50%; transform: translate(-50%,-50%); background: radial-gradient(circle, rgba(120,160,255,0.22), rgba(100,120,255,0.12)); }

/* header/nav */
.header {
  position: sticky; top: 0; z-index: 50;
  background: rgba(0,0,0,0.5); backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.nav-container { max-width: 1200px; margin: auto; padding: 14px 28px; display:flex; align-items:center; justify-content:space-between; }
.logo { color:#fff; font-weight:800; font-size: 26px; text-decoration:none; }
.nav-links { display:flex; gap:20px; }
.nav-links a { color:#d1d5db; text-decoration:none; }
.nav-links a:hover { color:#8b5cf6; }
.profile-box { background: rgba(30,41,59,0.5); padding:8px 12px; border-radius:10px; display:flex; gap:10px; align-items:center; border:1px solid rgba(255,255,255,0.06); color:#fff; }
.profile-icon { width:34px; height:34px; border-radius:50%; background: rgba(120,140,255,0.3); display:flex; align-items:center; justify-content:center; color:#fff; }

/* hero */
.courses-hero { padding-top:120px; padding-bottom:40px; text-align:center; position:relative; z-index:10; }
.courses-title { font-size:42px; font-weight:800; margin:0; }
.courses-subtitle { margin-top:10px; color:#cbd5e1; font-size:18px; }

/* grid */
.courses-list-section { padding:50px 0; }
.section-title { text-align:center; font-size:28px; font-weight:700; margin-bottom:24px; color:#e2e8f0; }
.courses-grid { max-width:1200px; margin:auto; padding:0 28px; display:grid; grid-template-columns: repeat(3, 1fr); gap:26px; }

/* cards */
.course-card { background: rgba(30,41,59,0.5); padding:20px; border-radius:16px; border:1px solid rgba(255,255,255,0.06); transition: transform 0.2s; position:relative; z-index:10; }
.course-card:hover { transform: translateY(-6px); box-shadow: 0 12px 40px rgba(0,0,0,0.45); }
.course-thumb { font-size:48px; text-align:center; margin-bottom:8px; }
.course-name { font-size:18px; font-weight:700; }
.course-desc { margin-top:8px; color:#94a3b8; font-size:14px; }
.course-meta { margin-top:10px; color:#cbd5e1; font-size:13px; display:flex; gap:8px; align-items:center; }
.course-links { margin-top:14px; display:flex; gap:18px; }
.view-link { color:#818cf8; font-weight:600; text-decoration:none; }

/* footer */
.footer { padding:40px 0; border-top:1px solid rgba(255,255,255,0.08); margin-top:40px; }
.footer-inner { max-width:1200px; margin:auto; padding:0 28px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
.footer-inner a { color:#cbd5e1; text-decoration:none; }

/* responsive */
@media (max-width: 980px) {
  .courses-grid { grid-template-columns: 1fr; }
  .nav-links { display:none; }
  .courses-title { font-size:32px; }
}
      `}</style>
    </div>
  );
}
