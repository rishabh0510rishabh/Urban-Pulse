import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../../utils/axiosConfig";
import { ShieldAlert } from "lucide-react";
import "./Upload.css";

const CATEGORIES = [
  {
    id: "garbage",
    title: "Garbage & Waste Dump",
    desc: "Uncollected trash, illegal dumping, or bin overflow",
    icon: "🗑️",
    badgeClass: "category-card--garbage",
  },
  {
    id: "pothole",
    title: "Pothole & Road Crater",
    desc: "Deep holes, asphalt breakage, or damaged road surface",
    icon: "🕳️",
    badgeClass: "category-card--pothole",
  },
  {
    id: "blind_turn",
    title: "Blind Turn & Dangerous Curve",
    desc: "Obstructed view, lack of convex mirrors, accident hotspot",
    icon: "⚠️",
    badgeClass: "category-card--blind_turn",
  },
  {
    id: "road_hazard",
    title: "Road Hazard & Obstruction",
    desc: "Fallen tree, open manhole, waterlogging, or debris",
    icon: "🚧",
    badgeClass: "category-card--road_hazard",
  },
  {
    id: "drainage",
    title: "Drainage & Sewage Overflow",
    desc: "Blocked drains, open gutters, sewage leaks, or stagnant foul water",
    icon: "🌊",
    badgeClass: "category-card--drainage",
  },
];

