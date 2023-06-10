import { Request } from 'express';
import { Multer } from 'multer';

export interface MulterFile {
  originalname: string;
  [key: string]: any;
}

export interface FileData {
  id: string;
  original_name: string;
  name: string;
  path: string;
  size: number;
  creation_date: Date | string;
}

export type Vector3 = {
  x: number;
  y: number;
  z: number;
};

/////////////////////////

// Request Types

export interface TransformRequest extends Request {
  query: {
    scale?: string;
    offset?: string;
  };
  params: {
    fileId: string;
  };
}

export interface RenameRequest extends Request {
  body: {
    fileId: string;
    newName: string;
  };
}

export interface DeleteRequest extends Request {
  params: {
    fileId: string;
  };
}

export interface DownloadRequest extends Request {
  params: {
    fileId: string;
  };
}
