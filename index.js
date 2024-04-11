const express = require('express');
const bodyParser = require('body-parser');
const vision = require('@google-cloud/vision');

const app = express();
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;

// Creates a client
const client = new vision.ImageAnnotatorClient();

app.post('/api/process-image', async (req, res) => {
    const { imageData } = req.body;

    try {
        const request = {
            image: { content: imageData },
            features: [{ type: "TEXT_DETECTION" }],
        };

        const [result] = await client.textDetection(request);
        if (!result || result.error) {
            throw new Error(result.error ? result.error.message : "Unknown error during text detection.");
        }

        const detections = result.textAnnotations;
        res.json({
            success: true,
            extractedText: detections.length > 0 ? detections[0].description : 'No text found.'
        });
    } catch (error) {
        console.error('Error processing image:', error);

        // Specific error feedback based on common issues
        let errorMessage = 'Error processing image data.';
        if (error.message.includes('Image processing error')) {
            errorMessage = 'The image could not be processed.';
        } else if (error.message.includes('API not enabled')) {
            errorMessage = 'The Vision API has not been enabled for this project.';
        } else if (error.message.includes('permission denied')) {
            errorMessage = 'Permission denied for accessing the Vision API.';
        } else if (error.message.includes('invalid')) {
            errorMessage = 'The provided image is invalid or in an unsupported format.';
        }

        // Send a detailed error message to the client
        res.status(500).json({ error: true, message: errorMessage });
    }
});
