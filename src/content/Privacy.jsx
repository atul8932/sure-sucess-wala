import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

// lightweight particle class
class Particle {
  constructor(x, y, opts = {}) {
    this.x = x; this.y = y;
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
    this.x += this.vx; this.y += this.vy;
    this.vx *= this.friction; this.vy *= this.friction;
    this.vy += 0.03; this.remaining -= 1;
    this.alpha = Math.max(0, this.remaining / this.life);
  }
  draw(ctx) {
    ctx.beginPath();
    ctx.fillStyle = `hsla(${this.h},85%,60%,${this.alpha})`;
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export default function Privacy() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const particlesRef = useRef([]);
  const pointerRef = useRef({ x: -9999, y: -9999 });
  const spawnRef = useRef(null);
  const cursorOuterRef = useRef(null);
  const cursorInnerRef = useRef(null);
  const lerpRef = useRef({ x: -9999, y: -9999 });

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
        particlesRef.current.push(new Particle(
          x + (Math.random() - 0.5) * 10,
          y + (Math.random() - 0.5) * 10,
          opts
        ));
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
        if (pointerRef.current.x > -1000 && Math.random() > 0.55 && spawnRef.current) {
          spawnRef.current(pointerRef.current.x + (Math.random() - 0.5) * 8,
                           pointerRef.current.y + (Math.random() - 0.5) * 8,
                           1, { size: 1.2, life: 36 });
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

  useEffect(() => {
    const onMove = (e) => {
      pointerRef.current.x = e.clientX; pointerRef.current.y = e.clientY;
      lerpRef.current.x += (e.clientX - lerpRef.current.x) * 0.18;
      lerpRef.current.y += (e.clientY - lerpRef.current.y) * 0.18;
      if (cursorInnerRef.current) cursorInnerRef.current.style.transform = `translate3d(${e.clientX - 6}px, ${e.clientY - 6}px, 0)`;
      if (cursorOuterRef.current) cursorOuterRef.current.style.transform = `translate3d(${lerpRef.current.x - 18}px, ${lerpRef.current.y - 18}px, 0)`;
      if (spawnRef.current && Math.random() > 0.6) spawnRef.current(e.clientX, e.clientY, 2, { size: 1.4, life: 30 });
    };
    const onLeave = () => {
      pointerRef.current.x = -9999; pointerRef.current.y = -9999;
      if (cursorInnerRef.current) cursorInnerRef.current.style.transform = `translate3d(-9999px,-9999px,0)`;
      if (cursorOuterRef.current) cursorOuterRef.current.style.transform = `translate3d(-9999px,-9999px,0)`;
    };
    const onDown = (e) => {
      if (spawnRef.current) spawnRef.current(e.clientX, e.clientY, 12, { size: 2.4, life: 60 });
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

  // example asset path (from your uploaded files)
  const exampleAssetUrl = "/mnt/data/3278f9a9-b349-41cc-a8bd-766947a7dd46.png";

  return (
    <div className="page-container">
      <canvas ref={canvasRef} className="particle-canvas" />
      <div ref={cursorOuterRef} className="cursor-outer" aria-hidden="true" />
      <div ref={cursorInnerRef} className="cursor-inner" aria-hidden="true" />

      <div className="blob-container" aria-hidden="true">
        <div className="blob-1" />
        <div className="blob-2" />
        <div className="blob-3" />
      </div>

      <header className="header">
        <div className="nav-container">
          <a href="/" className="logo">SureSuccessWallah</a>
          <nav className="nav-links">
            <a href="/home">Home</a>
            <a href="/library">Library</a>
            <a href="/content">Content</a>
            <a href="/contacts">Contacts</a>
          </nav>
          <a href="/profile" className="profile-box">
            <div className="profile-icon">A</div><div>Atul Kumar</div>
          </a>
        </div>
      </header>

      <main>
        <section className="content-hero">
          <motion.h1 initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="content-title">
            Privacy Policy — Sure Success Wallah
          </motion.h1>
          <motion.p initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="content-sub">
            This privacy policy explains how Sure Success Wallah collects, uses and protects user information.
          </motion.p>
        </section>

        <section className="section-block">
          <div className="section-heading">Information We Collect</div>
          <div className="long-article">
            <p><strong>Personal information:</strong> name, email, phone number (collected when you register or request callbacks).</p>
            <p><strong>Usage data:</strong> pages visited, time on page, and interactions (for analytics and improvements).</p>
            <p><strong>Payment data:</strong> only when you purchase a paid course — handled by secure third-party gateways; we do not store card details.</p>
          </div>
        </section>

        <section className="section-block">
          <div className="section-heading">How We Use Data</div>
          <div className="long-article">
            <ul>
              <li>Deliver course purchases and enrollment confirmations.</li>
              <li>Improve product and content based on usage analytics.</li>
              <li>Contact you about account activity, offers, or updates if you opt-in.</li>
            </ul>
          </div>
        </section>

        <section className="section-block">
          <div className="section-heading">Third-party services</div>
          <div className="long-article">
            <p>We use trusted third-party services (payment gateways, email providers, analytics). Links to example resources and hosted PDFs are included below.</p>
            <p>Example logo/asset (local upload):</p>
            <img src={exampleAssetUrl} alt="example" style={{ maxWidth: 220, borderRadius: 8, marginTop: 10 }} />
          </div>
        </section>

        <section className="section-block">
          <div className="section-heading">Contact & Data Requests</div>
          <div className="long-article">
            <p>If you want to request deletion of your data, or ask about privacy, email us at <a href="mailto:learnwithsuresuccess@gmail.com">learnwithsuresuccess@gmail.com</a> or call +91 90191 42442</p>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div>© {new Date().getFullYear()} Sure Success Wallah — All rights reserved.</div>
          <div className="footer-links">
            <a href="/terms">Terms</a>
            <a href="/contact">Contact</a>
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap');
        .page-container { min-height:100vh; font-family:Inter, sans-serif; background:linear-gradient(180deg,#0f172a 0%,#000 50%,#1e293b 100%); color:#e2e8f0; position:relative; overflow-x:hidden; }
        .particle-canvas { position:fixed; inset:0; z-index:30; pointer-events:none; mix-blend-mode:screen; }
        .cursor-outer { position:fixed; top:0; left:0; width:36px; height:36px; pointer-events:none; z-index:60; border-radius:50%; background: radial-gradient(circle, rgba(150,140,255,0.6), rgba(120,120,255,0.25), transparent); filter: blur(6px); transition: transform 0.12s ease-out; }
        .cursor-inner { position:fixed; top:0; left:0; width:10px; height:10px; pointer-events:none; z-index:61; border-radius:50%; background:#d7ccff; box-shadow:0 0 12px rgba(170,150,255,0.85); transition: transform 0.08s ease-out; }
        .blob-container { position:fixed; inset:0; z-index:0; pointer-events:none; }
        .blob-1,.blob-2,.blob-3 { position:absolute; border-radius:50%; filter:blur(80px); opacity:0.55; transition: transform 0.7s ease-out; }
        .blob-1 { width:520px;height:520px; top:-160px; left:-160px; background: radial-gradient(circle, rgba(79,70,229,0.25), rgba(168,85,247,0.12)); }
        .blob-2 { width:640px;height:640px; bottom:-200px; right:-200px; background: radial-gradient(circle, rgba(140,90,246,0.22), rgba(99,102,241,0.12)); }
        .blob-3 { width:420px;height:420px; top:50%; left:50%; transform:translate(-50%,-50%); background: radial-gradient(circle, rgba(120,160,255,0.22), rgba(100,120,255,0.12)); }
        .header { position:sticky; top:0; z-index:40; backdrop-filter: blur(10px); background: rgba(0,0,0,0.45); border-bottom:1px solid rgba(255,255,255,0.06); }
        .nav-container { max-width:1200px; margin:auto; padding:12px 24px; display:flex; align-items:center; justify-content:space-between; }
        .logo { font-size:22px; font-weight:800; color:#fff; text-decoration:none; }
        .nav-links { display:flex; gap:20px; align-items:center; }
        .nav-links a { color:#d1d5db; text-decoration:none; font-weight:500; }
        .profile-box { display:flex; gap:10px; align-items:center; background: rgba(30,41,59,0.5); padding:6px 10px; border-radius:10px; border:1px solid rgba(255,255,255,0.04); color:#e2e8f0; text-decoration:none; }
        .content-hero { padding-top:110px; padding-bottom:30px; text-align:center; z-index:40; }
        .content-title { font-size:34px; font-weight:800; }
        .content-sub { color:#cbd5e1; margin-top:8px; max-width:900px; margin-left:auto; margin-right:auto; }
        .section-block { padding:28px; border-top: 1px solid rgba(255,255,255,0.03); z-index:20; }
        .section-heading { font-size:22px; font-weight:700; color:#e6eef8; margin-bottom:12px; }
        .long-article { color:#d1d5db; line-height:1.6; max-width:900px; margin:auto; }
        .footer { border-top:1px solid rgba(255,255,255,0.06); padding:20px 0; margin-top:30px; background: rgba(0,0,0,0.12); }
        .footer-inner { max-width:1200px; margin:auto; padding:0 16px; display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; color:#cbd5e1; }
        @media (max-width:980px) { .nav-links { display:none; } .content-title { font-size:26px; } }
      `}</style>
    </div>
  );
}
