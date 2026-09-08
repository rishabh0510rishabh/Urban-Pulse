import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, UploadCloud, UserPlus, Compass } from "lucide-react";

export default function FinalCTA({ user }) {
  return (
    <section className="final-cta-section" aria-label="Join Urban Pulse">
      <div className="container">
        <div className="final-cta__card">
          <div className="final-cta__decor" aria-hidden="true" />

          <div className="final-cta__content">
            <div className="badge badge--primary final-cta__badge">
              <Sparkles size={13} />
              <span>{user ? "Citizen Vanguard" : "Join The Cleanliness Revolution"}</span>
            </div>

            <h2 className="final-cta__title">
              {user
                ? "Keep Driving Measurable Change in Your Ward"
                : "Ready to Make Your City Cleaner and Greener?"}
            </h2>

            <p className="final-cta__desc">
              {user
                ? "Every geo-tagged report and segregated scrap batch improves city hygiene scorecards. Log your latest civic activity now."
                : "Join thousands of proactive citizens, municipal officers, and recycling partners using AI to keep our public spaces spotless."}
            </p>

            <div className="final-cta__actions">
              {user ? (
                <>
                  <Link to="/upload" className="btn btn--primary btn--lg">
                    <UploadCloud size={18} />
                    <span>Report Waste Incident</span>
                  </Link>
                  <a href="#services-section" className="btn btn--secondary btn--lg">
                    <Compass size={18} />
                    <span>Explore All Services</span>
                  </a>
                </>
              ) : (
                <>
                  <Link to="/signup" className="btn btn--primary btn--lg">
                    <UserPlus size={18} />
                    <span>Create Free Account</span>
                  </Link>
                  <a href="#services-section" className="btn btn--secondary btn--lg">
                    <Compass size={18} />
                    <span>Explore Platform</span>
                    <ArrowRight size={16} />
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
