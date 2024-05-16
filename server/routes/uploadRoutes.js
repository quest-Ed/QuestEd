const { Router } = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const router = Router();

async function extractTextFromPDF(pdfPath) {
    let dataBuffer = fs.readFileSync(pdfPath);
    try {
        let data = await pdf(dataBuffer);
        return data.text;  // Extracted text from PDF
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        return null;
    }
}


// Route for file upload
router.post('/upload', upload.single('document'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    console.log('Uploaded file:', req.file.path);
    const extractedText = await extractTextFromPDF(req.file.path);
    console.log('Extracted text:', extractedText);

    // You can add further processing here or return the extracted text to the client
    res.send({ message: 'File uploaded and text extracted.', extractedText });
});

module.exports = router;
