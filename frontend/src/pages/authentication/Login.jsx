import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, HardHat, UserCheck, Store, Zap, Check, Info } from "lucide-react";
import api from '../../utils/axiosConfig';
import { useAuth } from '../../components/AuthContext';
import './Login.css';

// SIH Prototype Demo Accounts Definition
const DEMO_ACCOUNTS = [
  {
    id: "official1",
    username: "official1",
    password: "password123",
    roleName: "Official",
    roleBadge: "Municipal Authority",
    badgeType: "official",
    icon: ShieldCheck,
    targetDashboard: "/officials",
  },
  {
    id: "osp_rahul",
    username: "osp_rahul",
    password: "password123",
    roleName: "OSP Field",
    roleBadge: "Sanitation Officer",
    badgeType: "osp",
    icon: HardHat,
    targetDashboard: "/osp",
  },
  {
    id: "rishabhmishra0510",
    username: "rishabhmishra0510",
    password: "password123",
    roleName: "Citizen",
    roleBadge: "Resident / Lead",
    badgeType: "citizen",
    icon: UserCheck,
    targetDashboard: "/",
  },
  {
    id: "vendor_ecorecycle",
    username: "vendor_ecorecycle",
    password: "password123",
    roleName: "Vendor",
    roleBadge: "Recycling Hub",
    badgeType: "vendor",
    icon: Store,
    targetDashboard: "/franchisee-dashboard",
  },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedDemoId, setSelectedDemoId] = useState(null);

  // Auto-fill selected demo credentials without auto-submitting
  const handleSelectDemo = (demo) => {
    setUsername(demo.username);
    setPassword(demo.password);
    setSelectedDemoId(demo.id);
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await api.post("/auth/login", { username, password });
      login(res.data.user);
      setMessage({
        type: 'success',
        text: res.data.message || "Login successful! Redirecting..."
      });

      // Role-based redirection to existing dashboards
      const userRole = res.data.user?.role;
      let targetPath = "/";
      if (userRole === "official" || userRole === "admin") {
        targetPath = "/officials";
      } else if (userRole === "osp") {
        targetPath = "/osp";
      } else if (userRole === "vendor") {
        targetPath = "/franchisee-dashboard";
      }

      setTimeout(() => {
        navigate(targetPath);
      }, 1200);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Login failed. Please check your credentials.";
      setMessage({ type: 'error', text: errorMsg });
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="form-card">
        <header className="form-card__header">
          <h1 className="form-card__title">Welcome Back</h1>
          <p className="form-card__subtitle">Log in to continue to Swacchta&Life.</p>
        </header>

        {/* SIH Prototype Demo Login Section */}
        <section className="demo-login-box" aria-label="SIH Prototype Demo Login">
          <div className="demo-login-box__header">
            <div className="demo-login-box__title-row">
              <span className="demo-tag">SIH Prototype</span>
              <h2 className="demo-login-box__title">Demo Login</h2>
            </div>
            <p className="demo-login-box__subtitle">
              Use any demo account below
            </p>
          </div>

          <div className="demo-accounts-grid">
            {DEMO_ACCOUNTS.map((demo) => {
              const IconComp = demo.icon;
              const isSelected = selectedDemoId === demo.id && username === demo.username;
              return (
                <div
                  key={demo.id}
                  className={`demo-card ${isSelected ? "demo-card--selected" : ""}`}
                >
                  <div className="demo-card__top">
                    <span className={`demo-role-tag demo-role-tag--${demo.badgeType}`}>
                      <IconComp size={12} />
                      <span>{demo.roleName}</span>
                    </span>
                    <span className="demo-card__badge-desc">{demo.roleBadge}</span>
                  </div>

                  <div className="demo-card__body">
                    <span className="demo-card__username" title={demo.username}>
                      {demo.username}
                    </span>
                  </div>

                  <button
                    type="button"
                    className={`demo-autofill-btn ${isSelected ? "demo-autofill-btn--active" : ""}`}
                    onClick={() => handleSelectDemo(demo)}
                    title={`Auto-fill credentials for ${demo.username}`}
                  >
                    {isSelected ? (
                      <>
                        <Check size={12} />
                        <span>Selected</span>
                      </>
                    ) : (
                      <>
                        <Zap size={12} />
                        <span>Use Account</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="demo-login-box__footer">
            <Info size={12} />
            <span>SIH Prototype Demo Credentials · For demonstration purposes only.</span>
          </div>
        </section>

        <div className="auth-divider">
          <span>Or login with account credentials</span>
        </div>

        {/* Standard Login Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form__group">
            <label className="form__label" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className="form__input"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (selectedDemoId) setSelectedDemoId(null);
              }}
              required
            />
          </div>

          <div className="form__group">
            <label className="form__label" htmlFor="password">Password</label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="form__input form__input--password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (selectedDemoId) setSelectedDemoId(null);
              }}
              required
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {message && (
          <div className={`form__message form__message--${message.type}`}>
            {message.text}
          </div>
        )}

        <footer className="form-card__footer">
          <span>Don't have an account? </span>
          <Link to="/signup">Sign Up</Link>
        </footer>
      </div>
    </main>
  );
}