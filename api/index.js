const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const API_ENDPOINTS = [
  'https://savesora.com/api/download-video-new',
  'https://savesora.com/api/download-video',
  'https://savesora.com/api/download'
];

app.post('/api/resolve', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    let result = null;
    for (const endpoint of API_ENDPOINTS) {
      try {
        const response = await axios.post(endpoint, { url }, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          },
          timeout: 10000
        });

        if (response.data && (response.data.url || response.data.data?.url)) {
          result = response.data.url || response.data.data.url;
          break;
        }
      } catch (err) {
        console.error(`Failed at ${endpoint}:`, err.message);
      }
    }

    if (result) {
      res.json({ success: true, downloadUrl: result });
    } else {
      res.status(404).json({ error: 'Could not resolve download link. Make sure the video is public.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;