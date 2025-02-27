import React, { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Button, Typography, CircularProgress } from "@mui/material";

const DownloadPage = () => {
  const { fileId } = useParams();
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3005/download/${fileId}`);
      window.location.href = response.request.responseURL; // Redirect to the file
    } catch (error) {
      alert("File not found or expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <Typography variant="h4">Download File</Typography>
      <Button variant="contained" color="secondary" onClick={handleDownload} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : "Download"}
      </Button>
    </div>
  );
};

export default DownloadPage;