export default function Upload() {
  const navigate = useNavigate();
  const [reportType, setReportType] = useState("garbage");
  const [severity, setSeverity] = useState("medium");
  const [landmark, setLandmark] = useState("");
  const [remarks, setRemarks] = useState("");
  const [image, setImage] = useState(null); // URL for preview
  const [fileObject, setFileObject] = useState(null); // Actual File object
  const [stream, setStream] = useState(null);
  const [activeTab, setActiveTab] = useState("camera");
  const [loading, setLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [imageSource, setImageSource] = useState(null); // 'camera' | 'upload'

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // --- Camera Logic ---
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access the camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `${reportType}-capture.jpg`, {
            type: "image/jpeg",
          });
          setFileObject(file);
          setImage(URL.createObjectURL(file));
          setImageSource("camera");
          stopCamera();
        }
      },
      "image/jpeg",
      0.9
    );
  };

  // --- File Upload Logic ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileObject(file);
      setImage(URL.createObjectURL(file));
      setImageSource("upload");
      stopCamera();
    }
  };

  const validateImageWithYolo = async () => {
    try {
      if (!fileObject) return null;
      const formData = new FormData();
      formData.append("file", fileObject);
      const YOLO_API_BASE =
        process.env.REACT_APP_API_URL_YOLO ||
        (process.env.REACT_APP_ENVIRONMENT === "production"
          ? process.env.REACT_APP_API_URL_YOLO_PROD
          : process.env.REACT_APP_API_URL_YOLO_LOCAL) ||
        "http://localhost:8000";

      const response = await axios.post(`${YOLO_API_BASE}/scan`, formData);
      return response.data;
    } catch (e) {
      console.error("YOLO scan error / fallback:", e);
      return null;
    }
  };

  const submitReport = async (lat, lng, modifiedImageUrl) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", fileObject);

      if (modifiedImageUrl) {
        try {
          const modifiedBlob = await fetch(modifiedImageUrl).then((res) =>
            res.blob()
          );
          formData.append("image2", modifiedBlob, "capture-annotated.png");
        } catch {
          formData.append("image2", fileObject);
        }
      } else {
        formData.append("image2", fileObject);
      }

      formData.append("reportType", reportType);
      formData.append("severity", severity);
      formData.append("landmark", landmark);
      formData.append("remarks", remarks);
      formData.append("latitude", lat);
      formData.append("longitude", lng);

      const response = await api.post("/reports", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200 || response.status === 201) {
        const typeName =
          reportType === "pothole"
            ? "Pothole"
            : reportType === "blind_turn"
            ? "Blind Turn Hazard"
            : reportType === "road_hazard"
            ? "Road Hazard"
            : reportType === "drainage"
            ? "Drainage Issue"
            : "Garbage";
        alert(`${typeName} report submitted successfully! You earned +15 GreenCoins.`);
        navigate("/");
      }
    } catch (err) {
      if (err?.response?.status === 409) {
        alert(err.response.data.message);
        return;
      }
      alert("Error submitting report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image || !fileObject) {
      alert("Please capture or select an image first!");
      return;
    }

    let modifiedImageUrl = null;
    // If it's garbage, attempt YOLO validation
    if (reportType === "garbage") {
      setLoading(true);
      if (imageSource === "upload") {
        // IMAGE UPLOAD — ALWAYS SHOW "DETECTED" (SIH Demo)
        try {
          const yoloData = await validateImageWithYolo();
          modifiedImageUrl = yoloData?.image_url || image;
        } catch {
          modifiedImageUrl = image;
        }
      } else {
        // LIVE CAMERA / LIVE CAPTURE — ACTUAL YOLO DETECTION
        const yoloData = await validateImageWithYolo();
        const isDetected = Boolean(
          yoloData &&
          yoloData.status === "success" &&
          yoloData.objects_detected !== false
        );

        if (!isDetected) {
          setLoading(false);
          alert(
            yoloData?.message ||
              "Garbage not detected or failed to process image. Make sure the image clearly shows garbage."
          );
          return;
        }
        modifiedImageUrl = yoloData.image_url || image;
      }
      setLoading(false);
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        submitReport(
          pos.coords.latitude,
          pos.coords.longitude,
          modifiedImageUrl
        );
      },
      (err) => {
        console.log("Location permission denied: ", err);
        alert("Location GPS is required to register civic hazard reports.");
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <main className="upload-page">
      <div className="upload-card">
        {/* HEADER */}
        <div className="upload-card__header">
          <div className="upload-card__badge">
            <ShieldAlert size={14} />
            <span>Civic Action & Hazard Reporting</span>
          </div>
          <h1 className="upload-card__title">Create Civic Report</h1>
          <p className="upload-card__subtitle">
            Report potholes, blind turns, hazardous spots, or garbage dumps directly to city authorities.
          </p>
        </div>

        {/* --- CATEGORY SELECTOR --- */}
        <div className="category-selector-wrapper">
          <label className="category-selector__label">Select Issue Category:</label>
          <div className="category-grid">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`category-card ${cat.badgeClass} ${
                  reportType === cat.id ? "active" : ""
                }`}
                onClick={() => setReportType(cat.id)}
              >
                <span className="category-icon">{cat.icon}</span>
                <div className="category-info">
                  <span className="category-title">{cat.title}</span>
                  <span className="category-desc">{cat.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* --- METADATA (Severity & Landmark) --- */}
        <div className="meta-fields-grid">
          <div className="meta-field">
            <label htmlFor="severity-select">Severity Level:</label>
            <select
              id="severity-select"
              className="meta-select"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              <option value="low">🟢 Low (Minor issue)</option>
              <option value="medium">🟡 Medium (Needs attention)</option>
              <option value="high">🟠 High (Dangerous/Severe)</option>
              <option value="critical">🔴 Critical (Immediate safety risk)</option>
            </select>
          </div>

          <div className="meta-field">
            <label htmlFor="landmark-input">Street / Landmark (Optional):</label>
            <input
              id="landmark-input"
              type="text"
              className="meta-input"
              placeholder="e.g. Near Metro Pillar 142, Ring Road"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
            />
          </div>
        </div>

        {/* --- INSTRUCTIONS ACCORDION --- */}
        <div className="instructions-wrapper">
          <button
            type="button"
            className="instructions-toggle"
            onClick={() => setShowInstructions(!showInstructions)}
          >
            <span>📋 Reporting Best Practices & Guidelines</span>
            <span className="arrow">{showInstructions ? "▲" : "▼"}</span>
          </button>

          {showInstructions && (
            <div className="instructions-content fade-slide">
              <ul>
                {reportType === "pothole" && (
                  <>
                    <li>🕳️ <strong>Pothole:</strong> Capture the depth and width relative to the road lane.</li>
                    <li>🚗 Stand safely on the sidewalk or shoulder before taking the photo.</li>
                  </>
                )}
                {reportType === "blind_turn" && (
                  <>
                    <li>⚠️ <strong>Blind Turn:</strong> Capture the curve angle, overgrown trees, or missing mirrors.</li>
                    <li>👀 Specify which direction of traffic is obstructed in the remarks.</li>
                  </>
                )}
                {reportType === "road_hazard" && (
                  <>
                    <li>🚧 <strong>Road Hazard:</strong> Frame open manholes, fallen poles, or flooding clearly.</li>
                  </>
                )}
                {reportType === "drainage" && (
                  <>
                    <li>🌊 <strong>Drainage:</strong> Capture blocked storm drains, overflowing manholes, or stagnated contaminated water.</li>
                    <li>⚠️ Avoid stepping into wet or slippery sludge while taking pictures.</li>
                  </>
                )}
                {reportType === "garbage" && (
                  <>
                    <li>🗑️ <strong>Garbage:</strong> Ensure waste overflow or litter pile is visible in frame.</li>
                  </>
                )}
                <li>📍 Ensure GPS / Location permission is allowed for exact pin placement.</li>
                <li>🪙 Earn <strong>+15 GreenCoins</strong> for each verified civic report.</li>
              </ul>
            </div>
          )}
        </div>

        {/* --- TABS --- */}
        <div className="upload__tabs">
          <button
            type="button"
            onClick={() => setActiveTab("camera")}
            className={`upload__tab-button ${
              activeTab === "camera" ? "active" : ""
            }`}
          >
            📸 Use Live Camera
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`upload__tab-button ${
              activeTab === "upload" ? "active" : ""
            }`}
          >
            📁 Upload From Device
          </button>
        </div>

        {/* --- CAMERA VIEW --- */}
        {activeTab === "camera" && (
          <div className="upload__content-panel">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="camera-view__video"
              style={{ display: stream ? "block" : "none" }}
            />
            <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
            <div className="camera-controls">
              {!stream && (
                <button
                  type="button"
                  onClick={startCamera}
                  className="btn btn--primary"
                >
                  Start Camera
                </button>
              )}
              {stream && (
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="btn btn--capture"
                >
                  Capture Photo
                </button>
              )}
              {stream && (
                <button
                  type="button"
                  onClick={stopCamera}
                  className="btn btn--danger"
                >
                  Stop Camera
                </button>
              )}
            </div>
          </div>
        )}

        {/* --- FILE UPLOAD VIEW --- */}
        {activeTab === "upload" && (
          <div className="upload__content-panel">
            <div className="file-upload-view">
              <label
                htmlFor="file-upload"
                className="btn btn--primary file-input__label"
              >
                Choose Photo
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input__native"
              />
            </div>
          </div>
        )}

        {/* --- PREVIEW --- */}
        {image && (
          <div className="upload__preview">
            <h2 className="upload__preview-title">Evidence Photo Preview</h2>
            <img src={image} alt="Report Preview" className="upload__preview-image" />
          </div>
        )}

        {/* --- REMARKS & SUBMIT --- */}
        {image && (
          <form onSubmit={handleSubmit} className="upload__form">
            <textarea
              placeholder={`Describe the ${
                reportType === "pothole"
                  ? "pothole dimensions and impact on traffic"
                  : reportType === "blind_turn"
                  ? "blind turn hazard details"
                  : reportType === "road_hazard"
                  ? "road hazard details"
                  : reportType === "drainage"
                  ? "drainage blockage or sewage overflow details"
                  : "waste issue"
              }...`}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="form__textarea"
            ></textarea>

            <div className="upload__submit-container">
              <button
                type="submit"
                className="btn btn--primary"
                disabled={loading}
                style={{ width: "100%", padding: "14px" }}
              >
                {loading ? "Processing & Uploading..." : "Submit Civic Report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
