const express = require('express');
const bodyParser = require('body-parser');
const vision = require('@google-cloud/vision');

const app = express();
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;

// Creates a client
const client = new vision.ImageAnnotatorClient();

app.post('/api/process-image', async (req, res) => {
    const { imageData } = req.body; // Assume imageData is a Base64 encoded string

    try {
        // Prepares the request for the Vision API
        const request = {
            image: { content: imageData },
            features: [{type: "TEXT_DETECTION"}],
        };

        // Detects text in the image
        const [result] = await client.textDetection(request);
        const detections = result.textAnnotations;
        console.log('Detected text:', detections[0] ? detections[0].description : 'No text found.');

        // Return the extracted text (and any other desired analysis results) to the client
        res.json({
            success: true,
            extractedText: detections[0] ? detections[0].description : '',
        });
    } catch (error) {
        console.error('Failed to process image:', error);
        res.status(500).send('Error processing image data.');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
