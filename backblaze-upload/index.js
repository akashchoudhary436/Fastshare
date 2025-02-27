const express = require("express");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.static("public")); // Static files (error.html, etc.)

// Backblaze B2 S3 Credentials
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

let fileMetadata = {}; // Track metadata like expiry and download limits

// Upload File (Direct Buffer Upload - No Multer)
app.post("/upload", async (req, res) => {
  try {
    const fileName = decodeURIComponent(req.headers['x-file-name']);
    const days = parseInt(req.headers['x-days'] || '0', 10);
    const maxDownloads = parseInt(req.headers['x-max-downloads'] || 'Infinity', 10);

    if (!fileName) {
      return res.status(400).json({ error: "❌ Missing file name!" });
    }

    let fileBuffer = Buffer.alloc(0);

    // Collect file buffer directly from request body
    req.on('data', (chunk) => {
      fileBuffer = Buffer.concat([fileBuffer, chunk]);
    });

    req.on('end', async () => {
      const fileId = uuidv4();
      const uniqueDownloadLink = `/download/${fileId}`;

      await uploadFileToS3Buffer(fileBuffer, fileName);

      fileMetadata[fileId] = {
        fileName,
        maxDownloads,
        expiryDate: days ? Date.now() + days * 86400000 : null,
      };

      res.json({
        message: "✅ File uploaded!",
        downloadUrl: `http://localhost:3005${uniqueDownloadLink}`,  // Adjust for production domain if needed
        fileId,
      });
    });

    req.on('error', (err) => {
      console.error("❌ Stream error:", err.message);
      res.status(500).json({ error: "Stream error" });
    });

  } catch (error) {
    console.error("❌ Upload error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Helper to Upload Buffer Directly to B2
async function uploadFileToS3Buffer(fileBuffer, fileName) {
  await s3.putObject({
    Bucket: B2_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
  }).promise();
}

// Generate Signed URL for Downloads
async function generateSignedUrl(fileName) {
  return s3.getSignedUrl("getObject", {
    Bucket: B2_BUCKET_NAME,
    Key: fileName,
    Expires: 600, // 10 minutes
  });
}

// Download File Endpoint
app.get("/download/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;
    if (!fileMetadata[fileId]) {
      return res.status(404).sendFile(path.join(__dirname, "public", "error.html"));
    }

    const { fileName, expiryDate } = fileMetadata[fileId];

    if (expiryDate && Date.now() > expiryDate) {
      await deleteFile(fileId);
      return res.status(404).sendFile(path.join(__dirname, "public", "error.html"));
    }

    if (fileMetadata[fileId].maxDownloads === 0) {
      await deleteFile(fileId);
      return res.status(403).sendFile(path.join(__dirname, "public", "error.html"));
    }

    const signedUrl = await generateSignedUrl(fileName);
    fileMetadata[fileId].maxDownloads--;

    if (fileMetadata[fileId].maxDownloads === 0) {
      setTimeout(async () => await deleteFile(fileId), 5000);
    }

    res.redirect(signedUrl);
  } catch (error) {
    console.error("❌ Download error:", error.message);
    res.status(500).sendFile(path.join(__dirname, "public", "error.html"));
  }
});

// Delete File (Internal Cleanup Helper)
async function deleteFile(fileId) {
  try {
    const fileName = fileMetadata[fileId]?.fileName;
    if (!fileName) return;

    await s3.deleteObject({
      Bucket: B2_BUCKET_NAME,
      Key: fileName,
    }).promise();

    delete fileMetadata[fileId];
    console.log(`🗑️ Deleted file: ${fileName}`);
  } catch (error) {
    console.error("❌ Delete error:", error.message);
  }
}

// Manual Delete Endpoint (optional)
app.delete("/delete/:fileId", async (req, res) => {
  try {
    await deleteFile(req.params.fileId);
    res.json({ message: "✅ File deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Handle 404 Errors (For unknown routes)
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "error.html"));
});

// Start Server
app.listen(3005, () => {
  console.log("🚀 Server running on port 3005");
});
