import path from 'path';

export const uploadDir: string = path.resolve(process.cwd(), 'uploads');
export const metadataFile: string = path.join(uploadDir, 'files.json');
