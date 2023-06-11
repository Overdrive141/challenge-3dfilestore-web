import express, { Request, Response } from 'express';
import fs from 'fs';
import { Worker } from 'worker_threads';
import { v4 as uuidv4 } from 'uuid';

import {
  DeleteRequest,
  DownloadRequest,
  FileData,
  MulterFile,
  RenameRequest,
  TransformRequest,
  Vector3,
} from '../utils/types';
import { checkFileExists, constructFileNameOnUpload, fileCleanup, readFileData, writeFileData } from '../utils';
import { access } from 'fs/promises';

//-----------------------------------------------------------------------------

// TODO: Handle race conditions for updating files.json metadata when
//       multiple clients upload file, rename file or delete file.
//       Implement queue management using Kafka

export const uploadFile = async (req: Request, res: Response, next: express.NextFunction) => {
  if (!req.file) {
    return res.status(400).json({ error: 'File missing in the request' });
  }

  const file = req.file as Express.Multer.File;

  try {
    const metadata: FileData = {
      id: uuidv4(),
      original_name: file.originalname, // to keep track of files with same names
      name: file.originalname,
      path: file.path,
      size: file.size,
      creation_date: new Date().toISOString(),
    };

    let fileData: FileData[] = await readFileData();

    // Check if a similar file name exists in JSON
    const fileWithSameName = fileData.find(file => file.original_name === metadata.name);
    if (fileWithSameName) {
      metadata.name = constructFileNameOnUpload(fileData, metadata.name);
    }

    fileData.push(metadata);

    // Save Metadata
    await writeFileData(fileData);
    res.status(200).json(metadata);
  } catch (err) {
    console.error('ERROR Uploading File');
    res.status(400).json({ error: 'Error while uploading. ' + err });
  }
};

//-----------------------------------------------------------------------------

export const listFiles = async (req: Request, res: Response) => {
  try {
    const fileData: FileData[] = await readFileData();
    res.status(200).json(fileData);
  } catch (err) {
    console.error('ERROR Listing Files', err);
    res.status(500).json({ error: `Error listing files: ${err}` });
  }
};

//-----------------------------------------------------------------------------

// TODO: Use preserve extension utility to preserve extension of the file
export const renameFile = async (req: RenameRequest, res: Response, next: express.NextFunction) => {
  const { newName, fileId } = req.body;

  if (!fileId || !newName) {
    return res.status(400).json({ error: 'File ID & New Name are required fields' });
  }

  try {
    // Loading files.json metadata
    let fileData: FileData[] = await readFileData();

    const fileToRename = fileData.find((file: FileData) => file.id === fileId);
    if (!fileToRename) {
      return res.status(404).json({ error: 'File Not Found or Incorrect File Id' });
    }

    // Renaming in FS Metadata
    // Assuming that the actual filename does not need to renamed on the filesystem
    fileToRename.name = newName;

    await writeFileData(fileData);
    res.status(200).json(fileToRename);
  } catch (err) {
    console.error('ERROR Renaming File', err);
    res.status(500).json({ error: `Server error while renaming file: ${err}` });
  }
};

//-----------------------------------------------------------------------------

export const downloadFile = async (req: DownloadRequest, res: Response, next: express.NextFunction) => {
  const { fileId } = req.params;

  if (!fileId) {
    return res.status(400).json({ error: 'File Id missing in the request' });
  }

  try {
    const files: FileData[] = await readFileData();
    // Check if a similar file name exists in JSON
    const file = files.find(file => file.id === fileId);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const { path: filePath, name: fileName } = file;

    // Checks if file exists on disk or not (async)
    try {
      await checkFileExists(filePath);
    } catch (err) {
      console.error(`File not found: ${err}`);
      return res.status(404).json({ error: 'File not found' });
    }

    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    const readStream = fs.createReadStream(filePath);

    //////////////////// Cleanup Code ///////////////////

    // if readstream encounters an error
    readStream.on('error', readErr => {
      console.error(`Error reading file: ${readErr}`);
      fileCleanup(readStream);
      // client will get error response from standard catch block. Customized handling can be done here
    });

    res.on('error', resErr => {
      console.error(`Error while writing to client: ${resErr}`);
      fileCleanup(readStream);
    });

    req.on('error', reqErr => {
      console.error(`Request error by client, possibly due to network issues: ${reqErr}`);
      fileCleanup(readStream);
    });

    // client abort connection, browser, stop download
    req.on('abort', reqErr => {
      console.error(`Request aborted by client: ${reqErr}`);
      fileCleanup(readStream);
    });

    /////////////////////////////////////////////////////

    readStream.pipe(res);
  } catch (err) {
    console.error('ERROR Downloading File', err);
    // TODO: Check if a response header hasnt been sent already
    return res.status(500).json({ error: `Error while downloading file: ${err}` });
  }
};

//-----------------------------------------------------------------------------

// TODO: Change this route later to be able to restore files
// method will become a PUT request and metadata JSON will have an isDeleted flag
// (list route will not show files with isDeleted=true)
export const deleteFile = async (req: DeleteRequest, res: Response, next: express.NextFunction) => {
  const { fileId } = req.params;

  if (!fileId) {
    return res.status(400).json({ error: 'File Id missing in the request' });
  }

  try {
    const files: FileData[] = await readFileData();
    // Check if a similar file name exists in JSON
    const fileIndex = files.findIndex(file => file.id === fileId);

    if (fileIndex === -1) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = files[fileIndex].path;

    // Checks if file exists on disk or not (async)
    try {
      await checkFileExists(filePath);
    } catch (err) {
      console.error(`File not found: ${err}`);
      return res.status(404).json({ error: 'File not found' });
    }

    fs.unlink(filePath, async err => {
      if (err) {
        console.error('ERROR Deleting File', err);
        return res.status(500).json({ error: `Error while deleting file: ${err}` });
      }

      // Updating metadata json file
      files.splice(fileIndex, 1);
      await writeFileData(files);

      res.status(200).json({
        message: 'File deleted successfully',
      });
    });
  } catch (err) {
    console.error('ERROR Deleting ', err);
    res.status(500).json({ error: `Error while deleting file: ${err}` });
  }
};

//-----------------------------------------------------------------------------
export const transformFile = async (req: TransformRequest, res: Response, next: express.NextFunction) => {
  const { fileId } = req.params;

  if (!fileId) {
    return res.status(400).json({ error: 'File Id  in the request' });
  }

  let scale_vector: Vector3 = req.query.scale ? JSON.parse(req.query.scale) : { x: 1, y: 1, z: 1 };
  let offset_vector: Vector3 = req.query.offset ? JSON.parse(req.query.offset) : { x: 0, y: 0, z: 0 };

  try {
    const files: FileData[] = await readFileData();
    // Check if a similar file name exists in JSON
    const file = files.find(file => file.id === fileId);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = file.path;

    const worker = new Worker(`./dist/src/api/workers/transformWorker.js`, {
      workerData: {
        filePath,
        scale_vector,
        offset_vector,
      },
    });

    let isFirstMessage = true;

    worker.on('message', chunk => {
      if (isFirstMessage) {
        // telling client that this is a downloadable file only on first msg from worker
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename=transformed-${file.name}`);
        isFirstMessage = false;
      }
      res.write(chunk);
    });

    worker.on('error', err => {
      console.error('Worker error', err);
      return res.status(500).send({ error: `An error occurred while processing the request. ${err}` });
    });

    worker.on('exit', () => {
      res.end();
    });
  } catch (err) {
    console.error('ERROR Transforming File', err);
    return res.status(500).json({ error: `Error while transforming file: ${err}` });
  }
};
