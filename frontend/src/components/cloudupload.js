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

const API_BASE_URL = "https://fastshare-rj89.vercel.app";  // Backend URL

const CloudUpload = () => {
    const [file, setFile] = useState(null);
    const [maxDownloads, setMaxDownloads] = useState(1);
    const [expiryDays, setExpiryDays] = useState(1);
    const [uploading, setUploading] = useState(false);
    const [downloadLink, setDownloadLink] = useState("");
    const [uploadType, setUploadType] = useState("downloads");
    const [copied, setCopied] = useState(false);

    const handleFileChange = (e) => setFile(e.target.files[0]);

    const handleUpload = async () => {
        if (!file) {
            alert("❌ Please select a file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        const headers = {
            "x-file-name": encodeURIComponent(file.name),
        };

        if (uploadType === "downloads" || uploadType === "both") {
            headers["x-max-downloads"] = maxDownloads;
        }
        if (uploadType === "time" || uploadType === "both") {
            headers["x-days"] = expiryDays;
        }

        try {
            setUploading(true);
            const response = await axios.post(`${API_BASE_URL}/upload`, formData, { headers });
            setDownloadLink(response.data.downloadUrl);
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(downloadLink)
            .then(() => setCopied(true))
            .catch(() => alert("Failed to copy link!"));

        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div>
            <Typography variant="h4">Cloud File Upload</Typography>
            <input type="file" onChange={handleFileChange} />
            
            <FormControl>
                <Typography>Upload Type:</Typography>
                <RadioGroup value={uploadType} onChange={(e) => setUploadType(e.target.value)}>
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
                />
            )}

            {uploadType !== "downloads" && (
                <TextField
                    label="Expiry Days"
                    type="number"
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(e.target.value)}
                />
            )}

            <Button onClick={handleUpload} disabled={uploading}>
                {uploading ? <CircularProgress size={24} /> : "Upload"}
            </Button>

            {downloadLink && (
                <div>
                    <Typography>Download Link:</Typography>
                    <Typography>{downloadLink}</Typography>
                    <Button onClick={copyToClipboard}>{copied ? "Copied!" : "Copy Link"}</Button>
                </div>
            )}
        </div>
    );
};

export default CloudUpload;
