const express = require("express");
const path = require("path");
const multer = require("multer");
const AWS = require("aws-sdk");
const fs = require("fs");
const schedule = require("node-schedule");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const upload = multer({ dest: "uploads/" });

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

let fileMetadata = {}; // Track file expiration and download limits

// Optimized Multipart Upload Function
async function uploadFileToS3(filePath, fileName) {
  const fileSize = fs.statSync(filePath).size;
  const partSize = 5 * 1024 * 1024; // 50MB per part
  const numParts = Math.ceil(fileSize / partSize);

  console.log(`🚀 Uploading file in ${numParts} parts (Parallel Mode)...`);

  // Start Multipart Upload
  const { UploadId } = await s3.createMultipartUpload({
    Bucket: B2_BUCKET_NAME,
    Key: fileName,
  }).promise();

  const fileBuffer = fs.readFileSync(filePath);
  let uploadPromises = [];

  for (let partNumber = 1; partNumber <= numParts; partNumber++) {
    const start = (partNumber - 1) * partSize;
    const end = Math.min(start + partSize, fileSize);
    const chunk = fileBuffer.slice(start, end);

    // Upload each part asynchronously and store its result
    uploadPromises.push(
      s3.uploadPart({
        Bucket: B2_BUCKET_NAME,
        Key: fileName,
        UploadId,
        PartNumber: partNumber,
        Body: chunk,
      }).promise().then((data) => ({
        ETag: data.ETag,
        PartNumber: partNumber,
      }))
    );
  }

  // Wait for all parts to upload
  let uploadedParts = await Promise.all(uploadPromises);

  // ✅ Fix: Ensure parts are sorted before finalizing upload
  uploadedParts.sort((a, b) => a.PartNumber - b.PartNumber);

  console.log("🔄 Completing multipart upload...");
  await s3.completeMultipartUpload({
    Bucket: B2_BUCKET_NAME,
    Key: fileName,
    UploadId,
    MultipartUpload: { Parts: uploadedParts },
  }).promise();

  console.log("✅ Parallel Multipart Upload Complete!");
}


// Upload File Endpoint
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "❌ No file uploaded!" });

    const { days, maxDownloads } = req.body;
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const fileId = uuidv4();
    const uniqueDownloadLink = `/download/${fileId}`;

    await uploadFileToS3(filePath, fileName);

    fileMetadata[fileId] = {
      fileName,
      maxDownloads: parseInt(maxDownloads) || Infinity,
      expiryDate: days ? Date.now() + days * 86400000 : null,
    };

    if (days) {
      schedule.scheduleJob(new Date(fileMetadata[fileId].expiryDate), async () => {
        await deleteFile(fileId);
      });
    }

    res.json({
      message: "✅ File uploaded!",
      downloadUrl: `http://localhost:3005${uniqueDownloadLink}`,
      fileId,
    });
  } catch (error) {
    console.error("❌ Upload error:", error.message);
    res.status(500).json({ error: error.message });
  } finally {
    fs.unlinkSync(req.file.path);
  }
});

// Generate Signed URL
async function generateSignedUrl(fileName) {
  return s3.getSignedUrl("getObject", {
    Bucket: B2_BUCKET_NAME,
    Key: fileName,
    Expires: 600,
  });
}

// Download File
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

// Delete File Function
async function deleteFile(fileId) {
  try {
    const fileName = fileMetadata[fileId]?.fileName;
    if (!fileName) return;

    await s3.deleteObject({
      Bucket: B2_BUCKET_NAME,
      Key: fileName,
    }).promise();

    console.log(`🗑️ File ${fileName} deleted.`);
    delete fileMetadata[fileId];
  } catch (error) {
    console.error("❌ Delete error:", error.message);
  }
}

// Manual Delete API
app.delete("/delete/:fileId", async (req, res) => {
  try {
    await deleteFile(req.params.fileId);
    res.json({ message: "🗑️ File deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Handle 404 Errors (For any other routes)
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "error.html"));
});

// Start Server
app.listen(3005, () => console.log("🚀 Server running on port 3005"));
