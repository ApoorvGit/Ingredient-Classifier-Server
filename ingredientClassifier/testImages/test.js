const fs = require('fs');
const path = require('path');
const { classifyImage } = require('../ingredientClassification');

// Function to read all files in a directory
function readFilesFromDir(directory) {
  return fs.readdirSync(directory).filter(file => fs.lstatSync(path.join(directory, file)).isFile());
}

// Function to test and calculate accuracy
async function testAccuracy() {
  const testDataPath = path.resolve(__dirname);
  const metadataPath = path.resolve(__dirname, '../', 'model', 'metadata.json');
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  const classLabels = metadata.labels;
  
  const totalFiles = classLabels.reduce((count, label) => {
    const files = readFilesFromDir(path.join(testDataPath, label));
    return count + files.length;
  }, 0);

  let correctPredictions = 0;
  let totalPredictions = 0;

  for (const label of classLabels) {
    const files = readFilesFromDir(path.join(testDataPath, label));
    for (const file of files) {
      const imagePath = path.join(testDataPath, label, file);
      const predictedClass = await classifyImage(imagePath);

      console.log(`Actual: ${label} | Predicted: ${predictedClass}`);

      if (label === predictedClass) {
        correctPredictions++;
      }
      totalPredictions++;
    }
  }

  const accuracy = (correctPredictions / totalPredictions) * 100;
  console.log(`Accuracy: ${accuracy.toFixed(2)}%`);
}

testAccuracy();
