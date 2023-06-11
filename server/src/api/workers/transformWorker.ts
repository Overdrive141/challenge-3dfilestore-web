import fs from 'fs';
import * as readline from 'readline';
import { parentPort, workerData, isMainThread } from 'worker_threads';

import { MessageFromMainThread, Vector3 } from '../utils/types';

interface WorkerData {
  filePath: string;
  scale_vector: Vector3;
  offset_vector: Vector3;
}

// TODO: Add Worker Thread Pool Management for handling multiple service workers & configure them to not exceed the number of CPUs

// TODO: Handle case where offset vector is 0,0,0 to not apply unnecessary translation
// TODO: Handle case where scale vector is 1,1,1, to not apply unnecessary transformation

if (!isMainThread) {
  const data = workerData as WorkerData;
  const { filePath, scale_vector, offset_vector } = data;

  const readStream = fs.createReadStream(filePath);

  const readInterface = readline.createInterface({
    input: readStream,
  });

  // To support concurrent requests, fill buffer before sending to main thread and returning to user.
  // 10mb mem buffer - can optimize further
  let buffer = '';
  const maxBufferSize = 10 * 1024 * 1024;

  readInterface.on('line', (line: string) => {
    if (line.startsWith('v ')) {
      // check if line is a vertex
      // apply transformation
      const vertex: number[] = line.slice(2).split(' ').filter(Boolean).map(Number);
      let newVertex: number[] = [];
      newVertex[0] = vertex[0] * scale_vector.x + offset_vector.x;
      newVertex[1] = vertex[1] * scale_vector.y + offset_vector.y;
      newVertex[2] = vertex[2] * scale_vector.z + offset_vector.z;

      buffer += `v ${newVertex.join(' ')}\n`;
    } else {
      // line is not a vertex, keep it as is
      buffer += `${line}\n`;
    }

    if (buffer.length > maxBufferSize) {
      parentPort?.postMessage(buffer);
      buffer = '';
    }
  });

  readInterface.on('close', () => {
    // Once reading is done, post any remaining buffer content to the parent thread
    if (buffer.length > 0) {
      parentPort?.postMessage(buffer);
    }

    // console.log('Worker Ended');
    parentPort?.postMessage(null); // data ended
  });

  parentPort?.on('message', (msg: MessageFromMainThread) => {
    if (msg.type === 'pause') {
      readStream.pause();
    } else if (msg.type === 'resume') {
      // Resume the read stream
      readStream.resume();
    }
  });

  /** 
  readInterface.on('pause', () => {
    console.log('Paused Event is invoked');
  });

  readInterface.on('resume', () => {
    console.log('Resume Event is invoked.');
  });
  */
}
