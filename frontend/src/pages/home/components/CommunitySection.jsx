import React from "react";
import { Link } from "react-router-dom";
import {
  Coins,
  Gamepad2,
  Trophy,
  Users,
  ArrowRight,
  Sparkles,
  Flame,
  CheckCircle,
} from "lucide-react";

export default function CommunitySection() {
  const flowSteps = [
    { label: "Take Civic Action", desc: "Report litter or segregate" },
    { label: "Earn GreenCoins", desc: "Verified tokens credited" },
    { label: "Play & Learn", desc: "Master 3-way sorting game" },
    { label: "Climb Leaderboard", desc: "Top ward citizen status" },
    { label: "Redeem Eco-Rewards", desc: "Discounts & zero-waste kits" },
  ];

  const featureCards = [
    {
      title: "Interactive Recycling Game",
      tag: "Educational Simulation",
      desc: "Test your waste segregation speed and accuracy across organic, recyclable, and hazardous bins in our browser game.",
      icon: Gamepad2,
      link: "/training/game",
      btnText: "Play Game",
      badge: "Gamified Training",
    },
    {
      title: "GreenCoins Eco-Store",
      tag: "Civic Currency",
      desc: "Turn your environmental points into tangible value. Redeem compost bins, reusable jute bags, and eco gardening kits.",
      icon: Coins,
      link: "/shop",
      btnText: "Visit Marketplace",
      badge: "Real Incentives",
    },
    {
      title: "Citizen Cleanliness Leaderboard",
      tag: "Civic Recognition",
      desc: "Compete with neighbors and institutions. Top contributors earn city-wide recognition badges and official certificates.",
      icon: Trophy,
      link: "/profile",
      btnText: "View Standings",
      badge: "Civic Honor",
    },
    {
      title: "Neighborhood Cleanliness Drives",
      tag: "Collective Impact",
      desc: "Join community cleanups and workshops near you or organize your own volunteer event with municipal logistics backing.",
      icon: Users,
      link: "/events",
      btnText: "Join Events",
      badge: "Citizen Action",
    },
  ];

  return (
    <section className="community-section" aria-label="Community and Gamification">
      <div className="container">
        <div className="community__header">
          <div className="badge badge--primary">
            <Flame size={13} />
            <span>Civic Engagement Engine</span>
          </div>
          <h2 className="community__title">Make Sustainability an Everyday Habit</h2>
          <p className="community__subtitle">
            Urban Pulse transforms individual habits into community-wide momentum with
            tangible rewards, gamified simulations, and public recognition.
          </p>
        </div>

        {/* Visual Flow Banner */}
        <div className="community__flow-banner">
          <div className="flow-banner__title">
            <Sparkles size={16} />
            <span>The Urban Pulse Citizen Journey</span>
          </div>
          <div className="flow-banner__steps">
            {flowSteps.map((step, index) => (
              <React.Fragment key={step.label}>
                <div className="flow-step">
                  <div className="flow-step__circle">
                    <CheckCircle size={14} />
                    <span>0{index + 1}</span>
                  </div>
                  <div className="flow-step__content">
                    <span className="flow-step__label">{step.label}</span>
                    <span className="flow-step__desc">{step.desc}</span>
                  </div>
                </div>
                {index < flowSteps.length - 1 && (
                  <div className="flow-step__arrow" aria-hidden="true">
                    →
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="community__cards-grid">
          {featureCards.map((card) => {
            const IconComp = card.icon;
            return (
              <div key={card.title} className="community-card">
                <div className="community-card__header">
                  <div className="community-card__icon-wrap">
                    <IconComp size={24} />
                  </div>
                  <span className="community-card__badge">{card.badge}</span>
                </div>
                <div className="community-card__tag">{card.tag}</div>
                <h3 className="community-card__title">{card.title}</h3>
                <p className="community-card__desc">{card.desc}</p>
                <Link to={card.link} className="community-card__btn">
                  <span>{card.btnText}</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
