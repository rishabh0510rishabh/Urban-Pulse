import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../utils/axiosConfig";
// Import the new stylesheet
import "./OfficialsReportDisplay.css";

function LoadingSpinner() {
  // A styled loading state consistent with our other pages
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#f8f9fa",
        color: "#0a6847",
        fontSize: "1.5rem",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      Loading Report Details...
    </div>
  );
}

// Dynamic image URL resolver helper
const resolveImageUrl = (url) => {
  if (!url) return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  const apiBase =
    process.env.REACT_APP_ENVIRONMENT === "production"
      ? process.env.REACT_APP_API_URL_PROD || "https://urban-pulse-o4yc.onrender.com"
      : process.env.REACT_APP_API_URL_LOCAL || "http://localhost:5000";
  return `${apiBase.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
};

const isPlaceholderImage = (url) => {
  if (!url) return true;
  return (
    url.includes("images.unsplash.com/photo-1530587191325") ||
    url.includes("placeholder")
  );
};

export default function OfficialsReportDisplay() {
  const { id } = useParams();
  const [currReport, setCurrReport] = useState(null);
  const [mainImgError, setMainImgError] = useState(false);
  const [origImgError, setOrigImgError] = useState(false);

  useEffect(() => {
    const getReport = async () => {
      try {
        const res = await api.get(`/reports/${id}`);
        setCurrReport(res.data.report);
      } catch (err) {
        console.error("Error fetching report:", err);
      }
    };
    getReport();
  }, [id]);

  if (!currReport) {
    return <LoadingSpinner />;
  }

  const {
    reportImg,
    reportYoloImg,
    detectionResults,
    reportType,
    severity,
    landmark,
    location,
    remarks,
    status,
    time,
    reportOwner,
    resolvedImg,
  } = currReport;

  // Determine valid images avoiding placeholder/AI fallbacks
  const hasValidYolo = Boolean(reportYoloImg && !isPlaceholderImage(reportYoloImg));
  const hasValidOrig = Boolean(reportImg && !isPlaceholderImage(reportImg));

  // The primary Evidence Photo MUST be the YOLO detection image if available
  const evidencePhotoUrl = hasValidYolo ? reportYoloImg : (hasValidOrig ? reportImg : null);
  const isYoloEvidence = hasValidYolo;
  const showSeparateOriginal = hasValidYolo && hasValidOrig && reportImg !== reportYoloImg;

  return (
    <main className="report-display-page">
      <Link to="/officials" className="back-link">
        &larr; Back to Dashboard
      </Link>

      <div className="report-container">
        <header className="report-header">
          <h1 className="report-header__title">Report Details</h1>
          <p className="report-header__id">Ticket #{id.slice(-6).toUpperCase()}</p>
        </header>

        <div className="report-body__grid">
          {/* --- Images Column --- */}
          <section className="report-images">
            <div className="image-display">
              <div className="image-display__header">
                <h2 className="image-display__caption">Evidence Photo</h2>
                {isYoloEvidence && (
                  <span className="yolo-badge" title="Verified YOLOv8 Detection">
                    🤖 AI Detection (YOLOv8)
                  </span>
                )}
              </div>

              {evidencePhotoUrl && !mainImgError ? (
                <img
                  src={resolveImageUrl(evidencePhotoUrl)}
                  alt="Evidence"
                  className="image-display__img"
                  onError={() => setMainImgError(true)}
                />
              ) : (
                <div className="image-display-fallback">
                  <span className="fallback-icon">📷</span>
                  <p className="fallback-title">Detection image unavailable</p>
                  <span className="fallback-sub">No verified detection photo found for this report</span>
                </div>
              )}
            </div>

            {/* Original Citizen Photo if different from annotated image */}
            {showSeparateOriginal && !origImgError && (
              <div className="image-display" style={{ marginTop: "1rem" }}>
                <div className="image-display__header">
                  <h2 className="image-display__caption" style={{ fontSize: "0.95rem", color: "#64748b" }}>
                    Original Citizen Upload
                  </h2>
                </div>
                <img
                  src={resolveImageUrl(reportImg)}
                  alt="Citizen upload"
                  className="image-display__img"
                  style={{ opacity: 0.92 }}
                  onError={() => setOrigImgError(true)}
                />
              </div>
            )}

            {/* Resolved Photo if resolved */}
            {resolvedImg && (
              <div className="image-display" style={{ marginTop: "1rem" }}>
                <div className="image-display__header">
                  <h2 className="image-display__caption" style={{ color: "#27ae60" }}>
                    Resolution Evidence
                  </h2>
                </div>
                <img
                  src={resolveImageUrl(resolvedImg)}
                  alt="Resolution"
                  className="image-display__img"
                />
              </div>
            )}
          </section>

          {/* --- Details Column --- */}
          <section className="report-details">
            <div className="info-box">
              <h2 className="info-box__title">Report Information</h2>
              <dl>
                <dt>Category</dt>
                <dd>
                  <strong style={{ textTransform: "uppercase", color: "#0a6847" }}>
                    {reportType === "pothole"
                      ? "🕳️ Pothole / Road Surface"
                      : reportType === "blind_turn"
                      ? "⚠️ Blind Turn Hazard"
                      : reportType === "road_hazard"
                      ? "🚧 Road Obstruction"
                      : reportType === "drainage"
                      ? "🌊 Drainage / Sewage Overflow"
                      : "🗑️ Garbage / Waste"}
                  </strong>
                </dd>

                <dt>Severity</dt>
                <dd>
                  <span style={{ 
                    fontWeight: 700, 
                    textTransform: "capitalize",
                    color: severity === "critical" || severity === "high" ? "#dc2626" : "#2563eb"
                  }}>
                    {severity || "Medium"}
                  </span>
                </dd>

                {/* AI Detection Findings */}
                {detectionResults && (
                  <>
                    <dt>AI Detection Analysis</dt>
                    <dd>
                      <div className="detection-analysis-box">
                        <span className="detection-count-badge">
                          {Array.isArray(detectionResults)
                            ? `✓ ${detectionResults.length} object(s) detected`
                            : "✓ Detection logged"}
                        </span>
                        {Array.isArray(detectionResults) && detectionResults.length > 0 && (
                          <div className="detection-tags">
                            {detectionResults.map((det, idx) => (
                              <span key={idx} className="detection-tag">
                                {det.class || "garbage"}{" "}
                                {det.confidence ? `(${(det.confidence * 100).toFixed(0)}%)` : ""}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </dd>
                  </>
                )}

                {landmark && (
                  <>
                    <dt>Landmark</dt>
                    <dd>{landmark}</dd>
                  </>
                )}

                <dt>Status</dt>
                <dd>
                  <span className={`status-badge status--${status}`}>
                    {status}
                  </span>
                </dd>

                <dt>Location Coordinates</dt>
                <dd>
                  {location && location.coordinates?.length === 2 ? (
                    <a
                      href={`https://www.google.com/maps?q=${location.coordinates[1]},${location.coordinates[0]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {location.coordinates[1].toFixed(5)}, {location.coordinates[0].toFixed(5)} (Open Maps ↗)
                    </a>
                  ) : (
                    "Not specified"
                  )}
                </dd>

                <dt>Remarks</dt>
                <dd>{remarks && remarks !== "NA" ? remarks : "No remarks provided."}</dd>

                <dt>Submitted At</dt>
                <dd>{new Date(time).toLocaleString()}</dd>
              </dl>
            </div>

            <div className="info-box">
              <h2 className="info-box__title">Reporter Information</h2>
              <dl>
                <dt>Name</dt>
                <dd>
                  {reportOwner?.fname} {reportOwner?.lname}
                </dd>

                <dt>Email</dt>
                <dd>{reportOwner?.email || "N/A"}</dd>

                <dt>Phone</dt>
                <dd>{reportOwner?.phone || "N/A"}</dd>

                <dt>Address</dt>
                <dd>{reportOwner?.address || "N/A"}</dd>

                <dt>Role</dt>
                <dd>{reportOwner?.role || "user"}</dd>
              </dl>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
