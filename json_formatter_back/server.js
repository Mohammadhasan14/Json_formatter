const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const uuid = require('uuid'); 

const app = express();
const port = process.env.PORT || 5000;


app.use(cors());


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const upload = multer({ dest: 'uploads/' });


app.post('/upload', upload.single('jsonFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const filePath = path.join(__dirname, 'uploads', req.file.filename);
  

  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading file.');
    }

    try {
      const jsonData = JSON.parse(data);
      res.status(200).json({ formattedJson: JSON.stringify(jsonData, null, 2), filePath });
    } catch (err) {
      res.status(400).send('Invalid JSON format.');
    }
  });
});


app.post('/save-edited-json', (req, res) => {
  const { jsonData } = req.body;

  if (!jsonData) {
    return res.status(400).send('No JSON data provided.');
  }

  const newFilePath = path.join(__dirname, 'uploads', `${uuid.v4()}.json`);
  

  fs.writeFile(newFilePath, JSON.stringify(jsonData, null, 2), (err) => {
    if (err) {
      return res.status(500).send('Error saving edited file.');
    }


    res.download(newFilePath, 'edited-file.json', (err) => {
      if (err) {
        return res.status(500).send('Error downloading the file.');
      }


      fs.unlink(newFilePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
