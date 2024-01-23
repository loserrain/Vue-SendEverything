import { calculateChunkId } from "../../uploadService/calculateChunkId.js";

onmessage = async (e) => {
  try {
    const proms = [];
    const { file, chunkSize, startIndex, endIndex } = e.data;
    for (let i = startIndex; i < endIndex; i++) {
      proms.push(calculateChunkId(file, i, chunkSize));
    }
    const chunks = await Promise.all(proms);
    postMessage(chunks);
  } catch (error) {
    // 发送错误到主线程
    postMessage({ error: error.message });
  }
};