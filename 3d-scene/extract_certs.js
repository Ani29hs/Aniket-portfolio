import { createWorker } from 'tesseract.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetDir = path.join(__dirname, 'src', 'assets');

async function extractText() {
    const worker = await createWorker('eng');

    const files = [
        '2410993113_Cyber_page-0001.jpg',
        '2410993113_page-0001.jpg',
        'Cert254114737332_page-0001.jpg',
        'Cert767114756848_page-0001.jpg'
    ];

    for (const file of files) {
        console.log(`\n\n=== Reading ${file} ===`);
        const { data: { text } } = await worker.recognize(path.join(assetDir, file));

        // Clean up the text by removing excessive newlines for easy copy-pasting
        const cleanText = text.replace(/\n+/g, ' ').trim();
        console.log(cleanText);
    }

    await worker.terminate();
}

extractText();
