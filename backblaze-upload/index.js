const express = require("express");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// ✅ Set CORS - Adjust to match your frontend
app.use(cors({
  origin: "https://fastshare-orpin.vercel.app",  // Your React frontend
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "x-file-name", "x-days", "x-max-downloads"]
}));

// ✅ No Size Limit - Custom Handling of File Stream (no bodyParser limit)
app.use(express.static("public")); // For error.html

// Backblaze B2 Config
const B2_KEY_ID = "0055831ec347a1e0000000002";
const B2_APPLICATION_KEY = "K005RfJbuMWspwm//7PdSr7uemDBKbc";
const B2_BUCKET_NAME = "fastshareapp";
const B2_ENDPOINT = "https://s3.us-east-005.backblazeb2.com";

const s3 = new AWS.S3({
  endpoint: B2_ENDPOINT,
  accessKeyId: B2_KEY_ID,
  secretAccessKey: B2_APPLICATION_KEY,
  signatureVersion: "v4",
});

let fileMetadata = {}; // To track expiry and download limits

// 📤 Upload Endpoint (Stream directly, no size limit)
app.post("/upload", (req, res) => {
  const fileName = decodeURIComponent(req.headers["x-file-name"]);
  const days = parseInt(req.headers["x-days"] || "0", 10);
  const maxDownloads = parseInt(req.headers["x-max-downloads"] || "Infinity", 10);

  if (!fileName) {
    return res.status(400).json({ error: "❌ Missing file name!" });
  }

  let fileBuffer = Buffer.alloc(0);

  req.on("data", (chunk) => {
    fileBuffer = Buffer.concat([fileBuffer, chunk]);
  });

  req.on("end", async () => {
    const fileId = uuidv4();
    const downloadLink = `/download/${fileId}`;

    await uploadFileToB2(fileBuffer, fileName);

    fileMetadata[fileId] = {
      fileName,
      maxDownloads,
      expiryDate: days ? Date.now() + days * 86400000 : null,
    };

    const BASE_URL = `${req.protocol}://${req.get("host")}`;

    res.json({
      message: "✅ File uploaded!",
      downloadUrl: `${BASE_URL}${downloadLink}`,
      fileId,
    });
  });

  req.on("error", (err) => {
    console.error("❌ Stream error:", err.message);
    res.status(500).json({ error: "Stream error occurred" });
  });
});

// ✅ Upload to B2 Helper
async function uploadFileToB2(buffer, fileName) {
  await s3.putObject({
    Bucket: B2_BUCKET_NAME,
    Key: fileName,
    Body: buffer,
  }).promise();
}

// 📥 Download Endpoint
app.get("/download/:fileId", async (req, res) => {
  const { fileId } = req.params;
  const metadata = fileMetadata[fileId];

  if (!metadata) {
    return res.status(404).sendFile(path.join(__dirname, "public", "error.html"));
  }

  if (metadata.expiryDate && Date.now() > metadata.expiryDate) {
    await deleteFile(fileId);
    return res.status(404).sendFile(path.join(__dirname, "public", "error.html"));
  }

  if (metadata.maxDownloads === 0) {
    await deleteFile(fileId);
    return res.status(403).sendFile(path.join(__dirname, "public", "error.html"));
  }

  const signedUrl = await generateSignedUrl(metadata.fileName);
  metadata.maxDownloads--;

  if (metadata.maxDownloads === 0) {
    setTimeout(() => deleteFile(fileId), 5000);
  }

  res.redirect(signedUrl);
});

// 🗑️ Delete File Helper
async function deleteFile(fileId) {
  const fileName = fileMetadata[fileId]?.fileName;
  if (!fileName) return;

  await s3.deleteObject({
    Bucket: B2_BUCKET_NAME,
    Key: fileName,
  }).promise();

  delete fileMetadata[fileId];
  console.log(`🗑️ Deleted file: ${fileName}`);
}

// 🗑️ Manual Delete Endpoint (optional)
app.delete("/delete/:fileId", async (req, res) => {
  await deleteFile(req.params.fileId);
  res.json({ message: "✅ File deleted successfully" });
});

// 404 Fallback
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "error.html"));
});

// 🚀 Start Server
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
