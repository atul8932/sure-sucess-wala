import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

// Lightweight Particle class (small, fast)
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

export default function Library() {
  const fade = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  // Cursor & particle refs
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const particlesRef = useRef([]);
  const pointerRef = useRef({ x: -9999, y: -9999 });
  const spawnRef = useRef(null);
  const cursorOuterRef = useRef(null);
  const cursorInnerRef = useRef(null);
  const lerpRef = useRef({ x: -9999, y: -9999 });

  // Canvas + particles
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
          new Particle(
            x + (Math.random() - 0.5) * 10,
            y + (Math.random() - 0.5) * 10,
            opts
          )
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
          spawnRef.current(
            pointerRef.current.x + (Math.random() - 0.5) * 8,
            pointerRef.current.y + (Math.random() - 0.5) * 8,
            1,
            { size: 1.2, life: 36 }
          );
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

  // Cursor movement + events
  useEffect(() => {
    const onMove = (e) => {
      pointerRef.current.x = e.clientX;
      pointerRef.current.y = e.clientY;

      // occasionally spawn burst
      if (spawnRef.current && Math.random() > 0.65) {
        spawnRef.current(e.clientX, e.clientY, 2, { size: 1.4, life: 36 });
      }

      // smooth outer cursor lerp
      lerpRef.current.x += (e.clientX - lerpRef.current.x) * 0.18;
      lerpRef.current.y += (e.clientY - lerpRef.current.y) * 0.18;

      if (cursorInnerRef.current) {
        cursorInnerRef.current.style.transform = `translate3d(${e.clientX - 6}px, ${e.clientY - 6}px, 0)`;
      }
      if (cursorOuterRef.current) {
        cursorOuterRef.current.style.transform = `translate3d(${lerpRef.current.x - 18}px, ${lerpRef.current.y - 18}px, 0)`;
      }
    };

    const onLeave = () => {
      pointerRef.current.x = -9999;
      pointerRef.current.y = -9999;
      if (cursorInnerRef.current) cursorInnerRef.current.style.transform = `translate3d(-9999px,-9999px,0)`;
      if (cursorOuterRef.current) cursorOuterRef.current.style.transform = `translate3d(-9999px,-9999px,0)`;
    };

    const onDown = (e) => {
      if (spawnRef.current) spawnRef.current(e.clientX, e.clientY, 12, { size: 2.4, life: 60, upward: true });
      if (cursorOuterRef.current) cursorOuterRef.current.style.transform += " scale(0.88)";
    };

    const onUp = () => {
      if (cursorOuterRef.current) cursorOuterRef.current.style.transform = cursorOuterRef.current.style.transform.replace(" scale(0.88)", "");
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("mouseout", onLeave);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mouseout", onLeave);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  return (
    <div className="page-container">

      {/* Particle canvas (fixed) */}
      <canvas ref={canvasRef} className="particle-canvas" />

      {/* Custom cursor elements */}
      <div ref={cursorOuterRef} className="cursor-outer" aria-hidden="true" />
      <div ref={cursorInnerRef} className="cursor-inner" aria-hidden="true" />

      {/* Header */}
      <header className="header">
        <div className="nav-container">
          <a href="/" className="logo">SURE SUCCESS WALLAH</a>

          <nav className="nav-links">
            <a href="/home">Home</a>
            <a href="/library">Library</a>
            <a href="/content">Content</a>
            <a href="/contact">Contacts</a>
            <a href="/courses">Courses</a>
          </nav>

          <a href="/profile" className="profile-box">
            <div className="profile-icon">S</div>
            <div>Sunil Saurabh</div>
          </a>
        </div>
      </header>

      {/* Hero / Title */}
      <section className="library-hero">
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fade}
          className="library-title"
        >
          Explore the Learning Library
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="visible"
          variants={fade}
          className="library-subtitle"
        >
          Thousands of curated courses, notes, & exam-specific study material.
        </motion.p>

        {/* Search Bar */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fade}
          className="library-search-box"
        >
          <input className="library-search-input" placeholder="Search for courses, topics, or exams..." />
          <button className="library-search-btn">Search</button>
        </motion.div>
      </section>

      {/* Filters */}
      <section className="library-filter-section">
        <h3 className="library-filter-title">Categories</h3>

        <div className="library-filters">
          {["UPSC", "SSC", "Banking","Aptitude", "BPSC"].map((cat, i) => (
            <button key={i} className="library-filter-btn">
              {cat}
            </button>
          ))}
        </div>
      </section>
    {/*AvailableCourses*/}
    <section className="library-grid-section">
        <h3 className="section-title">coming soon</h3>
        </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div>© {new Date().getFullYear()} Sure Success Wallah— All rights reserved.</div>
          <div className="footer-links">
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/contact">Contact</a>
          </div>
        </div>
      </footer>

      {/* Library Page Styles (includes cursor + canvas styles + global background) */}
      <style>{`
      /* -------------------------
         GLOBAL / BACKGROUND
      ------------------------- */
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap');

      .page-container {
        min-height: 100vh;
        font-family: 'Inter', sans-serif;
        background: linear-gradient(180deg, #0f172a 0%, #000000 50%, #1e293b 100%);
        color: #e2e8f0;
        position: relative;
        overflow-x: hidden;
      }

      /* -------------------------
         PARTICLE CANVAS + CURSOR
      ------------------------- */
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
        top: 0;
        left: 0;
        width: 10px;
        height: 10px;
        pointer-events: none;
        z-index: 61;
        border-radius: 50%;
        background: #d7ccff;
        box-shadow: 0 0 12px rgba(170,150,255,0.85);
        transition: transform 0.08s ease-out;
      }

      /* -------------------------
         3D BLOBS (background decorations)
      ------------------------- */
      .blob-container { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
      .blob-1, .blob-2, .blob-3 {
        position: absolute;
        border-radius: 50%;
        filter: blur(80px);
        opacity: 0.55;
        transition: transform 0.7s ease-out;
      }
      .blob-1 { width: 520px; height: 520px; top: -160px; left: -160px; background: radial-gradient(circle, rgba(79,70,229,0.25), rgba(168,85,247,0.12)); }
      .blob-2 { width: 640px; height: 640px; bottom: -200px; right: -200px; background: radial-gradient(circle, rgba(140,90,246,0.22), rgba(99,102,241,0.12)); }
      .blob-3 { width: 420px; height: 420px; top: 50%; left: 50%; background: radial-gradient(circle, rgba(120,160,255,0.22), rgba(100,120,255,0.12)); transform: translate(-50%, -50%); }

      /* -------------------------
         HEADER / NAV
      ------------------------- */
      .header {
        position: sticky;
        top: 0;
        z-index: 40;
        backdrop-filter: blur(10px);
        background: rgba(0, 0, 0, 0.45);
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }

      .nav-container {
        max-width: 1200px;
        margin: auto;
        padding: 12px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .logo {
        font-size: 22px;
        font-weight: 800;
        color: #fff;
        text-decoration: none;
      }

      .nav-links {
        display: flex;
        gap: 20px;
        align-items: center;
      }

      .nav-links a {
        color: #d1d5db;
        text-decoration: none;
        font-weight: 500;
      }

      .nav-links a:hover { color: #8b5cf6; }

      .profile-box {
        display: flex;
        gap: 10px;
        align-items: center;
        background: rgba(30,41,59,0.5);
        padding: 6px 10px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.04);
        color: #e2e8f0;
        text-decoration: none;
      }

      .profile-icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(120,140,255,0.26);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* -------------------------
         HERO
      ------------------------- */
      .library-hero {
        padding-top: 110px;
        padding-bottom: 40px;
        text-align: center;
        position: relative;
        z-index: 40;
      }

      .library-title {
        font-size: 40px;
        font-weight: 800;
      }

      .library-subtitle {
        margin-top: 10px;
        color: #cbd5e1;
        font-size: 16px;
      }

      .library-search-box {
        margin: 20px auto 0;
        display: flex;
        justify-content: center;
        gap: 10px;
      }

      .library-search-input {
        width: 360px;
        padding: 12px 14px;
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(10,10,15,0.6);
        color: white;
        outline: none;
      }

      .library-search-btn {
        padding: 12px 18px;
        border-radius: 12px;
        background: linear-gradient(90deg,#818cf8,#6366f1);
        color: white;
        border: none;
        cursor: pointer;
      }

      /* -------------------------
         FILTERS & GRID
      ------------------------- */
      .library-filter-section { padding: 40px 0 10px; text-align: center; z-index: 20; }
      .library-filters { margin-top: 16px; display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
      .library-filter-btn { padding:8px 14px; border-radius:10px; background: rgba(30,41,59,0.45); border:1px solid rgba(255,255,255,0.04); color:#e2e8f0; cursor:pointer; }

      .library-grid-section { padding: 36px 0 80px; }
      .library-course-grid {
        max-width: 1200px;
        margin: auto;
        display: grid;
        grid-template-columns: repeat(3,1fr);
        gap: 22px;
        padding: 0 20px;
        justify-items: center;
      }

      .library-course-card {
        background: rgba(30,41,59,0.5);
        padding: 18px;
        border-radius: 14px;
        border: 1px solid rgba(255,255,255,0.04);
        transition: transform 0.18s;
      }
      .library-course-card:hover { transform: translateY(-6px); }

      .library-card-thumb { text-align:center; font-size:44px; margin-bottom:8px; }
      .library-card-title { font-size:18px; font-weight:700; }
      .library-card-desc { margin-top:6px; color:#94a3b8; font-size:13px; }
      .library-card-meta { margin-top:10px; color:#cbd5e1; display:flex; gap:8px; font-size:13px; }
      .library-card-links { margin-top:12px; display:flex; gap:12px; }

      .card-link-view { color:#818cf8; text-decoration:none; font-weight:600; }

      /* footer */
      .footer { border-top:1px solid rgba(255,255,255,0.06); padding:28px 0; background: rgba(0,0,0,0.15); }
      .footer-inner { max-width:1200px; margin:auto; padding:0 20px; display:flex; justify-content:space-between; align-items:center; color:#cbd5e1; }

      /* responsive */
      @media (max-width: 900px) {
        .nav-links { display: none; }
        .library-course-grid { grid-template-columns: 1fr; }
        .library-search-input { width: 260px; }
        .library-title { font-size: 28px; }
      }
      `}</style>
    </div>
  );
}
