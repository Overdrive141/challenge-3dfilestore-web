import type { Request } from 'express';
import path from 'path';
import multer from 'multer';
import { MulterFile } from '../api/utils/types';
import { uploadDir } from './vars';

// Multer setup
const storage = multer.diskStorage({
  destination: (req: Request, file: MulterFile, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadDir);
  },
  filename: (req: Request, file: MulterFile, cb: (error: Error | null, destination: string) => void) => {
    const uniqueName = `${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage: storage,
});
