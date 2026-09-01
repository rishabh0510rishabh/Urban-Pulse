import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Github } from "lucide-react";
import { useAuth } from "./AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const location = useLocation();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const [servicesOpen, setServicesOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setMenuOpen(false);
    setServicesOpen(false);
  }, [location]);

  useEffect(() => {
    const isHomePage = location.pathname === "/";

    if (!isHomePage) {
      setIsHeroVisible(false);
      return;
    }

    const handleScroll = () => {
      const heroSection = document.querySelector('.home__hero');
      if (heroSection) {
        const heroHeight = heroSection.offsetHeight;
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        // Trigger transition once half of the hero section is scrolled
        setIsHeroVisible(scrollY < heroHeight * 0.5);
      } else {
        setIsHeroVisible(false);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setServicesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navLinks = [
    { to: "/", label: "Home", type: "always" },
    { to: "/login", label: "Login", type: "guest" },
    { to: "/signup", label: "Signup", type: "guest" },
    { to: "/profile", label: "Profile", type: "user" },
    { to: "/osp", label: "OSP", type: "user" },
    { to: "/franchisee-dashboard", label: "Franchisee Dashboard", type: "user" },
    { to: "/officials", label: "Officials", type: "user" },
    { to: "/vendor", label: "Vendor", type: "user" },
  ];

  const serviceLinks = [
    { to: "/upload", label: "Upload" },
    { to: "/events", label: "Events" },
    { to: "/recycle", label: "Recycle & Earn" },
    { to: "/training", label: "Training" },
    { to: "/committee", label: "Committee" },
    { to: "/shop", label: "Shop" },
  ];

  const filteredLinks = navLinks.filter(link => {
    if (link.type === "always") return true;
    if (user && link.type === "user") return true;
    if (!user && link.type === "guest") return true;
    return false;
  });

  const isServiceActive = serviceLinks.some(link => location.pathname === link.to);

  return (
    <header className={`navbar ${isHeroVisible ? 'navbar--hero-mode' : 'navbar--compact'}`}>
      <div className="navbar__container">
        <Link to="/" className="navbar__brand" aria-label="Urban Pulse Home">
          <div className={`brand__morph ${isHeroVisible ? "brand__morph--hero" : "brand__morph--compact"}`}>
            <div className="brand__icon-box">
              <img
                src="/LogoIcon.svg"
                alt="Urban Pulse Emblem"
                className="brand__icon-img"
              />
            </div>
            <div className="brand__text-box">
              <span className="brand__title">
                URBAN <span className="brand__title-accent">PULSE</span>
              </span>
              <span className="brand__tagline">SMART CLEANLINESS</span>
            </div>
          </div>
        </Link>

        <nav className={`navbar__nav ${menuOpen ? "navbar__nav--open" : ""}`}>
          <a
            href="https://github.com/rishabh0510rishabh/Urban-Pulse"
            target="_blank"
            rel="noopener noreferrer"
            className="nav__link nav__github-btn"
            aria-label="GitHub Repository"
            title="GitHub Repository"
            onClick={() => setMenuOpen(false)}
          >
            <Github size={19} className="nav__github-icon" />
            <span>GitHub</span>
          </a>

          {filteredLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav__link ${location.pathname === link.to ? "active" : ""}`}
            >
              {link.label}
            </Link>
          ))}

          {user && (
            <div
              className="nav__dropdown"
              ref={dropdownRef}
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button
                className={`nav__link nav__dropdown-trigger ${isServiceActive ? "active" : ""}`}
                onClick={() => setServicesOpen(!servicesOpen)}
                aria-expanded={servicesOpen}
              >
                Services
                <span className={`dropdown-arrow ${servicesOpen ? "dropdown-arrow--open" : ""}`}>▼</span>
              </button>

              {servicesOpen && (
                <div className="nav__dropdown-menu">
                  {serviceLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`nav__dropdown-item ${location.pathname === link.to ? "active" : ""}`}
                      onClick={() => {
                        setServicesOpen(false);
                        setMenuOpen(false);
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        <button
          className={`navbar__toggle ${menuOpen ? "navbar__toggle--open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <span className="hamburger__line hamburger__line--1"></span>
          <span className="hamburger__line hamburger__line--2"></span>
          <span className="hamburger__line hamburger__line--3"></span>
        </button>
      </div>
    </header>
  );
}