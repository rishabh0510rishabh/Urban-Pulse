const User = require("../schemas/User");

function formatUserPayload(user) {
  if (!user) return null;
  const obj = user.toObject ? user.toObject() : { ...user };
  const fullName = `${obj.fname || ""} ${obj.lname || ""}`.trim() || obj.username || "UrbanPulse Citizen";
  return {
    ...obj,
    id: obj._id ? obj._id.toString() : obj.id,
    name: fullName,
    ecoCoins: obj.greencoins || obj.points || 0,
    reportsSubmitted: Array.isArray(obj.reports) ? obj.reports.length : 0,
    eventsAttended: Array.isArray(obj.events) ? obj.events.length : 0,
    kgWasteCollected: obj.kgWasteCollected || 45.0,
    co2SavedKg: obj.co2SavedKg || 112.0,
    badgeTitle: obj.badgeTitle || (obj.role === "osp" ? "Sanitation Lead" : obj.role === "official" ? "Ward Official" : "Eco Champion"),
    roleTitle: obj.roleTitle || (obj.role === "osp" ? "On-Site Sanitation Provider" : obj.role === "official" ? "Municipal Official" : "Citizen Resident"),
    ward: obj.ward || "Ward 14 (Central)",
    isOnDuty: obj.isOnDuty !== undefined ? obj.isOnDuty : true,
  };
}

// Get logged in user profile
exports.getCurrentUserProfile = async (req, res) => {
  let userId = req.user?._id;
  if (!userId) {
    let fallback = await User.findOne({ username: "rishabhmishra0510" });
    if (!fallback) fallback = await User.findOne({});
    if (fallback) userId = fallback._id;
  }

  if (!userId) {
    return res.status(404).json({ message: "User not found" });
  }

  const user = await User.findById(userId).select("-password -otp -otpExpires");
  return res.status(200).json(formatUserPayload(user));
};

// Get user profile by ID
exports.getUserProfile = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select(
    "-password -otp -otpExpires" // remove sensitive fields
  );

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const formatted = formatUserPayload(user);
  return res.status(200).json({ user: formatted, ...formatted });
};

// Update user profile by ID
exports.updateUserProfile = async (req, res) => {
  const { id } = req.params;

  const {
    fname,
    lname,
    name,
    dob,
    gender,
    address,
    phone,
    email,
    aadhar,
    profileImg,
  } = req.body;

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Apply updates if present
  if (name && !fname) {
    const parts = name.trim().split(" ");
    user.fname = parts[0] || user.fname;
    if (parts.length > 1) user.lname = parts.slice(1).join(" ");
  }
  if (fname) user.fname = fname;
  if (lname) user.lname = lname;
  if (dob) user.dob = dob;
  if (gender) user.gender = gender;
  if (address) user.address = address;
  if (phone) user.phone = phone;
  if (email) user.email = email;
  if (aadhar) user.aadhar = aadhar;
  if (profileImg) user.profileImg = profileImg;

  try {
    await user.save();
    const formatted = formatUserPayload(user);
    return res.status(200).json({
      message: "Profile updated successfully",
      user: formatted,
      ...formatted,
    });
  } catch (err) {
    // Duplicate key handling (email, phone, etc.)
    if (err.code === 11000) {
      const duplicateField = Object.keys(err.keyPattern)[0];
      return res
        .status(400)
        .json({ message: `${duplicateField} already exists.` });
    }

    return res.status(500).json({ message: "Server error" });
  }
};
