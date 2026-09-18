const fs = require("fs");
const path = require("path");
const Report = require("../schemas/Report");
const User = require("../schemas/User");

const { sendSMS } = require("../utils/twilio");
const cloudinary = require("cloudinary").v2;
const { extractPublicId } = require("../utils/cloudinaryHelpers.js");

// Fetch all reports with populated user data
exports.getAllReports = async (req, res) => {
  const reports = await Report.find()
    .populate("reportOwner", "-password -otp -otpExpires")
    .sort({ createdAt: -1, time: -1 });

  return res.status(200).json({ reports });
};

// Helper to normalize reportType enum
function normalizeReportType(typeStr) {
  if (!typeStr) return "garbage";
  const s = typeStr.toLowerCase();
  if (s.includes("pothole") || s.includes("road")) return "pothole";
  if (s.includes("blind")) return "blind_turn";
  if (s.includes("hazard") || s.includes("street") || s.includes("light")) return "road_hazard";
  if (s.includes("drain") || s.includes("leak") || s.includes("pipe") || s.includes("water")) return "drainage";
  return "garbage";
}

// Helper to extract coordinates from request
function extractCoordinates(req) {
  let lat = parseFloat(req.body.latitude || req.body.lat);
  let lng = parseFloat(req.body.longitude || req.body.lng);

  if (isNaN(lat) || isNaN(lng)) {
    const locStr = (req.body.location || req.body.landmark || "") + "";
    const match = locStr.match(/([-+]?\d{1,2}\.\d+)[,\s]+([-+]?\d{1,3}\.\d+)/);
    if (match) {
      lat = parseFloat(match[1]);
      lng = parseFloat(match[2]);
    }
  }

  if (isNaN(lat) || isNaN(lng)) {
    // Default to Pune / India central coordinates
    lat = 18.5204;
    lng = 73.8567;
  }
  return { lat, lng };
}

// Create a new report with location + images
exports.createReport = async (req, res) => {
  const { lat, lng } = extractCoordinates(req);
  const rawType = req.body.reportType || req.body.category || "garbage";
  const reportType = normalizeReportType(rawType);
  const rawSeverity = (req.body.severity || "medium").toLowerCase();
  const severity = ["low", "medium", "high", "critical"].includes(rawSeverity) ? rawSeverity : "medium";
  const landmark = req.body.landmark || req.body.title || req.body.location || "UrbanPulse Civic Area";
  const remarks = req.body.remarks || req.body.description || req.body.title || "Civic report submitted via UrbanPulse";

  // ------------------- STEP 1: Duplicate check BEFORE upload -------------------
  const RADIUS_METERS = 50; // 50 meters
  try {
    const existingReport = await Report.findOne({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: RADIUS_METERS,
        },
      },
      reportType: reportType,
      status: { $in: ["pending", "allotted", "in-progress"] },
    });

    if (existingReport) {
      const typeLabel =
        reportType === "pothole"
          ? "pothole"
          : reportType === "blind_turn"
          ? "blind turn hazard"
          : reportType === "road_hazard"
          ? "road hazard"
          : reportType === "drainage"
          ? "drainage issue"
          : "garbage";
      return res.status(409).json({
        message: `A ${typeLabel} report near your location is already under process. Our response team is on it. Thank you for keeping our city safe and clean!`,
        report: existingReport,
      });
    }
  } catch (geoErr) {
    // If geospatial index is not ready, continue without blocking report
  }

  // ------------------- STEP 2: Process images -------------------
  const uploadBufferToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: "urbanpulse/reports" }, (err, result) => {
        if (err) resolve(null);
        else resolve(result?.secure_url || null);
      });
      stream.end(buffer);
    });
  };

  const saveBufferLocally = (buffer, prefix = "report") => {
    try {
      const uploadsDir = path.join(__dirname, "..", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const filename = `${prefix}_${Date.now()}_${Math.round(Math.random() * 1e9)}.jpg`;
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, buffer);
      const host = req.get("host") || "localhost:5000";
      const protocol = req.protocol || "http";
      return `${protocol}://${host}/uploads/${filename}`;
    } catch (saveErr) {
      console.error("Error saving file locally:", saveErr);
      return null;
    }
  };

  let imageUrl1 = null; // Original citizen photo
  let imageUrl2 = null; // YOLO annotated photo

  // 1. Process Original Upload
  if (req.files && req.files.image && req.files.image[0]) {
    try {
      imageUrl1 = await uploadBufferToCloudinary(req.files.image[0].buffer);
    } catch (e) {
      imageUrl1 = null;
    }
    if (!imageUrl1) {
      imageUrl1 = saveBufferLocally(req.files.image[0].buffer, "orig");
    }
  } else if (req.file) {
    try {
      imageUrl1 = await uploadBufferToCloudinary(req.file.buffer);
    } catch (e) {
      imageUrl1 = null;
    }
    if (!imageUrl1) {
      imageUrl1 = saveBufferLocally(req.file.buffer, "orig");
    }
  }

  if (!imageUrl1) {
    imageUrl1 = req.body.imageUrl || req.body.reportImg || req.body.image || "";
  }

  // 2. Process YOLO Annotated Upload
  if (req.files && req.files.image2 && req.files.image2[0]) {
    try {
      imageUrl2 = await uploadBufferToCloudinary(req.files.image2[0].buffer);
    } catch (e) {
      imageUrl2 = null;
    }
    if (!imageUrl2) {
      imageUrl2 = saveBufferLocally(req.files.image2[0].buffer, "yolo");
    }
  }

  // If image2 wasn't provided or failed, check if a direct URL was sent for reportYoloImg
  if (!imageUrl2 && req.body.reportYoloImg && typeof req.body.reportYoloImg === "string") {
    const cleanYoloUrl = req.body.reportYoloImg.trim();
    if (cleanYoloUrl && !cleanYoloUrl.includes("images.unsplash.com")) {
      imageUrl2 = cleanYoloUrl;
    }
  }

  // 3. Process Detection Metadata
  let detectionResults = null;
  if (req.body.detectionResults) {
    try {
      detectionResults = typeof req.body.detectionResults === "string"
        ? JSON.parse(req.body.detectionResults)
        : req.body.detectionResults;
    } catch (parseErr) {
      detectionResults = null;
    }
  }

  // ------------------- STEP 3: User Assignment -------------------
  let userId = req.user?._id;
  if (!userId) {
    let fallbackUser = await User.findOne({ username: "rishabhmishra0510" });
    if (!fallbackUser) fallbackUser = await User.findOne({ role: "user" });
    if (!fallbackUser) fallbackUser = await User.findOne({});
    if (fallbackUser) userId = fallbackUser._id;
  }

  // ------------------- STEP 4: Save report -------------------
  const newReport = await Report.create({
    reportImg: imageUrl1 || "",
    reportYoloImg: imageUrl2 || "",
    detectionResults: detectionResults,
    reportType,
    severity,
    landmark,
    remarks,
    status: "pending",
    reportOwner: userId,
    location: {
      type: "Point",
      coordinates: [lng, lat],
    },
  });

  // Update user stats
  if (userId) {
    try {
      const user = await User.findById(userId);
      if (user) {
        user.reports.push(newReport._id);
        user.greencoins = (user.greencoins || 0) + 15;
        user.points = (user.points || 0) + 15;
        await user.save();
      }
    } catch (err) {
      console.warn("Could not update user report stats:", err);
    }
  }

  return res.status(201).json({
    message: "Report created successfully!",
    report: newReport,
    id: newReport._id.toString(),
    status: "pending",
    earnedCoins: 15,
    createdAt: newReport.createdAt,
  });
};

