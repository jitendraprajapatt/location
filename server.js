const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();

/* ---------- MIDDLEWARE ---------- */
app.use(cors());
app.use(express.json());

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
    /* ---------- SMTP CONFIG (FIXED) ---------- */
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // REQUIRED for Gmail
      auth: {
        user: process.env.EMAIL_USER, // Gmail address
        pass: process.env.EMAIL_PASS  // Gmail App Password
      }
    });

    /* ---------- VERIFY SMTP (IMPORTANT) ---------- */
    await transporter.verify();

    /* ---------- SEND EMAIL ---------- */
    await transporter.sendMail({
      from: `"Location Service" <${process.env.EMAIL_USER}>`,
      to: "jitendraprajapat.official@gmail.com",
      subject: "New Location Received",
      text: `Latitude: ${latitude}\nLongitude: ${longitude}`
    });

    return res.status(200).json({ message: "Location sent successfully" });

  } catch (error) {
    console.error("SMTP Error:", error.message);
    return res.status(500).json({ error: "Email delivery failed" });
  }
});

/* ---------- START SERVER ---------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
