const tf = require('@tensorflow/tfjs-node');
const path = require('path');
const Jimp = require('jimp');
const fs = require('fs');

// Function to classify the image
async function classifyImage(imagePath) {
  const modelPath = path.resolve(__dirname, 'model', 'model.json');
  const metadataPath = path.resolve(__dirname, 'model', 'metadata.json');

  try {
    // Load the Teachable Machine model
    const model = await tf.loadLayersModel(`file://${modelPath}`);

    // Load metadata to get class labels
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    const classLabels = metadata.labels;

    // Load and preprocess the image
    const image = await Jimp.read(imagePath);
    image.resize(224, 224).quality(100);
    const tensor = preprocessImage(image);

    // Make predictions
    const predictions = await model.predict(tensor).data();

    // Find the index with the highest probability
    const maxIndex = predictions.indexOf(Math.max(...predictions));
    const predictedClass = classLabels[maxIndex];

    return predictedClass;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// Function to preprocess the image
function preprocessImage(image) {
  const imageData = new Float32Array(224 * 224 * 3);
  let idx = 0;

  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
    const red = this.bitmap.data[idx + 0];
    const green = this.bitmap.data[idx + 1];
    const blue = this.bitmap.data[idx + 2];

    imageData[x * 224 * 3 + y * 3 + 0] = red / 255;
    imageData[x * 224 * 3 + y * 3 + 1] = green / 255;
    imageData[x * 224 * 3 + y * 3 + 2] = blue / 255;
  });

  const tensor = tf.tensor4d(imageData, [1, 224, 224, 3], 'float32');
  return tensor;
}

module.exports = { classifyImage };
