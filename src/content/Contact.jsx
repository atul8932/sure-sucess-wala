import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

// Small Particle engine (kept from your previous file)
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

export default function Contact() {
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

  // Canvas & particle loop
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
        if (!p || typeof p.step !== "function" || typeof p.draw !== "function") {
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

  // Cursor behaviour
  useEffect(() => {
    const onMove = (e) => {
      pointerRef.current.x = e.clientX; pointerRef.current.y = e.clientY;
      if (spawnRef.current && Math.random() > 0.65) spawnRef.current(e.clientX, e.clientY, 2, { size: 1.4, life: 36 });
      lerpRef.current.x += (e.clientX - lerpRef.current.x) * 0.18;
      lerpRef.current.y += (e.clientY - lerpRef.current.y) * 0.18;

      if (cursorInnerRef.current) cursorInnerRef.current.style.transform = `translate3d(${e.clientX - 6}px, ${e.clientY - 6}px, 0)`;
      if (cursorOuterRef.current) cursorOuterRef.current.style.transform = `translate3d(${lerpRef.current.x - 18}px, ${lerpRef.current.y - 18}px, 0)`;
    };
    const onLeave = () => {
      pointerRef.current.x = -9999; pointerRef.current.y = -9999;
      if (cursorInnerRef.current) cursorInnerRef.current.style.transform = `translate3d(-9999px,-9999px,0)`;
      if (cursorOuterRef.current) cursorOuterRef.current.style.transform = `translate3d(-9999px,-9999px,0)`;
    };
    const onDown = (e) => {
      if (spawnRef.current) spawnRef.current(e.clientX, e.clientY, 12, { size: 2.4, life: 60, upward: true });
      if (cursorOuterRef.current) {
        cursorOuterRef.current.style.transform = `translate3d(${lerpRef.current.x - 18}px, ${lerpRef.current.y - 18}px, 0) scale(0.88)`;
      }
    };
    const onUp = () => {
      if (cursorOuterRef.current) {
        cursorOuterRef.current.style.transform = `translate3d(${lerpRef.current.x - 18}px, ${lerpRef.current.y - 18}px, 0)`;
      }
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

  // Helper: fetch public IP (optional) — returns "n/a" on failure
  const fetchClientIP = async () => {
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const j = await res.json();
      return j.ip || "n/a";
    } catch {
      return "n/a";
    }
  };

  // Escape helper to avoid accidental HTML injection
  function escapeHtml(unsafe) {
    return String(unsafe || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Your Google Apps Script web app URL (you provided)
  const GAS_URL = "https://script.google.com/macros/s/AKfycby_Hop8aMyWKkW8ItX7tAusO53a5VBJk0NVjiW6Ig1Iu6UUBT38KwlP2rHvuJDOduxG/exec";

  // Local uploaded image path (developer-provided). Hosting/tooling will turn it into a URL.
  const logo_url = "/mnt/data/Screenshot from 2025-11-25 15-21-04.png";

  // Full form submit handler that builds a message_html and posts to GAS
  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;

    const user_name = (form.name?.value || "").trim();
    const user_email = (form.email?.value || "").trim();
    const user_phone = (form.phone?.value || "").trim();
    const enquiry_type = (form.reason?.value || "General enquiry").trim();
    const user_message = (form.message?.value || "").trim();
    const request_callback = form.callback?.checked ? "Yes" : "No";

    // Environment info
    const user_os = navigator.platform || "Unknown";
    const user_browser = navigator.userAgent || "Unknown";
    const user_version = navigator.appVersion || "Unknown";
    const user_platform = navigator.userAgentData?.platform || navigator.platform || "Unknown";
    const user_referrer = document.referrer || window.location.href || "Unknown";

    // Try to fetch IP (optional)
    const user_ip = await fetchClientIP();

    // Build HTML block (the Apps Script can use this raw HTML)
    const message_html = `
      <h2 style="font-family:Arial,Helvetica,sans-serif;color:#111;margin:0 0 12px">New contact request — Sure Success Wallah</h2>
      <table style="width:100%;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;margin-bottom:12px">
        <tr><td style="padding:8px;border:1px solid #eee;font-weight:700;width:160px">Name</td><td style="padding:8px;border:1px solid #eee">${escapeHtml(user_name)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;font-weight:700">Email</td><td style="padding:8px;border:1px solid #eee">${escapeHtml(user_email)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;font-weight:700">Phone</td><td style="padding:8px;border:1px solid #eee">${escapeHtml(user_phone)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;font-weight:700">Enquiry</td><td style="padding:8px;border:1px solid #eee">${escapeHtml(enquiry_type)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;font-weight:700">Callback Requested</td><td style="padding:8px;border:1px solid #eee">${escapeHtml(request_callback)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;font-weight:700;vertical-align:top">Message</td><td style="padding:8px;border:1px solid #eee">${escapeHtml(user_message).replace(/\n/g,'<br/>')}</td></tr>
      </table>

      <h4 style="margin:12px 0 8px;font-family:Arial,Helvetica,sans-serif">Environment & meta</h4>
      <ul style="font-family:Arial,Helvetica,sans-serif;color:#333;padding-left:18px;margin:0">
        <li><strong>OS:</strong> ${escapeHtml(user_os)}</li>
        <li><strong>Platform:</strong> ${escapeHtml(user_platform)}</li>
        <li><strong>Browser UA:</strong> ${escapeHtml(user_browser)}</li>
        <li><strong>App version:</strong> ${escapeHtml(user_version)}</li>
        <li><strong>Referrer / Page:</strong> ${escapeHtml(user_referrer)}</li>
        <li><strong>IP:</strong> ${escapeHtml(user_ip)}</li>
      </ul>
    `;

    const payload = {
      user_name,
      user_email,
      user_phone,
      enquiry_type,
      user_message,
      request_callback,
      user_os,
      user_platform,
      user_browser,
      user_version,
      user_referrer,
      user_ip,
      message_html,
      logo_url
    };

    try {
      const res = await fetch(GAS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const json = await res.json().catch(()=>({ ok: res.ok }));
      if (!res.ok && !json.ok) {
        console.error("GAS error response:", json);
        alert("Failed to send message. Check console for details.");
        return;
      }

      alert(`Thanks ${user_name || "there"}! Your message has been sent.`);
      form.reset();
    } catch (err) {
      console.error("send error", err);
      alert("Failed to send message. Check console.");
    }
  };

  return (
    <div className="page-container">

      {/* Particle canvas + custom cursor */}
      <canvas ref={canvasRef} className="particle-canvas" />
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

      <main>
        {/* Contact Hero */}
        <section className="contact-hero">
          <motion.h1 variants={fade} initial="hidden" animate="visible" className="contact-title">
            Get in touch with Sure Success Wallah
          </motion.h1>
          <motion.p variants={fade} initial="hidden" animate="visible" className="contact-sub">
            Questions, course enquiries or callback requests — leave your details and we’ll reach out.
          </motion.p>

          <div className="contact-info-cards" aria-hidden="false">
            <div className="info-card">
              <div className="info-icon">📞</div>
              <div className="info-body">
                <div className="info-title">Phone</div>
                <div className="info-text">+91 9019142442</div>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">✉️</div>
              <div className="info-body">
                <div className="info-title">Email</div>
                <div className="info-text">atulkumar54123@gmail.com</div>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">⏰</div>
              <div className="info-body">
                <div className="info-title">Working Hours</div>
                <div className="info-text">Mon — Sat, 9:00 AM — 7:00 PM</div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact form */}
        <section className="contact-form-section">
          <div className="form-wrapper">
            <h3 className="section-title">Send us a message / Request a callback</h3>

            <form className="contact-form" onSubmit={onSubmit}>
              <div className="form-row">
                <input name="name" className="input" placeholder="Your name" required />
                <input name="email" className="input" placeholder="Email" type="email" required />
              </div>

              <div className="form-row">
                <input name="phone" className="input" placeholder="Phone number" type="tel" required />
                <select name="reason" className="input">
                  <option>General enquiry</option>
                  <option>Course info</option>
                  <option>Enroll / Payment</option>
                  <option>Callback request</option>
                </select>
              </div>

              <textarea name="message" className="input textarea" placeholder="Your message" rows="6" />

              <label className="callback-row">
                <input name="callback" type="checkbox" />
                <span>Request a callback from our team</span>
              </label>

              <div className="form-actions">
                <button type="submit" className="btn-primary">Send Message</button>
                <a href="tel:+919019142442" className="btn-outline">Call Now</a>
              </div>

              <div className="note">
                This form sends data to your Google Apps Script Web App. All fields plus environment info (OS, browser, IP) are submitted.
              </div>
            </form>
          </div>
        </section>
      </main>

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

      {/* Inline styles (updated to fix overlapping borders + focus) */}
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

      .particle-canvas { position: fixed; inset: 0; z-index: 30; pointer-events: none; mix-blend-mode: screen; }
      .cursor-outer { position: fixed; top:0; left:0; width:36px; height:36px; pointer-events:none; z-index:60; border-radius:50%; background: radial-gradient(circle, rgba(150,140,255,0.6), rgba(120,120,255,0.25), transparent); filter: blur(6px); transition: transform 0.12s ease-out; }
      .cursor-inner { position: fixed; top:0; left:0; width:10px; height:10px; pointer-events:none; z-index:61; border-radius:50%; background:#d7ccff; box-shadow:0 0 12px rgba(170,150,255,0.85); transition: transform 0.08s ease-out; }

      .blob-container { position: fixed; inset:0; z-index:0; pointer-events:none; }
      .blob-1, .blob-2, .blob-3 { position:absolute; border-radius:50%; filter:blur(80px); opacity:0.55; transition: transform 0.7s ease-out; }
      .blob-1 { width:520px; height:520px; top:-160px; left:-160px; background: radial-gradient(circle, rgba(79,70,229,0.25), rgba(168,85,247,0.12)); }
      .blob-2 { width:640px; height:640px; bottom:-200px; right:-200px; background: radial-gradient(circle, rgba(140,90,246,0.22), rgba(99,102,241,0.12)); }
      .blob-3 { width:420px; height:420px; top:50%; left:50%; background: radial-gradient(circle, rgba(120,160,255,0.22), rgba(100,120,255,0.12)); transform:translate(-50%,-50%); }

      .header { position: sticky; top:0; z-index:40; backdrop-filter: blur(10px); background: rgba(0,0,0,0.45); border-bottom:1px solid rgba(255,255,255,0.06); }
      .nav-container { max-width:1200px; margin:auto; padding:12px 24px; display:flex; align-items:center; justify-content:space-between; }
      .logo { font-size:22px; font-weight:800; color:#fff; text-decoration:none; }
      .nav-links { display:flex; gap:20px; align-items:center; }
      .nav-links a { color:#d1d5db; text-decoration:none; font-weight:500; }
      .nav-links a:hover { color:#8b5cf6; }
      .profile-box { display:flex; gap:10px; align-items:center; background: rgba(30,41,59,0.5); padding:6px 10px; border-radius:10px; border:1px solid rgba(255,255,255,0.04); color:#e2e8f0; text-decoration:none; }
      .profile-icon { width:32px; height:32px; border-radius:50%; background: rgba(120,140,255,0.26); display:flex; align-items:center; justify-content:center; }

      .contact-hero { padding-top:110px; padding-bottom:26px; text-align:center; position:relative; z-index:40; }
      .contact-title { font-size:40px; font-weight:800; margin-bottom:6px; }
      .contact-sub { color:#cbd5e1; margin-top:6px; margin-bottom:18px; }

      .contact-info-cards { max-width:1000px; margin:18px auto 0; display:flex; gap:16px; justify-content:center; flex-wrap:wrap; z-index:30; }
      .info-card { background: rgba(30,41,59,0.45); padding:14px 18px; border-radius:12px; display:flex; gap:12px; align-items:center; border:1px solid rgba(255,255,255,0.04); min-width:220px; }
      .info-icon { font-size:24px; }
      .info-title { font-weight:700; }
      .info-text { color:#cbd5e1; font-size:14px; }

      .contact-form-section { padding:36px 0 80px; }
      .form-wrapper { max-width:1000px; margin:0 auto; padding:0 20px; }
      .section-title { font-size:28px; font-weight:800; text-align:center; margin-bottom:16px; }

      .contact-form { background: rgba(20,20,30,0.45); padding:20px; border-radius:12px; border:1px solid rgba(255,255,255,0.04); }
      /* Increased gap to avoid border touching and ensured proper box-sizing */
      .form-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:12px; align-items:center; }

      /* CORE FIXES: make sure borders don't visually overlap,
         use background-clip to keep background inside rounded corners,
         box-sizing so widths behave consistently. */
      .input {
        width:100%;
        box-sizing: border-box;
        padding:12px 14px;
        border-radius:10px;
        border:1px solid rgba(255,255,255,0.08);
        background: rgba(10,10,15,0.62);
        color:#e2e8f0;
        outline:none;
        background-clip: padding-box;
        -webkit-background-clip: padding-box;
        transition: box-shadow 0.12s ease, transform 0.08s ease;
      }

      .input:focus {
        box-shadow: 0 6px 24px rgba(99,102,241,0.12);
        border-color: rgba(129,140,248,0.9);
        transform: translateY(-1px);
      }

      .textarea { resize:none; min-height:120px; margin-bottom:12px; }

      .callback-row { display:flex; gap:10px; align-items:center; color:#d1d5db; margin-bottom:12px; }
      .callback-row input { width:16px; height:16px; }

      .form-actions { display:flex; gap:12px; align-items:center; margin-top:8px; }
      .btn-primary { padding:12px 20px; background: linear-gradient(90deg,#818cf8,#6366f1); color:white; border-radius:10px; border:none; font-weight:600; cursor:pointer; }
      .btn-outline { padding:10px 18px; border-radius:10px; border:1px solid rgba(255,255,255,0.06); color:#cbd5e1; text-decoration:none; }

      .note { margin-top:12px; color:#9ca3af; font-size:13px; }

      .footer { border-top:1px solid rgba(255,255,255,0.06); padding:28px 0; background: rgba(0,0,0,0.15); }
      .footer-inner { max-width:1200px; margin:auto; padding:0 20px; display:flex; justify-content:space-between; align-items:center; color:#cbd5e1; gap:12px; flex-wrap:wrap; }

      @media (max-width: 900px) {
        .nav-links { display: none; }
        .form-row { grid-template-columns: 1fr; gap:12px; }
        .contact-info-cards { flex-direction:column; align-items:center; }
        .contact-title { font-size:28px; }
      }
      `}</style>
    </div>
  );
}
