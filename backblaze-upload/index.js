const express = require("express");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ Enable CORS - Make sure this matches your frontend URL
app.use(cors({
    origin: "https://fastshare-orpin.vercel.app",
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "x-file-name", "x-days", "x-max-downloads"]
}));

// ✅ Multer for file handling (works with Vercel)
const upload = multer();

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

let fileMetadata = {}; // For expiry & download limit tracking

// 📤 Upload Endpoint
app.post("/upload", upload.single("file"), async (req, res) => {
    const fileBuffer = req.file.buffer;
    const fileName = decodeURIComponent(req.headers["x-file-name"]);
    const days = parseInt(req.headers["x-days"] || "0", 10);
    const maxDownloads = parseInt(req.headers["x-max-downloads"] || "Infinity", 10);

    if (!fileName) {
        return res.status(400).json({ error: "❌ Missing file name!" });
    }

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
        return res.status(404).send("File not found or expired");
    }

    if (metadata.expiryDate && Date.now() > metadata.expiryDate) {
        await deleteFile(fileId);
        return res.status(404).send("File expired");
    }

    if (metadata.maxDownloads <= 0) {
        await deleteFile(fileId);
        return res.status(403).send("Download limit reached");
    }

    const signedUrl = await generateSignedUrl(metadata.fileName);
    metadata.maxDownloads--;

    if (metadata.maxDownloads === 0) {
        setTimeout(() => deleteFile(fileId), 5000);
    }

    res.redirect(signedUrl);
});

async function generateSignedUrl(fileName) {
    return s3.getSignedUrlPromise("getObject", {
        Bucket: B2_BUCKET_NAME,
        Key: fileName,
        Expires: 3600,
    });
}

async function deleteFile(fileId) {
    const fileName = fileMetadata[fileId]?.fileName;
    if (!fileName) return;

    await s3.deleteObject({
        Bucket: B2_BUCKET_NAME,
        Key: fileName,
    }).promise();

    delete fileMetadata[fileId];
}

// Start server
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
