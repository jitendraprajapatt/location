const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* ---------- MIDDLEWARE ---------- */
app.use(cors());
app.use(express.json());

/* ---------- MONGODB CONNECTION ---------- */
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

/* ---------- LOCATION SCHEMA ---------- */
const locationSchema = new mongoose.Schema(
  {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { versionKey: false }
);

const Location = mongoose.model("Location", locationSchema);

/* ---------- HEALTH CHECK ---------- */
app.get("/", (req, res) => {
  res.status(200).send("Location server is running");
});

/* ---------- LOCATION ENDPOINT ---------- */
app.post("/location", async (req, res) => {
  const { latitude, longitude } = req.body;

  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return res.status(400).json({ error: "Invalid location data" });
  }

  try {
    const location = new Location({
      latitude,
      longitude
    });

    await location.save();

    return res.status(200).json({
      message: "Location saved successfully"
    });
  } catch (error) {
    console.error("DB Error:", error.message);
    return res.status(500).json({ error: "Database error" });
  }
});

/* ---------- START SERVER ---------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
