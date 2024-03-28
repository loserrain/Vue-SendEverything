import { boardCalculateChunkId } from "./boardCalculateChunkId.js";

onmessage = async (e) => {
  try {
    const proms = [];
    const { file, chunkSize, startIndex, endIndex } = e.data;
    for (let i = startIndex; i < endIndex; i++) {
      proms.push(boardCalculateChunkId(file, i, chunkSize));
    }
    const chunks = await Promise.all(proms);
    postMessage(chunks);
  } catch (error) {
    postMessage({ error: error.message });
  }
};