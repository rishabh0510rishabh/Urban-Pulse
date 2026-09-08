import React from "react";
import { Camera, Truck, Trophy, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Discover & Report",
      tag: "Citizen Input",
      desc: "Spot an overflowing bin or roadside litter? Capture a photo with geo-location. YOLOv8 AI analyzes waste class in milliseconds.",
      highlights: ["Automatic GPS coordinate capture", "Instant YOLOv8 waste classification", "Generates trackable ticket ID"],
      icon: Camera,
      cta: { label: "Try Scanner", to: "/upload" },
    },
    {
      number: "02",
      title: "Dispatch & Resolve",
      tag: "Municipal Workflow",
      desc: "Reports are routed automatically to zonal sanitation officers and collection trucks with optimized routes.",
      highlights: ["Role-based OSP field dispatch", "Real-time route optimization", "Field photo proof upon resolution"],
      icon: Truck,
      cta: { label: "View Live Pulse", to: "#map-section" },
    },
    {
      number: "03",
      title: "Reward & Impact",
      tag: "Gamified Hygiene",
      desc: "Earn GreenCoins for every validated civic action. Track neighborhood cleanliness scores, climb leaderboards, and redeem rewards.",
      highlights: ["Earn verifiable GreenCoins", "Redeem on eco-supplies store", "Ward-level cleanliness scorecards"],
      icon: Trophy,
      cta: { label: "Explore Rewards", to: "/shop" },
    },
  ];

  return (
    <section className="how-it-works-section" aria-label="How Urban Pulse Works">
      <div className="container">
        <div className="how-it-works__header">
          <div className="badge badge--primary">
            <Sparkles size={13} />
            <span>Closed-Loop Civic Automation</span>
          </div>
          <h2 className="how-it-works__title">How Urban Pulse Works</h2>
          <p className="how-it-works__subtitle">
            Turning citizen awareness into verified municipal action through computer vision,
            geo-spatial dispatch, and gamified incentives.
          </p>
        </div>

        <div className="how-it-works__steps-grid">
          {steps.map((step, index) => {
            const IconComp = step.icon;
            return (
              <div key={step.number} className="step-card">
                <div className="step-card__top">
                  <span className="step-card__num">{step.number}</span>
                  <span className="step-card__tag">{step.tag}</span>
                </div>

                <div className="step-card__icon-wrap">
                  <IconComp size={28} />
                </div>

                <h3 className="step-card__title">{step.title}</h3>
                <p className="step-card__desc">{step.desc}</p>

                <ul className="step-card__highlights">
                  {step.highlights.map((item, idx) => (
                    <li key={idx} className="highlight-item">
                      <CheckCircle2 size={15} className="highlight-icon" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="step-card__footer">
                  {step.cta.to.startsWith("#") ? (
                    <a href={step.cta.to} className="step-card__link">
                      <span>{step.cta.label}</span>
                      <ArrowRight size={15} />
                    </a>
                  ) : (
                    <Link to={step.cta.to} className="step-card__link">
                      <span>{step.cta.label}</span>
                      <ArrowRight size={15} />
                    </Link>
                  )}
                </div>

                {index < steps.length - 1 && (
                  <div className="step-connector" aria-hidden="true" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
