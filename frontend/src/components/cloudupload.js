import React, { useState } from "react";
import axios from "axios";
import {
  Button,
  TextField,
  Typography,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Tooltip,
} from "@mui/material";

const CloudUpload = () => {
  const [file, setFile] = useState(null);
  const [maxDownloads, setMaxDownloads] = useState(1);
  const [expiryDays, setExpiryDays] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [downloadLink, setDownloadLink] = useState("");
  const [uploadType, setUploadType] = useState("downloads");
  const [copied, setCopied] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("❌ Please select a file first.");
      return;
    }

    const headers = {
      "Content-Type": "application/octet-stream",
      "X-File-Name": encodeURIComponent(file.name),
    };

    if (uploadType === "downloads") {
      headers["X-Max-Downloads"] = maxDownloads;
    } else if (uploadType === "time") {
      headers["X-Days"] = expiryDays;
    } else if (uploadType === "both") {
      headers["X-Max-Downloads"] = maxDownloads;
      headers["X-Days"] = expiryDays;
    }

    try {
      setUploading(true);

      const response = await axios.post("https://fastshare-rj89.vercel.app/upload", file, {
        headers,
      });

      setDownloadLink(response.data.downloadUrl);
    } catch (error) {
      console.error("❌ Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(downloadLink)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch((err) => console.error("Failed to copy text:", err));
  };

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      padding: "1rem",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    contentWrapper: {
      width: "100%",
      maxWidth: "600px",
      textAlign: "center",
    },
    title: {
      fontSize: "2.4rem",
      margin: "1rem 0",
    },
    uploadBox: {
      background: "white",
      padding: "1rem",
      borderRadius: "15px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    },
    fileInputContainer: {
      margin: "1rem 0",
    },
    fileInputButton: {
      background: "#4caf50",
      color: "white",
      padding: "0.8rem 2rem",
      borderRadius: "20px",
      cursor: "pointer",
      fontWeight: "bold",
    },
    input: {
      margin: "0.5rem 0",
      width: "100%",
    },
    uploadButton: {
      marginTop: "1rem",
      background: "#2196f3",
      color: "white",
    },
    downloadBox: {
      marginTop: "1rem",
      background: "#f1f1f1",
      padding: "1rem",
      borderRadius: "10px",
      wordBreak: "break-word",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.contentWrapper}>
        <Typography variant="h3" style={styles.title}>
          ☁️ Cloud File Upload
        </Typography>

        <div style={styles.uploadBox}>
          <div style={styles.fileInputContainer}>
            <input
              type="file"
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="file-input"
            />
            <label htmlFor="file-input" style={styles.fileInputButton}>
              Select File
            </label>
          </div>

          <FormControl component="fieldset" style={{ margin: "1rem 0" }}>
            <Typography variant="h6">Upload Type:</Typography>
            <RadioGroup
              row
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value)}
            >
              <FormControlLabel value="downloads" control={<Radio />} label="Limit Downloads" />
              <FormControlLabel value="time" control={<Radio />} label="Time Limit" />
              <FormControlLabel value="both" control={<Radio />} label="Both" />
            </RadioGroup>
          </FormControl>

          {uploadType !== "time" && (
            <TextField
              label="Max Downloads"
              type="number"
              value={maxDownloads}
              onChange={(e) => setMaxDownloads(e.target.value)}
              variant="outlined"
              style={styles.input}
            />
          )}

          {uploadType !== "downloads" && (
            <TextField
              label="Expiry Days"
              type="number"
              value={expiryDays}
              onChange={(e) => setExpiryDays(e.target.value)}
              variant="outlined"
              style={styles.input}
            />
          )}

          <Button
            variant="contained"
            style={styles.uploadButton}
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? <CircularProgress size={24} /> : "🚀 Upload File"}
          </Button>

          {downloadLink && (
            <div style={styles.downloadBox}>
              <Typography>✅ Upload Successful!</Typography>
              <Typography>{downloadLink}</Typography>
              <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
                <Button onClick={copyToClipboard}>📋 Copy Link</Button>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CloudUpload;
