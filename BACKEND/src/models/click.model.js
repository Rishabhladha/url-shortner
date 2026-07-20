import mongoose from "mongoose";

const clickSchema = new mongoose.Schema({
  shortUrl: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "shortUrl",
    required: true,
  },
  ipAddress: {
    type: String,
  },
  country: {
    type: String,
    default: "Unknown",
  },
  city: {
    type: String,
    default: "Unknown",
  },
  browser: {
    type: String,
    default: "Unknown",
  },
  os: {
    type: String,
    default: "Unknown",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Click = mongoose.model("Click", clickSchema);

export default Click;
