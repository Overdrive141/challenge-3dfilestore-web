import axios from 'axios';

//-----------------------------------------------------------------------------
export type ObjFile = {
  id: string;
  name: string;
  creation_date: Date;
  size: number;
};

//-----------------------------------------------------------------------------
type Vector3 = {
  x: number;
  y: number;
  z: number;
};

const API_URL = 'http://localhost:3333/v1';
const apiClient = axios.create({ baseURL: API_URL });

//-----------------------------------------------------------------------------
export async function listFiles(): Promise<ObjFile[]> {
  const res = await apiClient.request<ObjFile[]>({
    method: 'GET',
    url: '/file/list',
  });
  return res.data;
}

//-----------------------------------------------------------------------------
export async function getFile(fileId: string): Promise<ObjFile> {
  const res = await apiClient.request<ObjFile>({
    method: '<replace-me>',
    url: '/file/<replace-me>',
  });
  return res.data;
}

//-----------------------------------------------------------------------------
export async function renameFile(fileId: string, newName: string): Promise<ObjFile> {
  const res = await apiClient.request<ObjFile>({
    method: 'PUT',
    url: '/file/rename-file',
    data: { fileId, newName },
  });
  return res.data;
}

//-----------------------------------------------------------------------------
export async function deleteFile(fileId: string): Promise<void> {
  await apiClient.request<ObjFile>({
    // TODO: Change this route later on backend to be a flag to restore files
    // method will become PUT
    method: 'DELETE',
    url: `/file/delete/${fileId}`,
  });
}

//-----------------------------------------------------------------------------
export function downloadFile(fileId: string): void {
  const downloadUrl = `${API_URL}/file/download/${fileId}`;
  window.open(downloadUrl, '_blank');
}

//-----------------------------------------------------------------------------
export async function uploadFile(data: FormData): Promise<ObjFile> {
  const res = await apiClient.request<ObjFile>({
    method: 'POST',
    url: '/file/upload-file',
    data: data,
  });
  return res.data;
}

//-----------------------------------------------------------------------------
export function transformFile(fileId: string, scale: Vector3, offset: Vector3): void {
  const transformUrl = `${API_URL}/file/transform/${fileId}?scale=${JSON.stringify(scale)}&offset=${JSON.stringify(
    offset,
  )}`;
  window.open(transformUrl, '_blank');
}
