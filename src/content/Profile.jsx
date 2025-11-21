import React from "react";
import { Link } from "react-router-dom";

export default function Profile() {
  return (
    <div className="page-container">

      {/* =====================================================
           FULL CSS (SELF-CONTAINED, SAME THEME AS HOME)
      ===================================================== */}
      <style>{`
/* --------------------------------------------------------
   GLOBAL PAGE BACKGROUND
-------------------------------------------------------- */
.page-container {
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  background: linear-gradient(180deg, #0f172a 0%, #000000 50%, #1e293b 100%);
  color: #e2e8f0;
  position: relative;
  overflow-x: hidden;
}

/* --------------------------------------------------------
   BLOBS
-------------------------------------------------------- */
.blob-container {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

.blob-container > div {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.55;
  transition: transform 0.8s ease-out;
}

.blob-1 {
  width: 520px;
  height: 520px;
  left: -160px;
  top: -160px;
  background: radial-gradient(circle, rgba(79,70,229,0.25), rgba(168,85,247,0.12));
}

.blob-2 {
  width: 640px;
  height: 640px;
  right: -220px;
  bottom: -220px;
  background: radial-gradient(circle, rgba(140,90,246,0.25), rgba(99,102,241,0.12));
}
.blob-3 {
  width: 440px;
  height: 440px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(120,160,255,0.22), rgba(100,120,255,0.12));
}

/* --------------------------------------------------------
   HEADER
-------------------------------------------------------- */
.header {
  backdrop-filter: blur(10px);
  background: rgba(0,0,0,0.5);
  border-bottom: 1px solid rgba(255,255,255,0.08);
  padding: 16px 0;
  position: sticky;
  top: 0;
  z-index: 50;
}

.nav-container {
  max-width: 1200px;
  margin: auto;
  padding: 0 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 28px;
  font-weight: 800;
  color: #fff;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 24px;
}

.nav-links a {
  color: #d1d5db;
  text-decoration: none;
}

.nav-links a:hover {
  color: #8b5cf6;
}

.profile-box {
  background: rgba(81, 92, 128, 0.5);
  padding: 8px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  gap: 10px;
  color : #fff;
}

.profile-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(120,140,255,0.3);
  color: #fff;
}

/* --------------------------------------------------------
   PROFILE HERO
-------------------------------------------------------- */
.hero {
  max-width: 1200px;
  margin: auto;
  padding: 100px 28px 70px;
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 50px;
  align-items: center;
}

.hero-title {
  font-size: 44px;
  font-weight: 800;
}

.hero-text {
  margin-top: 18px;
  font-size: 18px;
  color: #cbd5e1;
  max-width: 580px;
}

.hero-buttons {
  margin-top: 26px;
  display: flex;
  gap: 16px;
}

.btn-primary {
  padding: 14px 26px;
  border-radius: 12px;
  text-decoration: none;
  color: white;
  background: linear-gradient(90deg,#818cf8,#6366f1);
}

.btn-outline {
  padding: 14px 26px;
  border-radius: 12px;
  border: 1px solid #818cf8;
  text-decoration: none;
  color: #818cf8;
}

.btn-outline:hover {
  background: rgba(129,140,255,0.15);
}

/* metrics */
.metrics-grid {
  margin-top: 40px;
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 20px;
}

.metric-card {
  padding: 18px;
  background: rgba(30,41,59,0.4);
  border-radius: 12px;
  text-align: center;
}

.metric-number {
  font-size: 24px;
  font-weight: 700;
}

.metric-label {
  font-size: 14px;
  color: #94a3b8;
}

/* Right card */
.hero-card {
  border-radius: 20px;
  padding: 24px;
  background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(99,102,241,0.15));
  border: 1px solid rgba(140,120,255,0.14);
}

.hero-card-inner {
  aspect-ratio: 4/3;
  border-radius: 16px;
  background: rgba(99,102,241,0.25);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.hero-card-title {
  font-size: 20px;
  margin-top: 10px;
}

.hero-card-desc {
  opacity: 0.8;
  font-size: 14px;
}

/* features */
.feature-list {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.feature-item {
  background: rgba(30,41,59,0.45);
  padding: 12px;
  border-radius: 12px;
}

/* --------------------------------------------------------
   ABOUT SECTION
-------------------------------------------------------- */
.about {
  padding: 80px 0;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.section-title {
  text-align: center;
  font-size: 36px;
  font-weight: 700;
}

.about-grid {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 28px;
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 26px;
}

.about-box {
  background: rgba(30,41,59,0.45);
  padding: 24px;
  border-radius: 16px;
}

/* --------------------------------------------------------
   FOOTER
-------------------------------------------------------- */
.footer {
  padding: 40px 0;
  border-top: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.25);
}

.footer-inner {
  max-width: 1200px;
  margin: auto;
  padding: 0 28px;
  display: flex;
  justify-content: space-between;
}
      `}</style>

      {/* BACKGROUND BLOBS */}
      <div className="blob-container">
        <div className="blob-1"></div>
        <div className="blob-2"></div>
        <div className="blob-3"></div>
      </div>

      {/* HEADER */}
      <header className="header">
        <div className="nav-container">
          <Link to="/" className="logo">SURE SUCCESS WALLAH</Link>

          <nav className="nav-links">
            <Link to="/home">Home</Link>
            <Link to="/library">Library</Link>
            <Link to="/content">Content</Link>
            <Link to="/contacts">Contacts</Link>
            <Link to="/courses">Courses</Link>
          </nav>

          <Link to="/profile" className="profile-box">
            <div className="profile-icon">S</div>
            <div>SUNIL SAURABH</div>
          </Link>
        </div>
      </header>

      {/* ===========================
          PROFILE HERO
      ============================ */}
      <section className="hero">
        <div>
          <h1 className="hero-title">Sunil Saurabh — BPSC Mentor</h1>
          <p className="hero-text">
            Founder of SureSuccessWallah. Specialist in BPSC Prelims, Mains & Interview preparation.
            Known for structured GS teaching, Bihar-specific notes and daily answer writing program.
          </p>

          <div className="hero-buttons">
            <Link to="/library" className="btn-primary">BPSC Courses</Link>
            <a className="btn-outline" href="#contact">Contact</a>
          </div>

          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-number">7+ yrs</div>
              <div className="metric-label">Experience</div>
            </div>
            <div className="metric-card">
              <div className="metric-number">5000+</div>
              <div className="metric-label">Students</div>
            </div>
            <div className="metric-card">
              <div className="metric-number">45+</div>
              <div className="metric-label">Toppers</div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <aside>
          <div className="hero-card">
            <div className="hero-card-inner">
              <div style={{ fontSize: "70px" }}>📘</div>
              <div className="hero-card-title">BPSC Specialist</div>
              <div className="hero-card-desc">GS • History • Polity • Bihar GK</div>
            </div>

            <div className="feature-list">
              <div className="feature-item">Daily Answer Writing</div>
              <div className="feature-item">Current Affairs Class</div>
            </div>
          </div>
        </aside>
      </section>

      {/* ===========================
          ABOUT SECTION
      ============================ */}
      <section className="about">
        <h2 className="section-title">About the Mentor</h2>

        <div className="about-grid">
          <div className="about-box">
            <h3>Teaching Style</h3>
            <p>Concept → Notes → Test → Evaluation → Revision → PYQs</p>
          </div>

          <div className="about-box">
            <h3>Subjects Taught</h3>
            <ul>
              <li>Polity</li>
              <li>Bihar GK</li>
              <li>Modern History</li>
              <li>Economy</li>
            </ul>
          </div>

          <div className="about-box">
            <h3>Specialization</h3>
            <p>BPSC GS Integrated Program with deep focus on Bihar-specific topics.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div>© {new Date().getFullYear()} SureSuccessWallah — All rights reserved.</div>
          <div>
            <Link to="/privacy">Privacy</Link>{" "}
            | <Link to="/terms">Terms</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
