const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();

app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const VISION_API_KEY = 'AIzaSyAuzo1Gi9xUOJJ790SkMh-wveNqS0DoFUQ'; // Not recommended for production

app.post('/api/process-image', async (req, res) => {
    const { imageData } = req.body; // Expect Base64 encoded image data from the client

    const url = `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`;

    const requestBody = {
        requests: [
            {
                image: {
                    content: imageData
                },
                features: [{ type: 'TEXT_DETECTION' }]
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
            // Error details from the Vision API might be included in the response body
            const errorDetails = await visionResponse.json();
            throw new Error(`Vision API error: ${errorDetails.error.message}`);
        }

        const visionData = await visionResponse.json();
        
        if (visionData.error) {
            throw new Error(`Vision API error: ${visionData.error.message}`);
        }

        console.log('Vision API response:', visionData); // For debugging

        const detectedText = visionData.responses[0].textAnnotations
            ? visionData.responses[0].textAnnotations[0].description
            : 'No text detected.';
        
        res.json({
            success: true,
            detectedText: detectedText
        });
    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process image with Vision API.',
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
