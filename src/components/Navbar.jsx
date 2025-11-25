import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const burgerRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (!mobileOpen) return;
      const menu = mobileMenuRef.current;
      const burger = burgerRef.current;

      if (
        menu &&
        !menu.contains(e.target) &&
        burger &&
        !burger.contains(e.target)
      ) {
        setMobileOpen(false);
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="header">
        <div className="nav-container">
          {/* Logo */}
          <Link to="/" className="logo">
            SURE SUCCESS WALLAH
          </Link>

          {/* Desktop Nav */}
          <nav className="nav-links">
            <Link to="/home">Home</Link>
            <Link to="/content">Content</Link>
            <Link to="/library">Library</Link>
            <Link to="/contact">Contacts</Link>
            <Link to="/courses">Courses</Link>
          </nav>

          {/* Profile */}
          <Link to="/profile" className="profile-box desktop-profile">
            <div className="profile-icon">S</div>
            <div>Sunil Saurabh</div>
          </Link>

          {/* Hamburger */}
          <button
            ref={burgerRef}
            className={`hamburger ${mobileOpen ? "is-open" : ""}`}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span className="burger-line" />
            <span className="burger-line" />
            <span className="burger-line" />
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          ref={mobileMenuRef}
          className={`mobile-menu ${mobileOpen ? "open" : ""}`}
        >
          <nav className="mobile-links">
            <Link to="/home" onClick={() => setMobileOpen(false)}>
              Home
            </Link>
            <Link to="/content" onClick={() => setMobileOpen(false)}>
              Content
            </Link>
            <Link to="/library" onClick={() => setMobileOpen(false)}>
              Library
            </Link>
            <Link to="/contact" onClick={() => setMobileOpen(false)}>
              Contacts
            </Link>
            <Link to="/courses" onClick={() => setMobileOpen(false)}>
              Courses
            </Link>

            <Link to="/profile" onClick={() => setMobileOpen(false)}>
              <div className="profile-icon">S</div> Sunil Saurabh
            </Link>
          </nav>
        </div>
      </header>

      {/* CSS */}
      <style>{`
/* --------------------------------------------------------
   NAVBAR STYLES
-------------------------------------------------------- */

.header {
  position: sticky;
  top: 0;
  z-index: 200;
  backdrop-filter: blur(10px);
  background: rgba(0,0,0,0.45);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.nav-container {
  max-width: 1200px;
  margin: auto;
  padding: 14px 26px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo */
.logo {
  font-size: 22px;
  font-weight: 800;
  text-decoration: none;
  color: #ffffff;
}

/* Desktop Nav */
.nav-links {
  display: flex;
  gap: 24px;
}

.nav-links a {
  color: #d1d5db;
  text-decoration: none;
  font-weight: 600;
}

.nav-links a:hover {
  color: #8b5cf6;
}

/* Profile */
.profile-box {
  background: rgba(30,41,59,0.5);
  padding: 6px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  color: #fff;
  text-decoration: none;
  gap: 8px;
}

.profile-icon {
  width: 32px;
  height: 32px;
  background: rgba(120,140,255,0.26);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* --------------------------------------------------------
   HAMBURGER (MOBILE)
-------------------------------------------------------- */

.hamburger {
  display: none;
  width: 42px;
  height: 36px;
  background: rgba(255,255,255,0.06);
  border: none;
  border-radius: 10px;
  padding: 6px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
}

.hamburger:focus {
  outline: none;
}

.burger-line {
  width: 22px;
  height: 3px;
  background: #ffffff;
  margin: 3px 0;
  border-radius: 3px;
  transition: 0.2s;
}

/* Hamburger animation */
.hamburger.is-open .burger-line:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}

.hamburger.is-open .burger-line:nth-child(2) {
  opacity: 0;
}

.hamburger.is-open .burger-line:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}

/* --------------------------------------------------------
   MOBILE MENU
-------------------------------------------------------- */

.mobile-menu {
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  background: rgba(12,14,22,0.97);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  padding: 20px;
  transform: translateY(-20px);
  opacity: 0;
  pointer-events: none;
  transition: 0.2s ease;
  z-index: 300;
}

.mobile-menu.open {
  transform: translateY(0);
  opacity: 1;
  pointer-events: auto;
}

.mobile-links {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 400px;
  margin: auto;
}

.mobile-links a {
  padding: 12px 14px;
  background: rgba(255,255,255,0.04);
  color: #e2e8f0;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
}

.mobile-links a:hover {
  background: rgba(129,140,248,0.20);
}

/* --------------------------------------------------------
   RESPONSIVE
-------------------------------------------------------- */

@media (max-width: 900px) {
  .nav-links {
    display: none;
  }

  .desktop-profile {
    display: none;
  }

  .hamburger {
    display: flex;
  }
}
      `}</style>
    </>
  );
}
