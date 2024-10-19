
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto'); // For SHA1 hashing

// Set up your Backblaze B2 credentials from the .env file
const {
  B2_APPLICATION_KEY_ID,
  B2_APPLICATION_KEY,
  BUCKET_ID,
  ENDPOINT // Custom Endpoint if needed
} = process.env;

console.log('B2 Application Key ID:', B2_APPLICATION_KEY_ID);
console.log('Bucket ID:', BUCKET_ID);

// Initialize the Express server
const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Set up Multer for handling file uploads to a temporary location
const upload = multer({
  dest: 'uploads/' // Temporary storage for uploaded files
});

// Get B2 Authorization Token
async function getB2AuthToken() {
  const credentials = Buffer.from(`${B2_APPLICATION_KEY_ID}:${B2_APPLICATION_KEY}`).toString('base64');

  try {
    const response = await axios({
      method: 'get',
      url: 'https://api.backblazeb2.com/b2api/v2/b2_authorize_account',
      headers: {
        Authorization: `Basic ${credentials}`
      }
    });

    const { authorizationToken, apiUrl } = response.data;
    return { authorizationToken, apiUrl };
  } catch (error) {
    console.error('Error authenticating with B2:', error.response.data);
    throw new Error('Failed to authenticate with Backblaze B2.');
  }
}

// Upload file to Backblaze B2
async function uploadFileToB2(filePath, fileName) {
  console.log('Uploading file:', filePath, 'as', fileName);
  
  // Get authorization token and API URL
  const { authorizationToken, apiUrl } = await getB2AuthToken();

  try {
    // Get upload URL
    const uploadUrlResponse = await axios.post(`${apiUrl}/b2api/v2/b2_get_upload_url`, {
      bucketId: BUCKET_ID,
    }, {
      headers: { Authorization: authorizationToken },
    });

    const { uploadUrl, authorizationToken: uploadToken } = uploadUrlResponse.data;

    // Read the file into memory (instead of streaming)
    const fileBuffer = fs.readFileSync(filePath);
    const fileHash = crypto.createHash('sha1').update(fileBuffer).digest('hex');

    // Upload the file to B2
    const response = await axios({
      method: 'post',
      url: uploadUrl,
      headers: {
        Authorization: uploadToken,
        'Content-Type': 'application/octet-stream',
        'X-Bz-File-Name': fileName,
        'X-Bz-Content-Sha1': fileHash,
        'Content-Length': fileBuffer.length, // Set the content length explicitly
        'X-Bz-Info-Author': 'your-name', // Optional custom file metadata
      },
      data: fileBuffer,  // Use buffer instead of stream
    });

    return response.data;
  } catch (error) {
    console.error('Error during file upload:', error.response ? error.response.data : error.message);
    throw new Error('Failed to upload file to Backblaze B2.');
  }
}


// Define the API endpoint for file uploads
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const fileName = `${Date.now()}_${req.file.originalname}`;
    const filePath = path.join(__dirname, req.file.path); // Make sure this path is correct

    const uploadResponse = await uploadFileToB2(filePath, fileName);

    // Optionally remove the file from local storage
    fs.unlinkSync(filePath);

    res.status(200).json({
      message: 'File uploaded successfully',
      fileId: uploadResponse.fileId,
      fileName: fileName,
      fileUrl: `${ENDPOINT}/${fileName}`, // Adjust based on your setup
    });
  } catch (error) {
    console.error('Error uploading file:', error.message); // Log the error
    res.status(500).json({ error: error.message });
  }
});

// A simple health check endpoint to test the server
app.get('/', (req, res) => {
  res.send('Backblaze B2 File Upload Server is Running.');
});

// Start the server on a specific port
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
