const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const VISION_API_KEY = 'AIzaSyAuzo1Gi9xUOJJ790SkMh-wveNqS0DoFUQ';

app.use(cors());
app.use(bodyParser.json());

app.post('/api/process-image', async (req, res) => {
    const { imageData } = req.body;

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
            const errorDetails = await visionResponse.json();
            throw new Error(`Vision API error: ${errorDetails.error.message}`);
        }

        const visionData = await visionResponse.json();
        
        if (visionData.error) {
            throw new Error(`Vision API error: ${visionData.error.message}`);
        }

        console.log('Vision API response:', visionData);

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
