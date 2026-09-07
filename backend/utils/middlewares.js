const jwt = require("jsonwebtoken");

// ── Session-based auth ─────────────────────────────────────────────────────
/** Ensures the user is logged in via Passport session. */
module.exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ message: "You must be logged in to access this resource." });
};

/**
 * Checks that the authenticated user has one of the allowed roles.
 * Must be used AFTER isLoggedIn.
 * @param {...string} roles - Allowed roles e.g. requireRole('admin', 'official')
 */
module.exports.requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated." });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      message: `Access denied. Required role(s): ${roles.join(", ")}. Your role: ${req.user.role}.`,
    });
  }
  return next();
};

// ── JWT-based auth (used for committee routes) ─────────────────────────────
module.exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Authorization header missing or malformed" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      _id: decoded.id,
      id: decoded.id,
      committeeId: decoded.id,
      ...decoded,
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
