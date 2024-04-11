const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/api/process-image', async (req, res) => {
    const { imageData } = req.body; // Expect Base64 encoded image data from the client

    const apiKey = 'AIzaSyAuzo1Gi9xUOJJ790SkMh-wveNqS0DoFUQ'; // Place your Google Cloud Vision API key here
    const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

    const requestBody = {
        requests: [
            {
                image: {
                    content: imageData
                },
                features: [
                    {
                        type: 'TEXT_DETECTION'
                    }
                ]
            }
        ]
    };

    try {
        const visionResponse = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: { 'Content-Type': 'application/json' },
        });

        if (!visionResponse.ok) {
            throw new Error(`Vision API HTTP error! Status: ${visionResponse.status}`);
        }

        const visionData = await visionResponse.json();
        console.log(visionData); // For debugging, shows in the server's console

        // Extract and return the detected text
        const detectedText = visionData.responses[0].textAnnotations
            ? visionData.responses[0].textAnnotations[0].description
            : 'No text detected.';
        res.json({ success: true, detectedText: detectedText });
    } catch (error) {
        console.error('Error processing image with Vision API:', error);
        res.status(500).json({ success: false, message: 'Failed to process image with Vision API.', error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
