// src/components/CloudUpload.js

import React, { useState } from 'react';
import axios from 'axios';
// import './cloudupload.css'; 

const CloudUpload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [loading, setLoading] = useState(false); // New loading state

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!file) {
      setMessage('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true); // Set loading to true when starting upload

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage(response.data.message);
      setFileUrl(response.data.fileUrl);
    } catch (error) {
      setMessage('Error uploading file: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false); // Reset loading state after upload completes
    }
  };

  return (
    <div className="container"> {/* Apply the container class for background */}
      <h2>Upload File to Backblaze B2</h2>
      {loading && <p>Loading...</p>} {/* Show loading message */}
      <form onSubmit={handleUpload}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit" disabled={loading}>Upload</button> {/* Disable button while loading */}
      </form>
      {message && <p>{message}</p>}
      {fileUrl && <a href={fileUrl} target="_blank" rel="noopener noreferrer">View Uploaded File</a>}
    </div>
  );
};

export default CloudUpload;
