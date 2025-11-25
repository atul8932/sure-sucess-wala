import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
// --- Particle class (same lightweight engine used before) ---
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

export default function Content() {
  const fade = { hidden: { y: 18, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  // Canvas + cursor refs
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const particlesRef = useRef([]);
  const pointerRef = useRef({ x: -9999, y: -9999 });
  const spawnRef = useRef(null);
  const cursorOuterRef = useRef(null);
  const cursorInnerRef = useRef(null);
  const lerpRef = useRef({ x: -9999, y: -9999 });
  const scaleRef = useRef(1); // track cursor outer scale

  // Canvas & particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let DPR = window.devicePixelRatio || 1;

    const resize = () => {
      DPR = window.devicePixelRatio || 1;
      // set CSS size and backing store size properly
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      canvas.width = Math.floor(window.innerWidth * DPR);
      canvas.height = Math.floor(window.innerHeight * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0); // ensure drawing scales correctly
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
      // clear using canvas logical size
      ctx.clearRect(0, 0, canvas.width / DPR, canvas.height / DPR);

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

  // Cursor behavior
  useEffect(() => {
    const applyOuterTransform = () => {
      if (!cursorOuterRef.current) return;
      const x = lerpRef.current.x - 18;
      const y = lerpRef.current.y - 18;
      const s = scaleRef.current;
      cursorOuterRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`;
    };

    const onMove = (e) => {
      pointerRef.current.x = e.clientX;
      pointerRef.current.y = e.clientY;

      if (spawnRef.current && Math.random() > 0.65)
        spawnRef.current(e.clientX, e.clientY, 2, { size: 1.4, life: 36 });

      lerpRef.current.x += (e.clientX - lerpRef.current.x) * 0.18;
      lerpRef.current.y += (e.clientY - lerpRef.current.y) * 0.18;

      if (cursorInnerRef.current) cursorInnerRef.current.style.transform = `translate3d(${e.clientX - 6}px, ${e.clientY - 6}px, 0)`;
      applyOuterTransform();
    };

    const onLeave = () => {
      pointerRef.current.x = -9999;
      pointerRef.current.y = -9999;
      if (cursorInnerRef.current) cursorInnerRef.current.style.transform = `translate3d(-9999px,-9999px,0)`;
      if (cursorOuterRef.current) {
        lerpRef.current.x = -9999;
        lerpRef.current.y = -9999;
        applyOuterTransform();
      }
    };

    const onDown = (e) => {
      if (spawnRef.current) spawnRef.current(e.clientX, e.clientY, 12, { size: 2.4, life: 60, upward: true });
      scaleRef.current = 0.88;
      applyOuterTransform();
    };

    const onUp = () => {
      scaleRef.current = 1;
      applyOuterTransform();
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

  // sample arrays — replace with real URLs & paths
  const featuredVideos = [
    { id: "vid1", title: "compound Interest", url: "https://youtu.be/OTMq35xVCRY?si=UmZHijoz5YdoB7w0" },
    { id: "vid2", title: "Units and Dimension", url: "https://youtu.be/azpdOT4de-4?si=BUtlpcVi4xEIPkoF" },
    { id: "vid3", title: "Ratio and proportion", url: "https://youtu.be/6TkdRVg9FbQ?si=18H6bpBeSbCZK6os" },
    { id: "vid4", title: "Bihar Current Affairs", url: "https://youtu.be/6qNzx7-BGW0?si=Mi4Rj273Fdo5xBgD" },
    { id: "vid5", title: "East India Company & Nawabs of bengal", url: "https://youtu.be/67rqIuhtFOE?si=hyrCi-5gdxQTzBB8" },
  ];

  // IMPORTANT: place pdfs in public/pdfs so these URLs work in production
  const pdfResources = [
    { id: "pdf1", title: "Results-71stCCE (Pre)-CCE", href: "/pdfs/pdf1.pdf" },
    { id: "pdf2", title: "Measuring devices and scales", href: "/pdfs/pdf2.pdf" },
    { id: "pdf3", title: "OMR sheet of SURE SUCCESSWALLAH", href: "/pdfs/pdf3.pdf" },
    
  ];

  const freeVideos = {
    "BPSC Foundation": [
      { title: "🔬​ General Science", url: "https://youtube.com/playlist?list=PLSW3a2j7LFD_BLt16Vw_oXm8iEvAsy6Sa&si=-_ctRmBxeAXVtHK1" },
    ],
    "Current Affairs": [
      { title: "​📖​ Modern History", url: "https://youtube.com/playlist?list=PLSW3a2j7LFD-s9_K2I_sqdIOW9LmU_2-0&si=9GKYZDSu5KmQkYg6" },
    ],
    "Optional Subjects": [
      { title:"📐 Mathematics", url: "https://youtube.com/playlist?list=PLSW3a2j7LFD8V965fTqZb_3P7zFvcyCU1&si=nDWA0I58EAvDqyAd" },
    ]
    
  };

  return (
    <div className="page-container">
      {/* canvas + cursor */}
      <canvas ref={canvasRef} className="particle-canvas" />
      <div ref={cursorOuterRef} className="cursor-outer" aria-hidden="true" />
      <div ref={cursorInnerRef} className="cursor-inner" aria-hidden="true" />

      {/* blobs behind (same visuals as other pages) */}
      <div className="blob-container" aria-hidden="true">
        <div className="blob-1" />
        <div className="blob-2" />
        <div className="blob-3" />
      </div>

      {/* header */}
      <header className="header">
        <Navbar />
      </header>

      <main>
        {/* Hero */}
        <section className="content-hero">
          <motion.h1 variants={fade} initial="hidden" animate="visible" className="content-title">
            Resources & Content — Sure Success Wallah
          </motion.h1>
          <motion.p variants={fade} initial="hidden" animate="visible" className="content-sub">
            Curated video lessons, downloadable PDFs and free resources to help you cover the entire BPSC syllabus.
          </motion.p>
        </section>

        {/* Featured Videos */}
        <section className="section-block">
          <h2 className="section-heading">Featured Video Lessons</h2>
          <div className="cards-grid">
            {featuredVideos.map((v) => (
              <motion.article key={v.id} className="resource-card" whileHover={{ y: -6 }}>
                <div className="resource-thumb">🎥</div>
                <div className="resource-body">
                  <h4 className="resource-title">{v.title}</h4>
                  <p className="resource-desc">Short preview and key timestamps for the video.</p>
                  <div className="resource-links">
                    <a className="btn-link" href={v.url} target="_blank" rel="noopener noreferrer">Watch on YouTube</a>
                    <a className="btn-link" href={`${v.url}&t=60s`} target="_blank" rel="noopener noreferrer">Jump to 1m</a>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* PDFs */}
        <section className="section-block">
          <h2 className="section-heading">Downloadable PDFs</h2>
          <div className="cards-grid">
            {pdfResources.map((p) => (
              <motion.article key={p.id} className="resource-card" whileHover={{ y: -6 }}>
                <div className="resource-thumb">📄</div>
                <div className="resource-body">
                  <h4 className="resource-title">{p.title}</h4>
                  <p className="resource-desc">Printable notes & quick revision materials.</p>
                  <div className="resource-links">
                    <a className="btn-link" href={p.href} download>Download PDF</a>
                    <a className="btn-link" href={p.href} target="_blank" rel="noopener noreferrer">Open</a>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* Free Videos by Category */}
        <section className="section-block">
          <h2 className="section-heading">Free Videos — Categorised/Playlists</h2>
          <div className="categories-grid">
            {Object.entries(freeVideos).map(([cat, arr]) => (
              <div key={cat} className="category-card">
                <div className="category-title">{cat}</div>
                <ul className="category-list">
                  {arr.map((it, idx) => (
                    <li key={idx}><a href={it.url} target="_blank" rel="noopener noreferrer">{it.title}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Long-form content: Study guides / tips */}
        <section className="section-block long-content">
          <h2 className="section-heading">Comprehensive Study Guides & Tips</h2>
          <article className="long-article">
            <h3>1. How to plan your BPSC preparation (12-month roadmap)</h3>
            <p>
              Month 1–3: Foundation — build basics in History, Polity, Geography, Economy. Use short daily targets and complete one subject module per week.
            </p>
            <h3>2. Exam strategy & time management</h3>
            <p>
              Balance reading with practice: spend 60% time on theory & 40% on questions in early months; flip to 30/70 before prelims.
            </p>
            <h3>3. Tips for current affairs</h3>
            <p>
              Maintain monthly notes (download the monthly current affairs PDF), practice connecting news to syllabus topics, and attempt mini-tests every weekend.
            </p>
            <h3>4. Recommended books & references</h3>
            <ul>
              <li>History: Standard book + lecture series (video)</li>
              <li>Polity: Standard reference + government websites</li>
              <li>Economy: Book + Economic Survey / Budget highlights</li>
            </ul>
          </article>
        </section>

        {/* CTA */}
        <section className="section-block cta-block">
          <h2 className="section-heading">Want more tailored help?</h2>
          <p className="cta-sub">Enroll in our guided programs or request a callback — we’ll design a study plan for you.</p>
          <div className="cta-actions">
            <a className="btn-primary" href="/library">Explore Courses</a>
            <a className="btn-outline" href="/contact">Request Callback</a>
          </div>
        </section>
      </main>

      {/* footer */}
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

      {/* Local styles for Content page (cursor + canvas + blobs + layout) */}
     <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap');

        .page-container {
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          background: linear-gradient(180deg, #0f172a 0%, #000000 50%, #1e293b 100%);
          color: #e2e8f0;
          position: relative;
          overflow-x: hidden;
        }

        /* particles + cursor */
        .particle-canvas { position: fixed; inset: 0; z-index: 30; pointer-events: none; mix-blend-mode: screen; }
        .cursor-outer { position: fixed; top:0; left:0; width:36px; height:36px; pointer-events:none; z-index:60; border-radius:50%; background: radial-gradient(circle, rgba(150,140,255,0.6), rgba(120,120,255,0.25), transparent); filter: blur(6px); transition: transform 0.12s ease-out; }
        .cursor-inner { position: fixed; top:0; left:0; width:10px; height:10px; pointer-events:none; z-index:61; border-radius:50%; background:#d7ccff; box-shadow:0 0 12px rgba(170,150,255,0.85); transition: transform 0.08s ease-out; }

        /* blobs */
        .blob-container { position: fixed; inset:0; z-index:0; pointer-events:none; }
        .blob-1, .blob-2, .blob-3 { position:absolute; border-radius:50%; filter:blur(80px); opacity:0.55; transition: transform 0.7s ease-out; }
        .blob-1 { width:520px; height:520px; top:-160px; left:-160px; background: radial-gradient(circle, rgba(79,70,229,0.25), rgba(168,85,247,0.12)); }
        .blob-2 { width:640px; height:640px; bottom:-200px; right:-200px; background: radial-gradient(circle, rgba(140,90,246,0.22), rgba(99,102,241,0.12)); }
        .blob-3 { width:420px; height:420px; top:50%; left:50%; background: radial-gradient(circle, rgba(120,160,255,0.22), rgba(100,120,255,0.12)); transform:translate(-50%,-50%); }

        /* header */
        .header { position: sticky; top:0; z-index:40; backdrop-filter: blur(10px); background: rgba(0,0,0,0.45); border-bottom:1px solid rgba(255,255,255,0.06); }
        .nav-container { max-width:1200px; margin:auto; padding:12px 24px; display:flex; align-items:center; justify-content:space-between; }
        .logo { font-size:22px; font-weight:800; color:#fff; text-decoration:none; }
        .nav-links { display:flex; gap:20px; align-items:center; }
        .nav-links a { color:#d1d5db; text-decoration:none; font-weight:500; }
        .nav-links a:hover { color:#8b5cf6; }
        .profile-box { display:flex; gap:10px; align-items:center; background: rgba(30,41,59,0.5); padding:6px 10px; border-radius:10px; border:1px solid rgba(255,255,255,0.04); color:#e2e8f0; text-decoration:none; }
        .profile-icon { width:32px; height:32px; border-radius:50%; background: rgba(120,140,255,0.26); display:flex; align-items:center; justify-content:center; }

        /* hero */
        .content-hero { padding-top:110px; padding-bottom:30px; text-align:center; position:relative; z-index:40; }
        .content-title { font-size:38px; font-weight:800; }
        .content-sub { color:#cbd5e1; margin-top:8px; max-width:900px; margin-left:auto; margin-right:auto; }

        /* sections */
        .section-block { padding:40px 28px; border-top: 1px solid rgba(255,255,255,0.03); position:relative; z-index:20; }
        .section-heading { font-size:26px; font-weight:700; margin-bottom:18px; color:#e6eef8; text-align:left; max-width:1200px; margin-left:auto; margin-right:auto; }

        .cards-grid { max-width:1200px; margin:auto; display:grid; grid-template-columns: repeat(3,1fr); gap:18px; }
        .resource-card { background: rgba(30,41,59,0.45); padding:18px; border-radius:12px; border:1px solid rgba(255,255,255,0.04); display:flex; gap:14px; align-items:flex-start; }
        .resource-thumb { font-size:40px; width:72px; height:72px; display:flex; align-items:center; justify-content:center; background: rgba(255,255,255,0.02); border-radius:10px; }
        .resource-title { font-size:16px; font-weight:700; }
        .resource-desc { color:#9ca3af; font-size:14px; margin-top:6px; }

        .resource-links { margin-top:10px; display:flex; gap:10px; }
        .btn-link { color:#818cf8; text-decoration:none; font-weight:600; }
        .btn-link:hover { opacity:0.9; }

        .categories-grid { max-width:1200px; margin:auto; display:grid; grid-template-columns: repeat(3,1fr); gap:18px; }
        .category-card { background: rgba(30,41,59,0.45); padding:14px; border-radius:10px; border:1px solid rgba(255,255,255,0.04); }
        .category-title { font-weight:700; margin-bottom:8px; font-size:18px; }
        .category-list { list-style:none; padding-left:0; margin:0; font-size:25px; }
        .category-list li { margin:8px 0; }
        .category-list a { color:#cbd5e1; text-decoration:none; }
        .category-list a:hover { color:#818cf8; }

        .long-content .long-article { max-width:900px; margin:auto; color:#d1d5db; line-height:1.6; }
        .long-article h3 { margin-top:18px; color:#e6eef8; }

        .cta-block { text-align:center; padding-bottom:80px; }
        .cta-sub { color:#cbd5e1; margin-top:8px; margin-bottom:14px; }
        .cta-actions { display:flex; gap:12px; justify-content:center; margin-top:12px; }
        .btn-primary { padding:12px 20px; background: linear-gradient(90deg,#818cf8,#6366f1); color:white; border-radius:10px; border:none; font-weight:600; text-decoration:none; display:inline-block; }
        .btn-outline { padding:10px 18px; border-radius:10px; border:1px solid rgba(255,255,255,0.06); color:#cbd5e1; text-decoration:none; display:inline-block; }

        /* footer */
        .footer { border-top:1px solid rgba(255,255,255,0.06); padding:28px 0; background: rgba(0,0,0,0.12); margin-top:40px; }
        .footer-inner { max-width:1200px; margin:auto; display:flex; justify-content:space-between; align-items:center; gap:12px; padding:0 20px; flex-wrap:wrap; color:#cbd5e1; }
        .footer-links a { color:#cbd5e1; text-decoration:none; margin-left:12px; }
        .footer-links a:hover { color:#818cf8; }

        @media (max-width: 980px) {
          .cards-grid, .categories-grid { grid-template-columns: 1fr; }
          .content-title { font-size:28px; }
          .nav-links { display:none; }
        }
      `}</style>
    </div>
  );
}
