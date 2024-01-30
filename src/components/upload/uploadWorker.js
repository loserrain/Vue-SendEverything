import { calculateChunkId } from "../../uploadService/calculateChunkId.js";

onmessage = async (e) => {
  try {
    const proms = [];
    const { file, chunkSize, startIndex, endIndex, fileListLength, zipFileName } = e.data;
    for (let i = startIndex; i < endIndex; i++) {
      proms.push(calculateChunkId(file, i, chunkSize, fileListLength, zipFileName));
    }
    const chunks = await Promise.all(proms);
    postMessage(chunks);
  } catch (error) {
    postMessage({ error: error.message });
  }
};