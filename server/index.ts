import type { Request, Response } from 'express';
import app from './src/config/express';
import dotenv from 'dotenv';
import fs from 'fs';
import { metadataFile, uploadDir } from './src/config/vars';

dotenv.config();

const port = process.env.PORT;

// const uploadDir: string = './uploads';
// const metadataFile: string = `${uploadDir}/files.json`;

/**
 * Startup Code
 */

// Create uploads directory if not exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
// Create empty files.json on startup for metadata
if (!fs.existsSync(metadataFile)) {
  fs.writeFileSync(metadataFile, '[]');
}

/**
 * Health Check
 */
app.get('/', (req: Request, res: Response) => {
  res.send('Status: OK');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
