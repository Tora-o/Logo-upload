const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const uploadedUsers = new Set(); // userId -> has uploaded

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.get("/", (req, res) => {
  res.send("Backend is running");
});

// get user info from Google using access token
async function getUserInfo(accessToken) {
  const oAuth2Client = new google.auth.OAuth2();
  oAuth2Client.setCredentials({ access_token: accessToken });

  const oauth2 = google.oauth2({ version: "v2", auth: oAuth2Client });
  const { data } = await oauth2.userinfo.get();

  return {
    userId: data.id,      // unique per Google account
    email: data.email,
    name: data.name,
  };
}

// ensure uploads folder exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    const accessToken = req.body.accessToken;
    const image = req.file;

    if (!accessToken || !image) {
      return res.status(400).json({ message: "Missing token or image" });
    }

    // 1) identify user
    const { userId, email } = await getUserInfo(accessToken);
    console.log("Upload from:", email, userId);

    // 2) allow only one upload per user
    if (uploadedUsers.has(userId)) {
      return res
        .status(403)
        .json({ message: "You already submitted a logo with this account." });
    }

    // 3) save file to disk
    const ext = path.extname(image.originalname) || ".png";
    const fileName = `${userId}${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    fs.writeFileSync(filePath, image.buffer);

    // 4) mark user as done
    uploadedUsers.add(userId);

    return res.json({
      message: "Logo uploaded successfully! You cannot upload again.",
      fileName,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res
      .status(500)
      .json({ message: "Upload failed on server", error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
