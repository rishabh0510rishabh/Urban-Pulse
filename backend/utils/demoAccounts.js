const User = require("../schemas/User");

const DEMO_ACCOUNTS = [
  {
    username: "official1",
    password: "password123",
    role: "official",
    fname: "Vikram",
    lname: "Aditya",
    email: "official1@urbanpulse.sih",
    phone: "9876540001",
    aadhar: "100000000001",
    gender: "Male",
    address: "Municipal Corporation HQ, Zone 1",
    points: 500,
    greencoins: 500,
    isOtpVerified: true,
    isOnDuty: true,
  },
  {
    username: "osp_rahul",
    password: "password123",
    role: "osp",
    fname: "Rahul",
    lname: "Sharma",
    email: "osp_rahul@urbanpulse.sih",
    phone: "9876540002",
    aadhar: "100000000002",
    gender: "Male",
    address: "Sanitation Division Ward 4",
    points: 350,
    greencoins: 350,
    isOtpVerified: true,
    isOnDuty: true,
  },
  {
    username: "rishabhmishra0510",
    password: "password123",
    role: "user",
    fname: "Rishabh",
    lname: "Mishra",
    email: "rishabhmishra0510@urbanpulse.sih",
    phone: "9876540003",
    aadhar: "100000000003",
    gender: "Male",
    address: "Green Park Society, Sector 12",
    points: 450,
    greencoins: 300,
    isOtpVerified: true,
    isOnDuty: false,
  },
  {
    username: "vendor_ecorecycle",
    password: "password123",
    role: "vendor",
    fname: "EcoRecycle",
    lname: "Franchise",
    email: "vendor_ecorecycle@urbanpulse.sih",
    phone: "9876540004",
    aadhar: "100000000004",
    gender: "Other",
    address: "EcoRecycle Material Recovery Facility",
    points: 800,
    greencoins: 1200,
    isOtpVerified: true,
    isOnDuty: true,
  },
];

/**
 * Seed or update demo accounts in MongoDB Atlas
 */
async function seedDemoUsers() {
  try {
    for (const demo of DEMO_ACCOUNTS) {
      let user = await User.findOne({ username: demo.username.toLowerCase() });

      if (!user) {
        user = new User({
          ...demo,
          username: demo.username.toLowerCase(),
        });
        await user.setPassword(demo.password);
        await user.save();
        console.log(`✅ [Demo Seed] Created demo account: ${demo.username} (${demo.role})`);
      } else {
        let changed = false;
        if (user.role !== demo.role) {
          user.role = demo.role;
          changed = true;
        }
        if (!user.isOtpVerified) {
          user.isOtpVerified = true;
          changed = true;
        }
        if (changed) {
          await user.save();
          console.log(`🔄 [Demo Seed] Synchronized demo account: ${demo.username} (${demo.role})`);
        }
      }
    }
  } catch (err) {
    console.error("⚠️ [Demo Seed] Error seeding demo accounts:", err.message);
  }
}

module.exports = {
  DEMO_ACCOUNTS,
  seedDemoUsers,
};
