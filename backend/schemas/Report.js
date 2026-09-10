const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reportImg: {
      type: String,
      required: true,
    },
    reportYoloImg: {
      type: String,
      default: "",
    },
    reportType: {
      type: String,
      enum: ["garbage", "pothole", "blind_turn", "road_hazard", "drainage"],
      default: "garbage",
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    landmark: {
      type: String,
      default: "",
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    resolvedImg: {
      type: String,
    },
    resolvedLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },
    remarks: {
      type: String,
      default: "NA",
    },
    time: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "allotted", "resolved"],
      default: "pending",
    },
    reportOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

reportSchema.index({ location: "2dsphere" });

const Report = mongoose.model("Report", reportSchema);


module.exports = Report;
