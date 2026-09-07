import { Routes, Route } from "react-router-dom";

// Common
import Navbar from "./components/Navbar";
import Footer from "./components/Footer.jsx";
import NotFound from './components/NotFound.jsx';
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { CommitteeAuthProvider } from "./components/CommitteeAuthContext.jsx";

// Auth
import Login from "./pages/authentication/Login";
import Signup from "./pages/authentication/Signup";
import Otp from "./pages/authentication/Otp";
// Vendor
import Vendor from "./pages/vendor/Vendor.jsx";
// Franchisee Dashboard
import FranchiseeDashboard from "./pages/franchisee_subadmin/FranchiseeDashboard.jsx";

// Home
import Home from "./pages/home/Home";
// Profile
import Profile from "./pages/profile/Profile";
import MyReports from "./pages/profile/MyReports.jsx";
import MyRecycleRequests from "./pages/profile/MyRecycleRequests.jsx";

// Services
import Upload from "./pages/services/report/Upload.jsx";
import OspDashboard from "./pages/osp/OspDashboard.jsx";
import Recycle from "./pages/services/recycle/Recycle.jsx";

// Committee Section
import CommitteeForms from "./pages/services/committee/CommitteeForms.jsx";
import CommitteeDashboard from "./pages/services/committee/CommitteeDashboard.jsx";

// Event section
import Event from "./pages/services/event/Event.jsx";
import EventDetail from './pages/services/event/EventDetail.jsx';
import EventSignUpForm from "./pages/services/event/EventSignUpForm.jsx";

// Franchisee Section
import FranchiseeForm from "./pages/subadmin/franchisee_form/FranchiseeForm.jsx";

//Training
import Training from "./pages/services/training/training.jsx";
import LevelDetail from "./pages/services/training/components/levelhub.jsx";
import RecyclingGame from './pages/games/RecyclingGame';

// Carbon Footprint
import CarbonFootprintDash from "./pages/cfdash/cfdash.jsx";

// Ecommerce
import Shop from "./pages/services/shop/Shop.jsx";
// Subadmin
import OfficialsDashboard from "./pages/subadmin/OfficialsDashboard";
import OfficialsReportDisplay from "./pages/subadmin/OfficialsReportDisplay.jsx";
import EventForm from "./pages/subadmin/event_form/EventForm.jsx";

// Auth Provider
import { AuthProvider } from "./components/AuthContext";

function App() {
  return (
    <div>
      <AuthProvider>
        <CommitteeAuthProvider>
          <Navbar />
          <Routes>
            {/* ── Public Routes ─────────────────────────────────────────── */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/otp" element={<Otp />} />
            <Route path="/events" element={<Event />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/training" element={<Training />} />
            <Route path="/training/levels/:id" element={<LevelDetail />} />
            <Route path="/training/game" element={<RecyclingGame />} />
            <Route path="/shop" element={<Shop />} />

            {/* ── Any Logged-in User ────────────────────────────────────── */}
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/profile/reports" element={<ProtectedRoute><MyReports /></ProtectedRoute>} />
            <Route path="/profile/recycle-requests" element={<ProtectedRoute><MyRecycleRequests /></ProtectedRoute>} />
            <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
            <Route path="/committee" element={<ProtectedRoute><CommitteeForms /></ProtectedRoute>} />
            <Route path="/committee/dashboard" element={<ProtectedRoute><CommitteeDashboard /></ProtectedRoute>} />
            <Route path="/events/:id/signup" element={<ProtectedRoute><EventSignUpForm /></ProtectedRoute>} />
            <Route path="/recycle" element={<ProtectedRoute><Recycle /></ProtectedRoute>} />
            <Route path="/cfdash" element={<ProtectedRoute><CarbonFootprintDash /></ProtectedRoute>} />

            {/* ── OSP Only ──────────────────────────────────────────────── */}
            <Route
              path="/osp"
              element={
                <ProtectedRoute roles={["osp"]}>
                  <OspDashboard />
                </ProtectedRoute>
              }
            />

            {/* ── Vendor Only ───────────────────────────────────────────── */}
            <Route
              path="/vendor"
              element={
                <ProtectedRoute roles={["vendor"]}>
                  <Vendor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/franchisee-dashboard"
              element={
                <ProtectedRoute roles={["vendor"]}>
                  <FranchiseeDashboard />
                </ProtectedRoute>
              }
            />

            {/* ── Admin / Official Only ─────────────────────────────────── */}
            <Route
              path="/officials"
              element={
                <ProtectedRoute roles={["admin", "official"]}>
                  <OfficialsDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/officials/event/create"
              element={
                <ProtectedRoute roles={["admin", "official"]}>
                  <EventForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/officials/franchisee/create"
              element={
                <ProtectedRoute roles={["admin", "official"]}>
                  <FranchiseeForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/officials/report/:id"
              element={
                <ProtectedRoute roles={["admin", "official"]}>
                  <OfficialsReportDisplay />
                </ProtectedRoute>
              }
            />

            {/* ── 404 ───────────────────────────────────────────────────── */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </CommitteeAuthProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
