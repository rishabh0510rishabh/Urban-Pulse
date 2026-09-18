const path = require("path");
const fs = require("fs");

// Load .env (with fallback to env if .env is not present)
if (process.env.NODE_ENV !== "production") {
  const envPath = path.join(__dirname, ".env");
  const fallbackEnvPath = path.join(__dirname, "env");
  if (fs.existsSync(envPath)) {
    require("dotenv").config({ path: envPath });
  } else if (fs.existsSync(fallbackEnvPath)) {
    require("dotenv").config({ path: fallbackEnvPath });
  } else {
    require("dotenv").config();
  }
}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const MongoStore = require("connect-mongo");

// --- Utils ---
const ExpressError = require("./utils/ExpressError.js");
const { seedDemoUsers } = require("./utils/demoAccounts.js");

// -- Routers --
const authRouter = require('./routes/authRouter.js');
const profileRouter = require('./routes/profileRouter.js');
const reportsRouter = require("./routes/reportsRouter.js");
const eventsRouter = require('./routes/eventsRouter.js');
const committeeRouter = require('./routes/committeeRouter.js');
const shopRouter = require('./routes/shopRouter.js');
const ospRouter = require('./routes/ospRouter.js');
const trainingRouter = require('./routes/trainingRouter.js');
const recycleRouter = require('./routes/recycleRouter.js');
const officialRouter = require('./routes/officialRouter.js');
const wasteSubmissionRouter = require('./routes/wasteSubmissionRouter.js');

// --- Models ---
const User = require("./schemas/User.js");

// -- ENV Requirements --
const SESSION_SECRET = process.env.SESSION_SECRET || "urbanpulse_super_secret_session_key_2026";

// --- Server settings ---
const port = process.env.PORT || 5000;
const app = express();

app.set("trust proxy", 1);

// MongoDB setup
const dbURI =
  process.env.NODE_ENV === "production"
    ? process.env.CLOUD_DB_URI || process.env.DB_URI
    : process.env.DB_URI || process.env.CLOUD_DB_URI;

if (!dbURI) {
  console.error("⚠️ WARNING: DB_URI / CLOUD_DB_URI is not set in environment variables!");
}

const clientPromise = mongoose
  .connect(dbURI)
  .then(async (m) => {
    console.log("Connection to MongoDB successful!");
    await seedDemoUsers();
    return m.connection.getClient();
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB. Error: " + err.message);
    throw err;
  });

// Session Store setup
const store = MongoStore.create({
  clientPromise: clientPromise,
  touchAfter: 24 * 3600, // Update information after 24 hours
});

store.on("error", (err) => {
  console.error("ERROR in MONGO SESSION STORE:", err.message);
});

// Session Code
const isProd = process.env.NODE_ENV === "production";

const sessionOptions = {
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
  },
  store: store,
};

// Allowed Origins setup
const allowedOrigins = [
  process.env.DEV_LINK_REACT || "http://localhost:3000",
  process.env.PROD_LINK_REACT,
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]
  .filter(Boolean)
  .flatMap((url) => url.split(",").map((s) => s.trim().replace(/\/$/, "")));

// Server setup
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, "");
      if (
        allowedOrigins.includes(cleanOrigin) ||
        process.env.NODE_ENV !== "production" ||
        cleanOrigin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Allow configured origin fallback
    },
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static uploads for local file storage
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use("/uploads", express.static(uploadsPath));

app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());

// Google & Local strategy
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));

// --- Routes ---
app.use('/auth', authRouter);
app.use('/profile', profileRouter);
app.use('/reports', reportsRouter);
app.use('/events', eventsRouter);
app.use('/committees', committeeRouter);
app.use('/shop', shopRouter);
app.use('/osp', ospRouter);
app.use('/training', trainingRouter);
app.use('/recycle', recycleRouter);
app.use('/official', officialRouter);
app.use('/waste-submission', wasteSubmissionRouter);

// Root Route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Urban Pulse Backend is running successfully!",
    timestamp: new Date().toISOString(),
  });
});

// 404 Route Handler
app.use((req, res, next) => {
  next(new ExpressError(404, `API route not found: ${req.method} ${req.originalUrl}`));
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  if (statusCode >= 500) {
    console.error(`[Server Error ${statusCode}] ${req.method} ${req.originalUrl}:`, err);
  }

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on port ${port}`);
});