// Fetch reports created by the logged-in user
exports.getMyReports = async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    const all = await Report.find().sort({ createdAt: -1 });
    return res.json(all);
  }
  const user = await User.findById(userId).populate("reports");
  const userReports = user ? user.reports : [];
  return res.json(userReports);
};

// get all reports assigned to OSPs
exports.getReportsAssignedToOsp = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const reports = await Report.find({
      assignedTo: userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Reports assigned to this OSP",
      reports,
    });
  } catch (err) {
    console.error("Error fetching OSP assigned reports:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get report by ID
exports.getReportById = async (req, res) => {
  const { id } = req.params;

  const report = await Report.findById(id).populate(
    "reportOwner",
    "-password -otp -otpExpires"
  );

  if (!report) {
    return res.status(404).json({ message: "Report not found" });
  }

  return res.status(200).json({ report });
};

// Officials can ONLY close (delete) resolved reports
exports.updateReportStatus = async (req, res) => {
  const { id } = req.params;

  const report = await Report.findById(id);

  if (!report) {
    return res.status(404).json({ message: "Report not found" });
  }

  // Only delete resolved reports
  if (report.status !== "resolved") {
    return res.status(400).json({
      message: "This action is only allowed when the report is resolved",
      status: report.status,
    });
  }

  // --- DELETE FROM CLOUDINARY ---
  if (report.reportImg) {
    const publicId = extractPublicId(report.reportImg);
    await cloudinary.uploader.destroy(publicId);
  }

  if (report.reportYoloImg) {
    const publicId = extractPublicId(report.reportYoloImg);
    await cloudinary.uploader.destroy(publicId);
  }

  // --- DELETE FROM DATABASE ---
  await Report.findByIdAndDelete(id);
  const newReports = await Report.find();

  return res.status(200).json({
    message: "Report successfully closed and deleted",
    status: "deleted",
    newReports,
  });
};

// assign report to an active osp
exports.assignReportToOsp = async (req, res) => {
  try {
    const reportId = req.params.id;
    const { ospId } = req.body; // OSP ID passed from frontend

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (report.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Only pending reports can be allotted" });
    }

    const osp = await User.findById(ospId);

    if (!osp || osp.role !== "osp") {
      return res.status(400).json({ message: "Invalid OSP selected" });
    }

    if (!osp.isOnDuty) {
      return res.status(400).json({ message: "OSP is not on duty" });
    }

    report.assignedTo = ospId;
    report.status = "allotted";

    await report.save();

    return res.status(200).json({
      message: "Report successfully allotted to OSP",
      report,
    });
  } catch (err) {
    console.error("Error assigning report to OSP:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// resolve the osp report
exports.ospResolveReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { latitude, longitude } = req.body;
    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Location coordinates required to resolve report" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "An image is required to resolve report" });
    }

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (
      !report.assignedTo ||
      report.assignedTo.toString() !== userId.toString()
    ) {
      return res
        .status(403)
        .json({ message: "You are not assigned to this report" });
    }

    if (report.status !== "allotted") {
      return res
        .status(400)
        .json({ message: "Report must be in allotted state" });
    }

    const uploadBufferToCloudinary = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream((err, result) => {
          if (err) reject(err);
          else resolve(result.secure_url);
        });
        stream.end(buffer);
      });
    };

    const resolvedImageUrl = await uploadBufferToCloudinary(req.file.buffer);

    report.status = "resolved";
    report.resolvedImg = resolvedImageUrl;
    report.resolvedLocation = {
      type: "Point",
      coordinates: [Number(longitude), Number(latitude)],
    };

    await report.save();

    return res.status(200).json({
      message: "Report marked resolved by OSP",
      report,
    });
  } catch (err) {
    console.error("Error resolving report:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
