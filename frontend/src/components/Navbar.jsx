import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Github,
  ChevronDown,
  Menu,
  X,
  UploadCloud,
  Calendar,
  Recycle,
  GraduationCap,
  Users,
  ShoppingBag,
  User as UserIcon,
  LogIn,
  ShieldAlert,
  Store,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const location = useLocation();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  const dropdownRef = useRef(null);
  const mobileDrawerRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setServicesOpen(false);
    setMobileServicesOpen(false);
  }, [location.pathname]);

  // Scroll listener for sticky elevation
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setIsScrolled(scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setServicesOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setServicesOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const serviceLinks = [
    {
      to: "/upload",
      label: "Report Garbage",
      desc: "Upload geo-tagged waste incidents",
      icon: UploadCloud,
    },
    {
      to: "/events",
      label: "Community Events",
      desc: "Join civic cleanups & workshops",
      icon: Calendar,
    },
    {
      to: "/recycle",
      label: "Recycle & Earn",
      desc: "Exchange recyclable waste for rewards",
      icon: Recycle,
    },
    {
      to: "/training",
      label: "Training & Learn",
      desc: "Segregation guides & interactive game",
      icon: GraduationCap,
    },
    {
      to: "/committee",
      label: "Civic Committee",
      desc: "Collaborative municipal forum",
      icon: Users,
    },
    {
      to: "/shop",
      label: "Eco Marketplace",
      desc: "Redeem GreenCoins for eco supplies",
      icon: ShoppingBag,
    },
  ];

  // Role-specific navigation items
  const roleLinks = [];
  if (user) {
    if (user.role === "osp") {
      roleLinks.push({ to: "/osp", label: "OSP Dashboard", icon: LayoutDashboard });
    }
    if (user.role === "vendor") {
      roleLinks.push({ to: "/franchisee-dashboard", label: "Franchisee", icon: Store });
      roleLinks.push({ to: "/vendor", label: "Vendor Panel", icon: Store });
    }
    if (user.role === "admin" || user.role === "official") {
      roleLinks.push({ to: "/officials", label: "Officials Portal", icon: ShieldAlert });
    }
  }

  const isServiceActive = serviceLinks.some((link) => location.pathname === link.to);

  return (
    <header className={`navbar ${isScrolled ? "navbar--scrolled" : "navbar--top"}`}>
      <div className="navbar__container">
        {/* Brand Logo */}
        <Link to="/" className="navbar__brand" aria-label="Urban Pulse Home">
          <div className="brand__badge">
            <img
              src="/LogoIcon.svg"
              alt="Urban Pulse Emblem"
              className="brand__emblem"
              width="36"
              height="36"
            />
          </div>
          <div className="brand__text-wrap">
            <div className="brand__title">
              URBAN <span className="brand__title-accent">PULSE</span>
            </div>
            <div className="brand__tagline">CIVIC CLEANLINESS PLATFORM</div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="navbar__nav-desktop" aria-label="Primary Navigation">
          <Link
            to="/"
            className={`nav-item ${location.pathname === "/" ? "nav-item--active" : ""}`}
          >
            Home
          </Link>

          {/* Services Dropdown */}
          <div
            className="nav-dropdown"
            ref={dropdownRef}
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button
              type="button"
              className={`nav-item nav-dropdown__trigger ${isServiceActive ? "nav-item--active" : ""}`}
              onClick={() => setServicesOpen(!servicesOpen)}
              aria-expanded={servicesOpen}
              aria-haspopup="true"
            >
              <span>Services</span>
              <ChevronDown
                size={16}
                className={`nav-dropdown__chevron ${servicesOpen ? "nav-dropdown__chevron--open" : ""}`}
              />
            </button>

            {servicesOpen && (
              <div className="nav-dropdown__menu" role="menu">
                <div className="nav-dropdown__header">
                  <span className="dropdown-label">Civic & Sustainability Services</span>
                </div>
                <div className="nav-dropdown__grid">
                  {serviceLinks.map((link) => {
                    const IconComponent = link.icon;
                    const isActive = location.pathname === link.to;
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        role="menuitem"
                        className={`dropdown-card ${isActive ? "dropdown-card--active" : ""}`}
                        onClick={() => setServicesOpen(false)}
                      >
                        <div className="dropdown-card__icon">
                          <IconComponent size={18} />
                        </div>
                        <div className="dropdown-card__content">
                          <div className="dropdown-card__title">{link.label}</div>
                          <div className="dropdown-card__desc">{link.desc}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <Link
            to="/events"
            className={`nav-item ${location.pathname.startsWith("/events") ? "nav-item--active" : ""}`}
          >
            Events
          </Link>

          <Link
            to="/training"
            className={`nav-item ${location.pathname.startsWith("/training") ? "nav-item--active" : ""}`}
          >
            Training
          </Link>

          <Link
            to="/shop"
            className={`nav-item ${location.pathname === "/shop" ? "nav-item--active" : ""}`}
          >
            Shop
          </Link>

          {/* Role-Specific Direct Links */}
          {roleLinks.map((roleLink) => (
            <Link
              key={roleLink.to}
              to={roleLink.to}
              className={`nav-item nav-item--role ${location.pathname.startsWith(roleLink.to) ? "nav-item--active" : ""}`}
            >
              {roleLink.label}
            </Link>
          ))}

          {/* GitHub Repository Link */}
          <a
            href="https://github.com/rishabh0510rishabh/Urban-Pulse"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-github-link"
            aria-label="View source on GitHub"
            title="Urban Pulse GitHub Repository"
          >
            <Github size={18} />
            <span>GitHub</span>
          </a>
        </nav>

        {/* Right CTA / Auth Controls */}
        <div className="navbar__actions">
          {user ? (
            <Link to="/profile" className="btn btn--primary btn--sm nav-auth-btn">
              <UserIcon size={16} />
              <span>{user.fname ? `${user.fname}` : "My Profile"}</span>
            </Link>
          ) : (
            <div className="nav-guest-btns">
              <Link to="/login" className="btn btn--outline btn--sm">
                <LogIn size={15} />
                <span>Login</span>
              </Link>
              <Link to="/signup" className="btn btn--primary btn--sm">
                <span>Get Started</span>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            className={`navbar__hamburger ${mobileMenuOpen ? "navbar__hamburger--active" : ""}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Navigation Drawer */}
      <div
        id="mobile-navigation-drawer"
        ref={mobileDrawerRef}
        className={`mobile-drawer ${mobileMenuOpen ? "mobile-drawer--open" : ""}`}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="mobile-drawer__header">
          <div className="brand__badge">
            <img src="/LogoIcon.svg" alt="Urban Pulse Emblem" width="30" height="30" />
          </div>
          <span className="mobile-drawer__brand-title">URBAN PULSE</span>
          <button
            type="button"
            className="mobile-drawer__close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mobile-drawer__body">
          <div className="mobile-drawer__nav-list">
            <Link
              to="/"
              className={`mobile-nav-link ${location.pathname === "/" ? "mobile-nav-link--active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>

            {/* Mobile Accordion for Services */}
            <div className="mobile-accordion">
              <button
                type="button"
                className={`mobile-nav-link mobile-accordion__trigger ${isServiceActive ? "mobile-nav-link--active" : ""}`}
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                aria-expanded={mobileServicesOpen}
              >
                <span>Services</span>
                <ChevronDown
                  size={18}
                  className={`mobile-accordion__chevron ${mobileServicesOpen ? "mobile-accordion__chevron--open" : ""}`}
                />
              </button>

              {mobileServicesOpen && (
                <div className="mobile-accordion__content">
                  {serviceLinks.map((link) => {
                    const IconComp = link.icon;
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        className={`mobile-subnav-link ${location.pathname === link.to ? "mobile-subnav-link--active" : ""}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <IconComp size={16} className="subnav-icon" />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <Link
              to="/events"
              className={`mobile-nav-link ${location.pathname.startsWith("/events") ? "mobile-nav-link--active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Events
            </Link>

            <Link
              to="/training"
              className={`mobile-nav-link ${location.pathname.startsWith("/training") ? "mobile-nav-link--active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Training
            </Link>

            <Link
              to="/shop"
              className={`mobile-nav-link ${location.pathname === "/shop" ? "mobile-nav-link--active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Shop
            </Link>

            {/* Role-Specific Links in Mobile Drawer */}
            {roleLinks.map((roleLink) => (
              <Link
                key={roleLink.to}
                to={roleLink.to}
                className={`mobile-nav-link mobile-nav-link--role ${location.pathname.startsWith(roleLink.to) ? "mobile-nav-link--active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {roleLink.label}
              </Link>
            ))}

            <a
              href="https://github.com/rishabh0510rishabh/Urban-Pulse"
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-nav-link mobile-nav-link--github"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Github size={18} />
              <span>GitHub Repository</span>
            </a>
          </div>
        </div>

        {/* Mobile Drawer Auth Footer */}
        <div className="mobile-drawer__footer">
          {user ? (
            <Link
              to="/profile"
              className="btn btn--primary btn--lg mobile-auth-btn"
              onClick={() => setMobileMenuOpen(false)}
            >
              <UserIcon size={18} />
              <span>My Profile ({user.fname || "User"})</span>
            </Link>
          ) : (
            <div className="mobile-guest-actions">
              <Link
                to="/signup"
                className="btn btn--primary btn--lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Create Account
              </Link>
              <Link
                to="/login"
                className="btn btn--outline btn--lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}