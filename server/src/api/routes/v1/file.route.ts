import express from 'express';

import {
  uploadFile,
  listFiles,
  renameFile,
  downloadFile,
  deleteFile,
  transformFile,
} from '../../controllers/file.controller';
import { multerHandler } from '../../middleware/multer';

const router = express.Router();

router.post('/upload-file', multerHandler, uploadFile);

router.get('/list', listFiles);

router.put('/rename-file', renameFile);

router.get('/download/:fileId', downloadFile);

router.delete('/delete/:fileId', deleteFile);

router.get('/transform/:fileId', transformFile);

export default router;
