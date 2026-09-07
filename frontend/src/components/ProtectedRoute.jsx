import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

/**
 * Wraps a route so that:
 *  - Unauthenticated users are redirected to /login
 *  - Authenticated users without the required role are shown a 403 page
 *
 * @param {React.ReactNode} children     - The page to render if access is granted
 * @param {string[]}        [roles]      - Allowed roles. If omitted, any logged-in user may access.
 * @param {string}          [redirectTo] - Where to send unauthorised users (default: /login)
 */
export default function ProtectedRoute({ children, roles, redirectTo = "/login" }) {
  const { user, loading } = useAuth();

  // Wait for auth check to finish (avoids flash-redirect on page reload)
  if (loading) return null;

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return (
      <main style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>403</h1>
        <p style={{ fontSize: "1.2rem", color: "#666" }}>
          You don&apos;t have permission to access this page.
        </p>
        <p style={{ color: "#999", marginTop: "0.5rem" }}>
          This page is only for:{" "}
          <strong>{roles.join(", ")}</strong>. Your role is:{" "}
          <strong>{user.role}</strong>.
        </p>
      </main>
    );
  }

  return children;
}
