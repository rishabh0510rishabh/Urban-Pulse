import React from "react";
import { Link } from "react-router-dom";
import { Github, Globe, ArrowUpRight, ShieldCheck } from "lucide-react";
import "./Footer.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" aria-label="Site Footer">
      <div className="footer__container">
        {/* Brand Column */}
        <div className="footer__col footer__col--brand">
          <div className="footer__brand-head">
            <div className="brand__badge brand__badge--footer">
              <img src="/LogoIcon.svg" alt="Urban Pulse Emblem" width="32" height="32" />
            </div>
            <span className="footer__brand-name">URBAN PULSE</span>
          </div>
          <p className="footer__brand-desc">
            AI-powered smart waste management & civic cleanliness monitoring. Combining
            YOLOv8 Computer Vision surveillance and citizen action for cleaner, sustainable cities.
          </p>
          <div className="footer__badge-pill">
            <ShieldCheck size={14} />
            <span>Dual-Source Civic Intelligence</span>
          </div>
          <div className="footer__socials">
            <a
              href="https://github.com/rishabh0510rishabh/Urban-Pulse"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__social-btn"
              aria-label="GitHub Repository"
              title="GitHub Repository"
            >
              <Github size={18} />
            </a>
            <a
              href="/"
              className="footer__social-btn"
              aria-label="Urban Pulse Web"
              title="Urban Pulse Web Portal"
            >
              <Globe size={18} />
            </a>
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="footer__col">
          <h4 className="footer__title">Platform</h4>
          <ul className="footer__links">
            <li>
              <Link to="/" className="footer__link">
                Home
              </Link>
            </li>
            <li>
              <Link to="/upload" className="footer__link">
                Report Waste
              </Link>
            </li>
            <li>
              <Link to="/events" className="footer__link">
                Community Events
              </Link>
            </li>
            <li>
              <Link to="/training" className="footer__link">
                Training & Games
              </Link>
            </li>
            <li>
              <Link to="/shop" className="footer__link">
                Eco Marketplace
              </Link>
            </li>
          </ul>
        </div>

        {/* Civic Solutions Column */}
        <div className="footer__col">
          <h4 className="footer__title">Civic Services</h4>
          <ul className="footer__links">
            <li>
              <Link to="/recycle" className="footer__link">
                Recycle & Earn
              </Link>
            </li>
            <li>
              <Link to="/committee" className="footer__link">
                Civic Committee
              </Link>
            </li>
            <li>
              <Link to="/cfdash" className="footer__link">
                Carbon Calculator
              </Link>
            </li>
            <li>
              <Link to="/profile" className="footer__link">
                Citizen Profile
              </Link>
            </li>
          </ul>
        </div>

        {/* Open Source / Tech Stack Column */}
        <div className="footer__col">
          <h4 className="footer__title">Open Architecture</h4>
          <p className="footer__tech-desc">
            Built with React, Node.js REST API, Leaflet Maps, and Ultralytics YOLOv8 AI Service.
          </p>
          <a
            href="https://github.com/rishabh0510rishabh/Urban-Pulse"
            target="_blank"
            rel="noopener noreferrer"
            className="footer__github-badge"
          >
            <Github size={16} />
            <span>Contribute on GitHub</span>
            <ArrowUpRight size={14} />
          </a>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer__bottom">
        <div className="footer__bottom-container">
          <p className="footer__copyright">
            &copy; {currentYear} Urban Pulse • Smart Civic Waste Management Initiative.
          </p>
          <p className="footer__credits">
            Crafted for sustainable, data-driven urban hygiene
          </p>
        </div>
      </div>
    </footer>
  );
}