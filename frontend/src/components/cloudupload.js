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

    const formData = new FormData();
    formData.append("file", file);

    if (uploadType === "downloads") {
      formData.append("maxDownloads", maxDownloads);
    } else if (uploadType === "time") {
      formData.append("days", expiryDays);
    } else if (uploadType === "both") {
      formData.append("maxDownloads", maxDownloads);
      formData.append("days", expiryDays);
    }

    try {
      setUploading(true);

      const response = await axios.post("http://localhost:3005/upload", formData);

      setDownloadLink(response.data.downloadUrl);
    } catch (error) {
      console.error("❌ Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = () => {
    if (!navigator.clipboard) {
      // Fallback for browsers that do not support the Clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = downloadLink;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        const successful = document.execCommand("copy");
        if (successful) {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } else {
          console.error("Failed to copy text using fallback method.");
        }
      } catch (err) {
        console.error("Fallback copy method failed:", err);
      }
      document.body.removeChild(textArea);
      return;
    }
  
    // Use the Clipboard API if available
    navigator.clipboard
      .writeText(downloadLink)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch((err) => {
        console.error("Failed to copy text:", err);
      });
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
      animation: "fadeIn 0.8s ease-in",
    },
    contentWrapper: {
      width: "100%",
      maxWidth: "600px",
      margin: "0 auto",
      textAlign: "center",
    },
    title: {
      fontSize: "2.4rem",
      color: "#2c3e50",
      margin: "1rem 0", // Reduced margin
      textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
      animation: "slideUp 0.6s ease-out",
    },
    uploadBox: {
      background: "rgba(255,255,255,0.95)",
      padding: "1rem",
      borderRadius: "15px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      animation: "fadeIn 0.6s ease-out",
    },
    fileInputContainer: {
      margin: "0.5rem 0",
      position: "relative",
    },
    customFileInput: {
      background: "linear-gradient(45deg, #4caf50, #45a049)",
      color: "white",
      padding: "1rem 3rem",
      borderRadius: "30px",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: "0.5rem",
      boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      fontSize: "1rem", 
      fontWeight: "500",
      border: "none",
      outline: "none",
      "&:hover": {
        transform: "scale(1.05)",
        boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
      },
    },
    radioGroup: {
      margin: "1rem 0",
      "& .MuiTypography-root": {
        fontSize: "1rem",
        fontWeight: "400",
      },
    },
    input: {
      margin: "0.5rem 0",
      width: "100%",
      "& .MuiOutlinedInput-root": {
        borderRadius: "10px",
        background: "rgba(245, 245, 245, 0.9)",
      },
    },
    uploadButton: {
      padding: "0.5rem 1.5rem",
      background: "linear-gradient(45deg, #2196f3, #1976d2)",
      color: "white",
      border: "none",
      borderRadius: "30px",
      cursor: "pointer",
      fontSize: "1.1rem",
      fontWeight: "500",
      boxShadow: "0 4px 15px rgba(33,150,243,0.3)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      margin: "0.5rem 0",
      "&:hover:enabled": {
        transform: "scale(1.05)",
        boxShadow: "0 6px 25px rgba(33,150,243,0.4)",
      },
      "&:disabled": {
        background: "linear-gradient(45deg, #cccccc, #aaaaaa)",
        cursor: "not-allowed",
        opacity: "0.7",
      },
    },
    downloadContainer: {
      background: "rgba(255,255,255,0.95)",
      padding: "1rem",
      borderRadius: "15px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      margin: "1rem 0",
      animation: "fadeIn 0.6s ease-out",
    },
    downloadUrl: {
      color: "#2196f3",
      wordBreak: "break-all",
      margin: "1.5rem 0",
      padding: "1rem",
      background: "#f8f9fa",
      borderRadius: "10px",
    },
    copyButton: {
      background: "linear-gradient(45deg, #4caf50, #45a049)",
      color: "white",
      padding: "1rem 2rem",
      borderRadius: "25px",
      textDecoration: "none",
      display: "inline-flex",
      alignItems: "center",
      gap: "0.5rem",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      transition: "transform 0.2s, box-shadow 0.2s",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 6px 15px rgba(76,175,80,0.3)",
      },
    },
    globalAnimations: `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `,
  };

  return (
    <div style={styles.container}>
      <style>{styles.globalAnimations}</style>
      
      <div style={styles.contentWrapper}>
        <Typography variant="h1" sx={styles.title}>☁️ Cloud File Upload</Typography>

        <div style={styles.uploadBox}>
          <div style={styles.fileInputContainer}>
            <input 
              type="file" 
              onChange={handleFileChange} 
              id="fileInput"
              style={{ display: "none" }}
            />
            <label 
              htmlFor="fileInput" 
              style={styles.customFileInput}
            >
              📁 Select File
            </label>
          </div>

          <FormControl component="fieldset" sx={styles.radioGroup}>
            <Typography variant="h6">Upload Type:</Typography>
            <RadioGroup
              row
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value)}
              sx={{ justifyContent: "center", gap: "1rem" }}
            >
              <FormControlLabel 
                value="downloads" 
                control={<Radio color="primary" />} 
                label="Limit Downloads" 
              />
              <FormControlLabel 
                value="time" 
                control={<Radio color="primary" />} 
                label="Time Limit" 
              />
              <FormControlLabel 
                value="both" 
                control={<Radio color="primary" />} 
                label="Both Limits" 
              />
            </RadioGroup>
          </FormControl>

          {uploadType !== "time" && (
            <TextField
              label="Max Downloads"
              type="number"
              value={maxDownloads}
              onChange={(e) => setMaxDownloads(e.target.value)}
              variant="outlined"
              sx={styles.input}
            />
          )}

          {uploadType !== "downloads" && (
            <TextField
              label="Expiry Days"
              type="number"
              value={expiryDays}
              onChange={(e) => setExpiryDays(e.target.value)}
              variant="outlined"
              sx={styles.input}
            />
          )}

          <Button 
            variant="contained"
            onClick={handleUpload} 
            disabled={uploading} 
            sx={styles.uploadButton}
          >
            {uploading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "🚀 Upload File"
            )}
          </Button>

          {downloadLink && (
            <div style={styles.downloadContainer}>
              <Typography variant="h6" gutterBottom>
                ✅ Upload Successful!
              </Typography>
              <Typography variant="body1" sx={styles.downloadUrl}>
                {downloadLink}
              </Typography>
              <Tooltip title={copied ? "Copied!" : "Copy to clipboard"} arrow>
                <Button
                  variant="contained"
                  onClick={copyToClipboard}
                  sx={styles.copyButton}
                >
                  📋 Copy Link
                </Button>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CloudUpload;