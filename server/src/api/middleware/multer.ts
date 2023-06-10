import express, { Request, Response } from 'express';
import { upload } from '../../config/multer';

// TODO: Handle case when upload folder was deleted when server is running
// TODO: Handle case when file system got full

export const multerHandler = (req: Request, res: Response, next: express.NextFunction) => {
  upload.single('file')(req, res, function (err) {
    if (err) {
      return res.status(400).json({ error: `Multer Error: ${err.message}` });
    }
    next();
  });
};
