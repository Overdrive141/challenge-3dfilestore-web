import { access, readFile, writeFile } from 'fs/promises';
import fs from 'fs';
import path from 'path';
import { uploadDir } from '../../config/vars';
import { FileData } from './types';
import { Worker } from 'worker_threads';

type FileCounts = {
  [key: string]: number;
};

//------------------------- File Utilities  -------------------------------------------

export const constructFileNameOnUpload = (files: FileData[], newFileName: string): string => {
  const fileCounts: FileCounts = Array.from(files.values()).reduce((counts: FileCounts, file: FileData) => {
    const name = file.original_name;
    counts[name] = (counts[name] || 0) + 1;
    return counts;
  }, {});

  if (!fileCounts[newFileName]) {
    return newFileName;
  }

  // append file name count before extension
  const fileNameSplit = newFileName.split('.');
  if (fileNameSplit.length < 2) {
    // File name does not have an extension
    return `${newFileName}(${fileCounts[newFileName] + 1})`;
  }
  const newFileBaseName: string = fileNameSplit.slice(0, -1).join('.'); // Text before ext. Name may contain dots before exts.
  const newFileExtension: string = fileNameSplit.slice(-1).join(''); // file extension (.obj)

  return `${newFileBaseName}(${fileCounts[newFileName] + 1}).${newFileExtension}`;
};

//-------------function to read file metadata----------------
export const readFileData = async (): Promise<FileData[]> => {
  const rawData: string = await readFile(path.join(uploadDir, 'files.json'), 'utf8');
  const fileData: FileData[] = JSON.parse(rawData);
  return fileData;
};

//------------function to write file metadata-----------------
export const writeFileData = async (fileData: FileData[]): Promise<void> => {
  await writeFile(path.join(uploadDir, 'files.json'), JSON.stringify(fileData, null, 2), 'utf-8');
};

//--------------memory cleanup---------------------------------
export const fileCleanup = (readStream: fs.ReadStream): void => {
  // Cleaning up readStream & all listeners if still reading/readable
  if (!readStream.destroyed) {
    readStream.removeAllListeners();
    readStream.destroy();
  }
};

//-------------does file exists on disk-------------------------
//
export const checkFileExists = async (filePath: string): Promise<void> => {
  try {
    // TODO: Check for read access
    await access(filePath, fs.constants.F_OK);
  } catch (err) {
    throw new Error('File not found');
  }
};

//------------------------- Worker Utilities ---------------------------------------------

export const workerCleanup = (worker?: Worker) => {
  if (worker) {
    worker.removeAllListeners();
    worker.terminate();
  }
};

//-----------------------------------------------------------------------------

export const parseJSONOrDefault = (jsonString: string | undefined, defaultValue: any) => {
  try {
    return jsonString ? JSON.parse(jsonString) : defaultValue;
  } catch (error) {
    throw new Error(`Unable to parse JSON: ${error}`);
  }
};

export const preserveExtension = (fileName: string): void => {
  // TODO: Handle extension preservation on rename
};
