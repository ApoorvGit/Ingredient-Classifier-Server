const express = require('express');
const multer = require('multer');
const { classifyImage } = require('./ingredientClassifier/ingredientClassification'); // Replace with the actual file name containing the classification function
const cors = require('cors');

const app = express();
const upload = multer({ dest: 'uploads/' }); // Destination folder to store uploaded images

// Enable CORS
app.use(cors());
app.get('/ping', (req, res)=>{
    res.send("abcd");
})
// API endpoint to classify the image
app.post('/classify', upload.single('image'), async (req, res) => {
    console.log("fuck server")
  try {
    const imagePath = req.file.path; // Path of the uploaded image
    const predictedClass = await classifyImage(imagePath);

    if (predictedClass) {
      res.json({ class: predictedClass });
    } else {
      res.status(500).json({ error: 'Failed to classify the image' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

// Start the server
const port = 3000; // You can change the port number if needed
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
