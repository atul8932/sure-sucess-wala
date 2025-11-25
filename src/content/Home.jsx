import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import DecryptedText from "../components/DecryptedText";
import TrueFocus from "../components/TrueFocus";
import Navbar from "../components/Navbar";



class Particle {
  constructor(x, y, opts = {}) {
    this.x = x;
    this.y = y;
    const ang = Math.random() * Math.PI * 2;
    const speed = (opts.speed || 0.6) + Math.random() * (opts.spread || 1.8);
    this.vx = Math.cos(ang) * speed;
    this.vy = Math.sin(ang) * speed - (opts.upward ? 0.8 : 0);
    this.life = (opts.life || 60) + Math.floor(Math.random() * (opts.lifeVary || 40));
    this.remaining = this.life;
    this.size = (opts.size || 1.8) + Math.random() * (opts.sizeVary || 3.2);
    this.h = opts.hue || Math.floor(210 + Math.random() * 70);
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
    ctx.fillStyle = `hsla(${this.h}, 85%, 60%, ${this.alpha})`;
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export default function Home() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const particlesRef = useRef([]);
  const pointerRef = useRef({ x: -9999, y: -9999 });
  const spawnRef = useRef(null);
  const cursorOuterRef = useRef(null);
  const cursorInnerRef = useRef(null);
  const blobsRef = useRef({ one: null, two: null, three: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const resize = () => {
      const DPR = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * DPR;
      canvas.height = window.innerHeight * DPR;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    resize();

    const spawn = (x, y, count = 5, opts = {}) => {
      for (let i = 0; i < count; i++) {
        particlesRef.current.push(new Particle(x, y, opts));
      }
    };
    spawnRef.current = spawn;

    const loop = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      particlesRef.current.forEach((p, i) => {
        p.step();
        p.draw(ctx);
        if (p.remaining <= 0) particlesRef.current.splice(i, 1);
      });

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      pointerRef.current = { x: e.clientX, y: e.clientY };
      if (spawnRef.current) spawnRef.current(e.clientX, e.clientY, 2);

      if (cursorInnerRef.current)
        cursorInnerRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      if (cursorOuterRef.current)
        cursorOuterRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const fade = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  // Path to uploaded image (as requested)
  const logoPath = "/pdfs/logo.png";
  const [mobileOpen, setMobileOpen] = useState(false);
const mobileMenuRef = useRef(null);
const burgerRef = useRef(null);


useEffect(() => {
  const onDocClick = (e) => {
    if (!mobileOpen) return;
    const menu = mobileMenuRef.current;
    const burger = burgerRef.current;
    if (menu && !menu.contains(e.target) && burger && !burger.contains(e.target)) {
      setMobileOpen(false);
    }
  };
  const onEsc = (e) => { if (e.key === "Escape") setMobileOpen(false); };
  document.addEventListener("click", onDocClick);
  document.addEventListener("keydown", onEsc);
  return () => {
    document.removeEventListener("click", onDocClick);
    document.removeEventListener("keydown", onEsc);
  };
}, [mobileOpen]);


  return (
    <div className="page-container">

      {/* Particle canvas */}
      <canvas ref={canvasRef} className="particle-canvas" />

      {/* Custom cursor */}
      <div ref={cursorOuterRef} className="cursor-outer" />
      <div ref={cursorInnerRef} className="cursor-inner" />

      {/* Background blobs */}
      <div className="blob-container">
        <div ref={(el) => (blobsRef.current.one = el)} className="blob-1" />
        <div ref={(el) => (blobsRef.current.two = el)} className="blob-2" />
        <div ref={(el) => (blobsRef.current.three = el)} className="blob-3" />
      </div>

     
     <header>
        <Navbar />
      </header>



      {/* Hero Section */}
      <section className="hero">
        <div className="hero-grid">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.h1 variants={fade} className="hero-title">
              Learn. Grow. Succeed — <span>Sure Success Wallah</span>
            </motion.h1>

            <motion.p variants={fade} className="hero-text">
                <TrueFocus sentence="Learn Practice Revise Succeed" />
            </motion.p>

            <motion.div variants={fade} className="hero-buttons">
              <a href="/library" className="btn-primary">Explore Library</a>
              <a href="/content" className="btn-outline">Our Content</a>
            </motion.div>

            <motion.div variants={fade} className="hero-quote">
              <blockquote>
                “Education is not the filling of a pail, but the lighting of a fire.”
              </blockquote>
              <div>— Inspired by W. B. Yeats —</div>
            </motion.div>
            <motion.div variants={fade} className="metrics-grid">
              <div className="metric-card">
                <div className="metric-number">12k+</div>
                <div className="metric-label">Students</div>
              </div>
              <div className="metric-card">
                <div className="metric-number">1.2k+</div>
                <div className="metric-label">Courses</div>
              </div>
              <div className="metric-card">
                <div className="metric-number">98%</div>
                <div className="metric-label">Satisfaction</div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hero-right"
          >
            <div className="hero-card">
              {/* The logo is injected via CSS (see styles below). */}
              <div className="hero-card-inner with-logo">
                <div className="hero-card-content">
                  🎓
                  <div className="hero-card-title"></div>
                  <div className="hero-card-desc">
                    .
                  </div>
                </div>
              </div>
            </div>

            <div className="hero-card-features">
              <div className="hero-feature">Live mentoring & doubt clearing</div>
              <div className="hero-feature">Personalized study plans</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="mission-section">
        <h2 className="section-title">Our Mission</h2>
        <p className="mission-text">
  <DecryptedText
    text=" At Sure Success Wallah we believe consistent effort + smart guidance creates predictable success."
    animateOn="view"
    speed={45}
  />
</p>

        <div className="mission-grid">
          <div className="mission-box">
            <h4>Structured Paths</h4>
            <p>Clear milestones and weekly targets for every course.</p>
          </div>
          <div className="mission-box">
            <h4>Live Mentors</h4>
            <p>Doubt-solving & regular reviews from experts.</p>
          </div>
          <div className="mission-box">
            <h4>Practice & Analytics</h4>
            <p>Smart tests and dashboards for weak areas.</p>
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="courses-section">
        <h3 className="section-title">Featured Courses</h3>
        <div className="courses-grid">
          {[1,2,3].map((i) => (
            <div className="course-card" key={i}>
              <div className="course-title">Course {i}</div>
              <div className="course-desc">Coming Soon....</div>
              <div className="course-links">
                <a href="/content">View</a>
                <a href="/library">Enroll</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      

      {/* CTA */}
      <section className="cta-section">
        <h3 className="cta-title">Ready to start your journey?</h3>
        <p className="cta-subtitle">
          Join thousands of students who trust Sure Success Wallah.
        </p>
        <a href="/library" className="cta-button">Browse Library</a>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div>© {new Date().getFullYear()} Sure Success Wallah — All rights reserved.</div>
          <div className="footer-links">
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/contact">Contact</a>
          </div>
        </div>
      </footer>

      <style>{`
/* --------------------------------------------------------
   GLOBAL STYLES
-------------------------------------------------------- */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap');

.page-container {
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  background: linear-gradient(180deg, #0f172a 0%, #000000 50%, #1e293b 100%);
  color: #e2e8f0;
  position: relative;
  overflow-x: hidden;
}

/* --------------------------------------------------------
   PARTICLES CANVAS + CURSOR
-------------------------------------------------------- */
.particle-canvas {
  position: fixed;
  inset: 0;
  z-index: 30;
  pointer-events: none;
  mix-blend-mode: screen;
}

.cursor-outer {
  width: 36px;
  height: 36px;
  position: fixed;
  z-index: 200;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(150,140,255,0.6), rgba(120,120,255,0.2), transparent);
  pointer-events: none;
  mix-blend-mode: screen;
  transition: transform 0.12s ease-out;
}

.cursor-inner {
  width: 10px;
  height: 10px;
  position: fixed;
  z-index: 200;
  border-radius: 50%;
  background: #c7b8ff;
  box-shadow: 0 0 12px rgba(170,150,255,0.9);
  pointer-events: none;
  transition: transform 0.08s ease-out;
}

/* --------------------------------------------------------
   3D BLOBS BACKGROUND
-------------------------------------------------------- */
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

.blob-1 {
  width: 520px;
  height: 520px;
  top: -160px;
  left: -160px;
  background: radial-gradient(circle, rgba(79,70,229,0.25), rgba(168,85,247,0.12));
}

.blob-2 {
  width: 640px;
  height: 640px;
  bottom: -200px;
  right: -200px;
  background: radial-gradient(circle, rgba(140,90,246,0.22), rgba(99,102,241,0.12));
}

.blob-3 {
  width: 460px;
  height: 460px;
  top: 50%;
  left: 50%;
  background: radial-gradient(circle, rgba(120,160,255,0.22), rgba(100,120,255,0.12));
  transform: translate(-50%, -50%);
}

/* --------------------------------------------------------
   HEADER
-------------------------------------------------------- */
.header {
  position: sticky;
  top: 0;
  z-index: 40;
  backdrop-filter: blur(10px);
  background: rgba(0, 0, 0, 0.5);
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.nav-container {
  max-width: 1200px;
  margin: auto;
  padding: 16px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 28px;
  font-weight: 800;
  color: #ffffff;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 24px;
}

.nav-links a {
  color: #d1d5db;
  text-decoration: none;
  font-weight: 500;
}

.nav-links a:hover {
  color: #8b5cf6;
}

/* Profile */
.profile-box {
  background: rgba(30,41,59,0.5);
  padding: 8px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  gap: 10px;
  color: #fff;
}

.profile-icon {
  width: 34px;
  height: 34px;
  background: rgba(120,140,255,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #fff;
}

/* --------------------------------------------------------
   HERO SECTION
-------------------------------------------------------- */
.hero {
  padding: 120px 0 80px;
}

.hero-grid {
  max-width: 1200px;
  margin: auto;
  padding: 0 28px;
  display: grid;
  grid-template-columns: repeat(2,1fr);
  gap: 50px;
  align-items: center;
}

.hero-title {
  font-size: 48px;
  font-weight: 800;
  line-height: 1.2;
}

.hero-title span {
  color: #818cf8;
}

.hero-text {
  margin-top: 18px;
  font-size: 18px;
  max-width: 580px;
  color: #cbd5e1;
}

.hero-buttons {
  display: flex;
  gap: 18px;
  margin-top: 26px;
}

.btn-primary {
  padding: 14px 26px;
  background: linear-gradient(90deg,#818cf8,#6366f1);
  color: #fff;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: 0.2s;
  box-shadow: 0 0 24px rgba(129,140,248,0.25);
}

.btn-primary:hover {
  transform: translateY(-3px);
}

.btn-outline {
  padding: 14px 26px;
  border-radius: 12px;
  border: 1px solid #818cf8;
  color: #818cf8;
  font-weight: 600;
  text-decoration: none;
}

.btn-outline:hover {
  background: rgba(120,140,255,0.15);
}

.hero-quote {
  margin-top: 40px;
  max-width: 500px;
  color: #e2e8f0;
}

.hero-quote blockquote {
  font-size: 20px;
  font-style: italic;
}

.metrics-grid {
  margin-top: 40px;
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 18px;
}

.metric-card {
  background: rgba(30,41,59,0.4);
  padding: 18px;
  border-radius: 12px;
  text-align: center;
}

.metric-number {
  font-size: 24px;
  font-weight: 700;
}

.metric-label {
  color: #94a3b8;
  font-size: 14px;
}

/* Right-side hero card */
.hero-right { }

.hero-card {
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(99,102,241,0.15));
  padding: 20px;
  border: 1px solid rgba(140,120,255,0.14);
  box-shadow: 0 18px 60px rgba(0,0,0,0.5);
  background: rgba(30,41,59,0.4);
}

/* --- UPDATED: hero-card-inner now shows the uploaded logo behind content --- */
.hero-card-inner {
  position: relative;
  aspect-ratio: 4/3;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(79,70,229,0.06));
}

/* This pseudo element places the logo image behind the content.
   Uses the local path you provided. Increase opacity to make it clearly visible. */
.hero-card-inner.with-logo::before {
  content: "";
  position: absolute;
  inset: 12px;
  background-image: url("${logoPath}");
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain; /* contain ensures whole logo is visible */
  opacity: 0.98; /* strong visibility */
  filter: drop-shadow(0 8px 30px rgba(0,0,0,0.6)) saturate(110%);
  z-index: 0;
  pointer-events: none;
}

/* Card content sits above the logo */
.hero-card-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: #fff;
  mix-blend-mode: normal;
}

/* Slightly reduce emoji size so logo remains prominent */
.hero-card-content > :first-child {
  font-size: 56px;
}

.hero-card-title {
  margin-top: 8px;
  font-size: 20px;
  font-weight: 600;
}

.hero-card-desc {
  font-size: 14px;
  opacity: 0.95;
}

.hero-card-features {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(2,1fr);
  gap: 12px;
}

.hero-feature {
  background: rgba(30,41,59,0.45);
  padding: 12px;
  border-radius: 12px;
}

/* --------------------------------------------------------
   MISSION SECTION
-------------------------------------------------------- */
.mission-section {
  padding: 80px 0;
  border-top: 1px solid rgba(255,255,255,0.08);
}

.section-title {
  font-size: 36px;
  font-weight: 800;
  text-align: center;
}

.mission-text {
  max-width: 700px;
  margin: 18px auto;
  text-align: center;
  color: #cbd5e1;
}

.mission-grid {
  max-width: 1200px;
  margin: 40px auto;
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 26px;
  padding: 0 28px;
}

.mission-box {
  background: rgba(30,41,59,0.45);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.06);
}

/* --------------------------------------------------------
   COURSES SECTION
-------------------------------------------------------- */
.courses-section {
  padding: 80px 0;
}

.courses-grid {
  max-width: 1200px;
  margin: 30px auto;
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 26px;
  padding: 0 28px;
}

.course-card {
  background: rgba(30,41,59,0.4);
  padding: 24px;
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.04);
  transition: 0.2s;
}

.course-card:hover {
  transform: translateY(-4px);
}

.course-title {
  font-size: 20px;
  font-weight: 600;
}

.course-desc {
  margin-top: 8px;
  font-size: 14px;
  color: #94a3b8;
}

.course-links {
  margin-top: 14px;
  display: flex;
  gap: 16px;
}

.course-links a {
  color: #818cf6;
  text-decoration: none;
}

/* --------------------------------------------------------
   TESTIMONIALS
-------------------------------------------------------- */
.testimonials-section {
  padding: 80px 0;
  border-top: 1px solid rgba(255,255,255,0.08);
}

.testimonials-grid {
  max-width: 1200px;
  margin: 30px auto;
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 26px;
  padding: 0 28px;
}

.testimonial {
  background: rgba(30,41,59,0.45);
  padding: 24px;
  border-radius: 16px;
}

.testimonial-name {
  font-weight: 600;
  margin-bottom: 8px;
}

/* --------------------------------------------------------
   CTA SECTION
-------------------------------------------------------- */
.cta-section {
  text-align: center;
  padding: 80px 0;
}

/* ---------- Mobile nav / hamburger ---------- */

.hamburger {
  display: none; /* shown only on small screens via media query below */
  width: 44px;
  height: 40px;
  border-radius: 10px;
  border: none;
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(6px);
  cursor: pointer;
  align-items: center;
  justify-content: center;
  padding: 6px;
  z-index: 80;
  position: relative;
}

.hamburger:focus { outline: 2px solid rgba(129,140,248,0.6); }

.burger-line {
  display: block;
  width: 20px;
  height: 2px;
  margin: 4px 0;
  background: #e6e9f6;
  border-radius: 2px;
  transition: transform .18s ease, opacity .12s ease;
}

/* animate when open */
.hamburger.is-open .burger-line:nth-child(1) { transform: translateY(6px) rotate(45deg); }
.hamburger.is-open .burger-line:nth-child(2) { opacity: 0; transform: scaleX(0.2); }
.hamburger.is-open .burger-line:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

/* mobile menu overlay */
.mobile-menu {
  position: fixed;
  inset: 0 0 auto 0;
  top: 64px; /* slides from under header; adjust if header height changes */
  left: 0;
  right: 0;
  z-index: 75;
  transform-origin: top center;
  transform: translateY(-8px) scaleY(0.98);
  opacity: 0;
  pointer-events: none;
  transition: opacity .18s ease, transform .18s ease;
  background: linear-gradient(180deg, rgba(12,14,22,0.96), rgba(13,16,28,0.98));
  border-bottom: 1px solid rgba(255,255,255,0.04);
  box-shadow: 0 10px 40px rgba(0,0,0,0.6);
  padding: 18px;
}

/* open state */
.mobile-menu.open {
  transform: translateY(0) scaleY(1);
  opacity: 1;
  pointer-events: auto;
}

/* mobile links */
.mobile-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 420px;
  margin: 10px auto 20px;
  text-align: left;
}
.mobile-links a {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  color: #e6eefc;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
  transition: background .12s ease;
}
.mobile-links a:hover {
  background: rgba(129,140,248,0.08);
  color: #fff;
}
.mobile-profile { margin-top: 8px; display:flex; align-items:center; }

/* hide desktop profile inside header on small screens so mobile profile shows in menu */
.desktop-profile { display: flex; align-items:center; gap:10px; }

/* ---------- Responsive rules ---------- */
@media (max-width: 900px) {
  /* hide desktop nav, show hamburger */
  .nav-links { display: none !important; }
  .desktop-profile { display: none !important; }
  .hamburger { display: inline-flex; }
  /* ensure header items stay aligned */
  .nav-container { gap: 12px; padding: 12px 18px; }
  /* make header slightly taller on mobile if needed */
  .header { padding: 6px 0; }
  /* mobile menu sits below header; adjust top offset if header uses sticky + different height */
  .mobile-menu { top: 56px; }
}


.cta-title {
  font-size: 32px;
  font-weight: 700;
}

.cta-subtitle {
  margin-top: 12px;
  color: #cbd5e1;
}

.cta-button {
  margin-top: 28px;
  padding: 14px 28px;
  background: #6366f1;
  border-radius: 50px;
  font-weight: 600;
  color: white;
  text-decoration: none;
  display: inline-block;
}

/* --------------------------------------------------------
   FOOTER
-------------------------------------------------------- */
.footer {
  padding: 40px 0;
  border-top: 1px solid rgba(255,255,255,0.08);
  background: rgba(0,0,0,0.25);
}

.footer-inner {
  max-width: 1200px;
  margin: auto;
  padding: 0 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-links {
  display: flex;
  gap: 26px;
}

.footer-links a {
  text-decoration: none;
  color: #cbd5e1;
}

.footer-links a:hover {
  color: #818cf8;
}

/* --------------------------------------------------------
   RESPONSIVE
-------------------------------------------------------- */
@media (max-width: 900px) {

  .hero-grid {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .metrics-grid {
    grid-template-columns: repeat(3, 1fr);
    justify-items: center;
  }

  .mission-grid,
  .courses-grid,
  .testimonials-grid {
    grid-template-columns: 1fr;
  }

  .nav-links {
    display: none;
  }
}
`}</style>

    </div>
  );
}
