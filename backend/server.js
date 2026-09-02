if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
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
const SESSION_SECRET = process.env.SESSION_SECRET || "your_session_secret_here";

// --- Server settings ---
const port = process.env.PORT || 5000;
const app = express();

// Enable trust proxy for secure cookies behind Render reverse proxy
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// MongoDB setup
const dbURI =
  process.env.NODE_ENV === "production"
    ? process.env.CLOUD_DB_URI || process.env.DB_URI
    : process.env.DB_URI || process.env.CLOUD_DB_URI;

mongoose
  .connect(dbURI)
  .then(() => {
    console.log("Connection to MongoDB successful!");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB. Error: " + err.message);
  });

// Session Store setup
const store = MongoStore.create({
  mongoUrl: dbURI,
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

// Server setup
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.PROD_LINK_REACT
        : process.env.DEV_LINK_REACT || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());

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

// Root / Health Check Route (Required for Render)
app.get("/", (req, res) => {
  res.status(200).json({ status: "success", message: "UrbanPulse Backend is running!" });
});

// -- Error handling routes --
app.use((req, res, next) => {
  next(new ExpressError(404, "API not found!"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on port ${port}`);
});
