import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../components/AuthContext";
import services from "./components/services";
import api from "../../utils/axiosConfig";
import CarbonFootprintDash from "../cfdash/cfdash";

// Modular Sections
import ImpactStats from "./components/ImpactStats";
import HowItWorks from "./components/HowItWorks";
import CommunitySection from "./components/CommunitySection";
import FinalCTA from "./components/FinalCTA";

// Leaflet Map
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Lucide Icons
import {
  ScanLine,
  Bot,
  Users,
  Calendar,
  ShoppingBag,
  GraduationCap,
  Recycle,
  Coins,
  Trophy,
  ShieldCheck,
  ArrowRight,
  UploadCloud,
  Compass,
  Radio,
  CheckCircle2,
  ChevronRight,
  Leaf,
  Layers,
} from "lucide-react";

import "./Home.css";

// Custom CSS-based marker icons for Leaflet
const createMarkerIcon = (status) => {
  return L.divIcon({
    className: `marker-pin marker-pin--${status || "pending"}`,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -38],
  });
};

const HERO_IMAGES = [
  "/assets/HeroImg1.jpg",
  "/assets/HeroImg2.jpg",
  "/assets/HeroImg3.jpg",
];

// Icon mapping for services
const SERVICE_ICONS = {
  ScanLine,
  Bot,
  Users,
  Calendar,
  ShoppingBag,
  GraduationCap,
  Recycle,
  Coins,
  Trophy,
  ShieldCheck,
};

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [allReports, setAllReports] = useState([]);
  const [franchisees, setFranchisees] = useState([]);
  const [events, setEvents] = useState([]);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [location, setLocation] = useState({ latitude: null, longitude: null });

  // Background image rotation every 5 seconds
  useEffect(() => {
    const slideshowTimer = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(slideshowTimer);
  }, []);

  // Fetch Reports, Events, Geolocation, and Franchisees
  useEffect(() => {
    let isMounted = true;

    const getReports = async () => {
      try {
        const res = await api.get("/reports");
        if (isMounted && res.data?.reports) {
          const sorted = res.data.reports.sort(
            (a, b) => new Date(b.time) - new Date(a.time)
          );
          setAllReports(sorted);
        }
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      }
    };

    const getEvents = async () => {
      try {
        const res = await api.get("/events");
        if (isMounted && Array.isArray(res.data)) {
          const validEvents = res.data.filter(
            (e) =>
              e?.eventLocationData?.coordinates &&
              Array.isArray(e.eventLocationData.coordinates) &&
              e.eventLocationData.coordinates.length === 2 &&
              typeof e.eventLocationData.coordinates[0] === "number" &&
              typeof e.eventLocationData.coordinates[1] === "number"
          );
          setEvents(validEvents);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };

    const getUserLocation = () => {
      if (!navigator.geolocation) {
        // Fallback default coordinates (New Delhi / India Center)
        setLocation({ latitude: 28.6139, longitude: 77.209 });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (isMounted) {
            setLocation({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            });
          }
        },
        (err) => {
          console.warn("Geolocation fallback applied:", err.message);
          // Fallback coordinates if user denies permission so map still displays
          if (isMounted) {
            setLocation({ latitude: 28.6139, longitude: 77.209 });
          }
        },
        { enableHighAccuracy: false, timeout: 8000 }
      );
    };

    const getFranchisees = async () => {
      try {
        const res = await api.get("/recycle/franchisees");
        if (isMounted && res.data?.franchisees) {
          setFranchisees(res.data.franchisees);
        }
      } catch (err) {
        console.error("Failed to fetch franchisees:", err);
      }
    };

    getReports();
    getEvents();
    getUserLocation();
    getFranchisees();

    return () => {
      isMounted = false;
    };
  }, []);

  const heroStyle = useMemo(
    () => ({
      backgroundImage: `linear-gradient(135deg, rgba(6, 78, 59, 0.82) 0%, rgba(10, 104, 71, 0.65) 50%, rgba(15, 23, 42, 0.78) 100%), url(${HERO_IMAGES[currentImgIndex]})`,
    }),
    [currentImgIndex]
  );

  const resolvedReportsCount = useMemo(
    () => allReports.filter((r) => r.status === "resolved").length,
    [allReports]
  );

  return (
    <main className="home-page" id="main-content">
      {/* ===================================================================
          1. HERO SECTION
          =================================================================== */}
      <section className="home__hero" style={heroStyle} aria-label="Hero Introduction">
        <div className="home__hero-overlay-grid" aria-hidden="true" />

        <div className="container home__hero-inner">
          <div className="home__hero-content">
            {/* Eyebrow badge */}
            <div className="hero-eyebrow">
              <span className="hero-eyebrow__dot" />
              <span>SMART CITY • SUSTAINABILITY • COMMUNITY ACTION</span>
            </div>

            {/* Main Headline */}
            <h1 className="home__hero-title">
              Cleaner Cities. <br />
              <span className="hero-title-accent">Smarter Futures.</span>
            </h1>

            {/* Supporting Copy */}
            <p className="home__hero-subtitle">
              Urban Pulse is an intelligent dual-source waste management ecosystem.
              We leverage real-time Computer Vision (YOLOv8) and citizen participation
              to detect hotspots, dispatch municipal crews, and reward civic action.
            </p>

            {/* Hero CTAs */}
            <div className="home__hero-actions">
              <a href="#services-section" className="btn btn--primary btn--lg hero-btn-main">
                <Compass size={18} />
                <span>Explore Services</span>
              </a>

              {!user ? (
                <>
                  <Link to="/signup" className="btn btn--secondary btn--lg">
                    <span>Get Started</span>
                    <ArrowRight size={17} />
                  </Link>
                  <Link to="/login" className="hero-text-link">
                    Already a member? Sign In →
                  </Link>
                </>
              ) : (
                <Link to="/upload" className="btn btn--secondary btn--lg">
                  <UploadCloud size={18} />
                  <span>Report Garbage</span>
                </Link>
              )}
            </div>

            {/* Micro Feature Proof */}
            <div className="hero-feature-tags">
              <span className="feature-tag">
                <CheckCircle2 size={14} /> Dual-Source Monitoring
              </span>
              <span className="feature-tag">
                <CheckCircle2 size={14} /> Real-Time Leaflet GIS
              </span>
              <span className="feature-tag">
                <CheckCircle2 size={14} /> GreenCoins Marketplace
              </span>
            </div>
          </div>

          {/* Floating Smart Status Card */}
          <div className="home__hero-card-wrap">
            <div className="hero-status-card">
              <div className="status-card__header">
                <div className="status-card__pulse-box">
                  <span className="pulse-dot" />
                  <span className="pulse-text">Civic Feed Active</span>
                </div>
                <span className="status-card__tag">Live Telemetry</span>
              </div>

              <div className="status-card__body">
                <div className="telemetry-item">
                  <span className="telemetry-label">AI Surveillance</span>
                  <span className="telemetry-value telemetry-value--green">
                    <Bot size={15} /> YOLOv8 Model Ready
                  </span>
                </div>
                <div className="telemetry-item">
                  <span className="telemetry-label">Active Reports Tracked</span>
                  <span className="telemetry-value">{allReports.length} Incidents</span>
                </div>
                <div className="telemetry-item">
                  <span className="telemetry-label">Municipal Events</span>
                  <span className="telemetry-value">{events.length} Active Drives</span>
                </div>
                <div className="telemetry-item">
                  <span className="telemetry-label">Recycling Hubs</span>
                  <span className="telemetry-value">{franchisees.length} Verified Centers</span>
                </div>
              </div>

              <div className="status-card__footer">
                <a href="#map-section" className="status-card__btn">
                  <span>Open Live Command Map</span>
                  <ChevronRight size={15} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          2. IMPACT / CITY STATISTICS
          =================================================================== */}
      <ImpactStats
        reportsCount={allReports.length}
        resolvedCount={resolvedReportsCount}
        eventsCount={events.length}
        franchiseesCount={franchisees.length}
      />

      {/* ===================================================================
          3. LIVE CITY PULSE (LEAFLET COMMAND MAP)
          =================================================================== */}
      <section id="map-section" className="live-pulse-section" aria-label="Live City Pulse Map">
        <div className="container">
          <div className="live-pulse__header">
            <div className="badge badge--primary">
              <Radio size={13} />
              <span>Smart City Command Monitor</span>
            </div>
            <h2 className="live-pulse__title">Live City Pulse</h2>
            <p className="live-pulse__subtitle">
              Explore civic waste reports, citizen-led community cleanups, and authorized
              recycling drop-off centers across the city in real-time.
            </p>
          </div>

          {/* Interactive Map Legend Bar */}
          <div className="map-legend-bar" role="region" aria-label="Map Legend">
            <span className="legend-label">Map Legend:</span>
            <div className="legend-items">
              <span className="legend-item">
                <span className="legend-marker legend-marker--pending" />
                <span>Pending Report</span>
              </span>
              <span className="legend-item">
                <span className="legend-marker legend-marker--allotted" />
                <span>Crew Dispatched</span>
              </span>
              <span className="legend-item">
                <span className="legend-marker legend-marker--resolved" />
                <span>Resolved Incident</span>
              </span>
              <span className="legend-item">
                <span className="legend-marker legend-marker--event" />
                <span>Community Drive</span>
              </span>
              <span className="legend-item">
                <span className="legend-marker legend-marker--franchisee" />
                <span>Recycling Center</span>
              </span>
            </div>
          </div>

          {/* Map Frame Container */}
          <div className="map-frame">
            {location.latitude && location.longitude ? (
              <MapContainer
                center={[location.latitude, location.longitude]}
                zoom={13}
                scrollWheelZoom={false}
                className="live-pulse-map"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />

                {/* Report Markers */}
                {allReports.map((r) => {
                  if (
                    !r?.location?.coordinates ||
                    r.location.coordinates.length < 2
                  )
                    return null;
                  return (
                    <Marker
                      key={r._id}
                      position={[
                        r.location.coordinates[1],
                        r.location.coordinates[0],
                      ]}
                      icon={createMarkerIcon(r.status)}
                    >
                      <Popup className="pulse-popup">
                        <div className="popup-card">
                          <div className="popup-card__header">
                            <span className="popup-badge">Incident Report</span>
                            <span className={`status-pill status-pill--${r.status}`}>
                              {r.status || "pending"}
                            </span>
                          </div>
                          <div className="popup-card__id">
                            Ticket #{r._id ? r._id.slice(-6).toUpperCase() : "N/A"}
                          </div>
                          {r.time && (
                            <div className="popup-card__time">
                              {new Date(r.time).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                          )}
                          <Link to="/upload" className="popup-card__btn">
                            Report Similar Spot
                          </Link>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

                {/* Event Markers */}
                {events.map((ev) => (
                  <Marker
                    key={ev._id}
                    position={[
                      ev.eventLocationData.coordinates[1],
                      ev.eventLocationData.coordinates[0],
                    ]}
                    icon={createMarkerIcon("event")}
                  >
                    <Popup className="pulse-popup">
                      <div className="popup-card">
                        <div className="popup-card__header">
                          <span className="popup-badge popup-badge--event">
                            Civic Event
                          </span>
                        </div>
                        <strong className="popup-card__title">{ev.eventName}</strong>
                        <div className="popup-card__meta">
                          <span>Hosted by: {ev.eventHostedBy}</span>
                          <span>
                            Date:{" "}
                            {new Date(ev.eventDateTime).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span>
                            Attendees: {ev?.registrations?.length || 0} Citizens
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn btn--primary btn--sm popup-action-btn"
                          onClick={() => navigate(`/events/${ev._id}`)}
                        >
                          View Event Details
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Franchisee / Recycling Hub Markers */}
                {franchisees.map((f) => {
                  if (
                    !f?.location?.coordinates ||
                    f.location.coordinates.length < 2
                  )
                    return null;
                  return (
                    <Marker
                      key={f._id}
                      position={[
                        f.location.coordinates[1],
                        f.location.coordinates[0],
                      ]}
                      icon={createMarkerIcon("franchisee")}
                    >
                      <Popup className="pulse-popup">
                        <div className="popup-card">
                          <div className="popup-card__header">
                            <span className="popup-badge popup-badge--hub">
                              Recycling Hub
                            </span>
                          </div>
                          <strong className="popup-card__title">{f.centerName}</strong>
                          <div className="popup-card__meta">
                            <span>
                              Manager: {f.owner?.fname} {f.owner?.lname}
                            </span>
                            {f.phone && <span>Contact: {f.phone}</span>}
                            {f.pincode && <span>Pincode: {f.pincode}</span>}
                          </div>
                          <Link to="/recycle" className="popup-card__btn">
                            Book Drop-off
                          </Link>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            ) : (
              <div className="map-loading-state">
                <span className="loading-spinner" />
                <p>Initializing Smart City Geospatial Layer...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===================================================================
          4. SMART CITY SERVICES
          =================================================================== */}
      <section id="services-section" className="services-section" aria-label="Platform Services">
        <div className="container">
          <div className="services__header">
            <div className="badge badge--primary">
              <Layers size={13} />
              <span>Full-Spectrum Solutions</span>
            </div>
            <h2 className="services__title">Smart City Cleanliness Services</h2>
            <p className="services__subtitle">
              Ten integrated modules designed for citizens, field sanitation teams,
              and municipal administrators.
            </p>
          </div>

          <div className="services__grid">
            {services.map((service) => {
              const IconComp = SERVICE_ICONS[service.iconKey] || ScanLine;

              return (
                <article key={service.id} className="service-card">
                  <div className="service-card__top">
                    <div className="service-card__icon-box">
                      <IconComp size={22} />
                    </div>
                    <span className="service-card__tag">{service.tag}</span>
                  </div>

                  <h3 className="service-card__title">{service.title}</h3>
                  <p className="service-card__desc">{service.frontDesc}</p>

                  <div className="service-card__capabilities">
                    <span className="capabilities-label">{service.backTitle}:</span>
                    <ul className="capabilities-list">
                      {service.backDetails.slice(0, 3).map((detail, idx) => (
                        <li key={idx} className="capability-item">
                          <CheckCircle2 size={14} className="capability-check" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="service-card__footer">
                    <Link to={service.route} className="service-card__link">
                      <span>Access Service</span>
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================================================================
          5. HOW URBAN PULSE WORKS
          =================================================================== */}
      <HowItWorks />

      {/* ===================================================================
          6. COMMUNITY & GAMIFICATION
          =================================================================== */}
      <CommunitySection />

      {/* ===================================================================
          7. CARBON FOOTPRINT DASHBOARD
          =================================================================== */}
      <section className="carbon-section" aria-label="Environmental Calculator">
        <div className="container">
          <div className="carbon__intro-header">
            <div className="badge badge--primary">
              <Leaf size={13} />
              <span>Ecological Footprint Analytics</span>
            </div>
            <h2 className="carbon__intro-title">Measure Your Environmental Impact</h2>
            <p className="carbon__intro-subtitle">
              Calculate projected emissions reductions, energy conserved, and water saved
              by separating recyclables, organic waste, and hazardous scrap at the source.
            </p>
          </div>

          <div className="carbon__frame">
            <CarbonFootprintDash />
          </div>
        </div>
      </section>

      {/* ===================================================================
          8. FINAL CALL TO ACTION
          =================================================================== */}
      <FinalCTA user={user} />
    </main>
  );
}