import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { uploadDir } from '../../config/vars';
import { FileData } from './types';

type FileCounts = {
  [key: string]: number;
};

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

export const preserveExtension = (fileName: string): void => {
  // TODO: Handle extension preservation on rename
};

// function to read file metadata
export const readFileData = async (): Promise<FileData[]> => {
  const rawData: string = await readFile(path.join(uploadDir, 'files.json'), 'utf8');
  const fileData: FileData[] = JSON.parse(rawData);
  return fileData;
};

// function to write file metadata
export const writeFileData = async (fileData: FileData[]): Promise<void> => {
  await writeFile(path.join(uploadDir, 'files.json'), JSON.stringify(fileData, null, 2), 'utf-8');
};
