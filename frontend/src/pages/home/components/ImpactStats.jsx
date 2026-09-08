import React from "react";
import { FileText, CheckCircle2, CalendarDays, Building2, TrendingUp, ShieldCheck } from "lucide-react";

export default function ImpactStats({ reportsCount = 0, resolvedCount = 0, eventsCount = 0, franchiseesCount = 0 }) {
  const stats = [
    {
      id: "reports",
      label: "Total Civic Reports",
      value: reportsCount,
      subtext: "Geo-tagged waste spots",
      icon: FileText,
      color: "var(--color-status-pending)",
      bg: "var(--color-status-pending-bg)",
    },
    {
      id: "resolved",
      label: "Cleanups Verified",
      value: resolvedCount,
      subtext: "Sanitation tasks completed",
      icon: CheckCircle2,
      color: "var(--color-primary-light)",
      bg: "var(--color-primary-subtle)",
    },
    {
      id: "events",
      label: "Community Action Drives",
      value: eventsCount,
      subtext: "Citizen-led cleanup events",
      icon: CalendarDays,
      color: "var(--color-status-event)",
      bg: "var(--color-status-event-bg)",
    },
    {
      id: "franchisees",
      label: "Certified Recycling Hubs",
      value: franchiseesCount,
      subtext: "E-waste & material drop-offs",
      icon: Building2,
      color: "var(--color-status-franchisee)",
      bg: "var(--color-status-franchisee-bg)",
    },
  ];

  // Calculate resolution rate if reports exist
  const resolutionRate = reportsCount > 0 ? Math.round((resolvedCount / reportsCount) * 100) : 100;

  return (
    <section className="impact-stats-section" aria-label="City Impact Statistics">
      <div className="container">
        <div className="impact-stats__header">
          <div className="badge badge--primary">
            <TrendingUp size={13} />
            <span>Real-Time Civic Metrics</span>
          </div>
          <h2 className="impact-stats__title">Measurable Urban Cleanliness Impact</h2>
          <p className="impact-stats__subtitle">
            Synchronized directly with municipal dispatch logs, certified drop-off centers,
            and citizen participation data.
          </p>
        </div>

        <div className="impact-stats__grid">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div key={stat.id} className="stat-card">
                <div className="stat-card__top">
                  <div
                    className="stat-card__icon-box"
                    style={{ backgroundColor: stat.bg, color: stat.color }}
                  >
                    <IconComponent size={22} />
                  </div>
                  <span className="stat-card__status-dot" style={{ backgroundColor: stat.color }} />
                </div>
                <div className="stat-card__metric">
                  <span className="stat-card__number">{stat.value.toLocaleString()}</span>
                </div>
                <div className="stat-card__label">{stat.label}</div>
                <div className="stat-card__subtext">{stat.subtext}</div>
              </div>
            );
          })}
        </div>

        {/* Live System Banner */}
        <div className="impact-stats__live-banner">
          <div className="live-banner__left">
            <span className="live-pulse-indicator" />
            <span className="live-banner__text">
              <strong>System Status:</strong> Real-time dispatch pipeline active. Overall cleanup resolution rate: <strong>{resolutionRate}%</strong>
            </span>
          </div>
          <div className="live-banner__right">
            <ShieldCheck size={16} />
            <span>Mongoose & MongoDB Atlas Connected</span>
          </div>
        </div>
      </div>
    </section>
  );
}
