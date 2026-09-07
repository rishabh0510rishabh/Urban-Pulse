import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../../utils/axiosConfig";
import "./OspDashboard.css";

const createMarkerIcon = () =>
  L.divIcon({
    className: `marker-pin assigned`,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -35],
  });

export default function OspDashboard() {
  const [assignedReports, setAssignedReports] = useState([]);
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [loading, setLoading] = useState(true);

  // Resolution Modal State
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolvingReportId, setResolvingReportId] = useState(null);
  const [resolveImage, setResolveImage] = useState(null);
  const [isResolving, setIsResolving] = useState(false);

  // Camera State
  const [useCamera, setUseCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reportsRes = await api.get("/reports/assigned");
        setAssignedReports(reportsRes.data.reports);

        const userRes = await api.get("/auth/check");
        setIsOnDuty(userRes.data.user.isOnDuty);

        navigator.geolocation.getCurrentPosition(
          (pos) =>
            setLocation({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            }),
          () => alert("Enable location to view your map"),
          { enableHighAccuracy: true }
        );
      } catch (err) {
        console.error(err);
        alert("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleDuty = async () => {
    try {
      const res = await api.post("/osp/toggle-duty");
      setIsOnDuty(res.data.isOnDuty);
      alert(`Duty status: ${res.data.isOnDuty ? "On Duty" : "Off Duty"}`);
    } catch (err) {
      console.error(err);
      alert("Failed to toggle duty status");
    }
  };

  const openResolveModal = (id) => {
    setResolvingReportId(id);
    setResolveImage(null);
    setUseCamera(false);
    setResolveModalOpen(true);
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setUseCamera(false);
  };

  const closeResolveModal = () => {
    stopCamera();
    setResolveModalOpen(false);
    setResolvingReportId(null);
    setResolveImage(null);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: { ideal: "environment" } } 
      });
      setStream(mediaStream);
      setUseCamera(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access the camera. Please check permissions or ensure you have a connected camera.");
    }
  };

  useEffect(() => {
    if (useCamera && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [useCamera, stream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
          setResolveImage(file);
          stopCamera();
        }
      }, "image/jpeg", 0.9);
    }
  };

  const submitResolve = async () => {
    if (!resolveImage) {
      alert("Please upload or capture an image showing the resolved state.");
      return;
    }

    setIsResolving(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const formData = new FormData();
          formData.append("resolvedImage", resolveImage);
          formData.append("latitude", pos.coords.latitude);
          formData.append("longitude", pos.coords.longitude);

          await api.post(`/reports/${resolvingReportId}/resolve`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          setAssignedReports((prev) =>
            prev.map((r) => (r._id === resolvingReportId ? { ...r, status: "resolved" } : r))
          );
          alert("Report marked resolved!");
          closeResolveModal();
        } catch (err) {
          console.error(err);
          alert(err.response?.data?.message || "Failed to resolve report");
        } finally {
          setIsResolving(false);
        }
      },
      () => {
        alert("Enable location to resolve the report");
        setIsResolving(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const mapReports = assignedReports.filter(
    (r) =>
      r?.location?.coordinates &&
      r.location.coordinates.length === 2 &&
      typeof r.location.coordinates[0] === "number"
  );

  if (loading) return <div className="loading">Loading OSP Dashboard...</div>;

  return (
    <main className="osp-dashboard">
      <header className="osp-header">
        <h1>OSP Dashboard</h1>
        <button className="btn btn--primary" onClick={toggleDuty}>
          {isOnDuty ? "Go Off Duty" : "Go On Duty"}
        </button>
      </header>

      <section className="stats">
        <div className="stat-card">
          <h2>Assigned Reports</h2>
          <p>{assignedReports.length}</p>
        </div>
        <div className="stat-card">
          <h2>Resolved</h2>
          <p>{assignedReports.filter((r) => r.status === "resolved").length}</p>
        </div>
      </section>

      <section className="dashboard-module map-container-wrapper">
        <h2>Your Assigned Reports</h2>

        {location.latitude && location.longitude ? (
          <MapContainer
            center={[location.latitude, location.longitude]}
            zoom={14}
            style={{ height: "400px", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {mapReports.map((r) => (
              <Marker
                key={r._id}
                position={[
                  r.location.coordinates[1],
                  r.location.coordinates[0],
                ]}
                icon={createMarkerIcon()}
              >
                <Popup>
                  <strong>Report #{r._id.slice(-6)}</strong> <br />
                  Status: {r.status}
                  {r.status === "allotted" && (
                    <button
                      className="btn btn--secondary popup-btn"
                      onClick={() => openResolveModal(r._id)}
                    >
                      Resolve
                    </button>
                  )}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <div className="location-info">Fetching location...</div>
        )}
      </section>

      <section className="dashboard-module">
        <h2>Assigned Reports List</h2>
        <table className="reports-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {assignedReports.map((r) => (
              <tr key={r._id}>
                <td>{r._id.slice(-6)}...</td>
                <td>{new Date(r.time).toLocaleString()}</td>
                <td className={`status-tag status-${r.status}`}>
                  {r.status}
                </td>
                <td>
                  {r.status === "allotted" ? (
                    <button
                      className="btn btn--primary"
                      onClick={() => openResolveModal(r._id)}
                    >
                      Mark Resolved
                    </button>
                  ) : (
                    <span className="resolved-text">Resolved</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {resolveModalOpen && (
        <div className="modal-overlay" style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: "#fff", padding: "2rem", borderRadius: "8px", width: "90%", maxWidth: "500px", textAlign: "center", maxHeight: "90vh", overflowY: "auto"
          }}>
            <h3>Resolve Report</h3>
            <p style={{ marginBottom: "1rem", color: "#666" }}>
              Please provide a photo of the resolved area. Your location will be automatically captured to verify the fix.
            </p>
            
            {!useCamera ? (
              <div style={{ marginBottom: "1.5rem" }}>
                {resolveImage && (
                  <div style={{ marginBottom: "1rem" }}>
                    <img src={URL.createObjectURL(resolveImage)} alt="Preview" style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "8px" }} />
                    <button className="btn btn--secondary" onClick={() => setResolveImage(null)} style={{ display: "block", margin: "0.5rem auto" }}>
                      Remove Image
                    </button>
                  </div>
                )}
                
                {!resolveImage && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <button className="btn btn--primary" onClick={startCamera}>
                      Take Photo with Camera
                    </button>
                    <div style={{ position: "relative", textAlign: "center" }}>
                      <hr style={{ border: "1px solid #eee", margin: "1rem 0" }}/>
                      <span style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", backgroundColor: "#fff", padding: "0 10px", color: "#888" }}>OR</span>
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Upload File</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setResolveImage(e.target.files[0])}
                        style={{ width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ marginBottom: "1.5rem" }}>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline
                  style={{ width: "100%", borderRadius: "8px", backgroundColor: "#000", marginBottom: "1rem" }}
                ></video>
                <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
                <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                  <button className="btn btn--secondary" onClick={stopCamera}>
                    Cancel Camera
                  </button>
                  <button className="btn btn--primary" onClick={capturePhoto}>
                    Capture Photo
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1rem", borderTop: "1px solid #eee", paddingTop: "1rem" }}>
              <button 
                className="btn btn--secondary" 
                onClick={closeResolveModal}
                disabled={isResolving}
              >
                Cancel
              </button>
              <button 
                className="btn btn--primary" 
                onClick={submitResolve}
                disabled={isResolving || !resolveImage}
              >
                {isResolving ? "Uploading..." : "Submit Verification"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}