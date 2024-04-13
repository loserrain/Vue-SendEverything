self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.onmessage = async (event) => {
  const code = event.data.sendWorkerCode;
  let filename = '';
  const port2 = event.ports[0];
  const response = await fetch(
    `http://localhost:8080/api/auth/downloadFileByCode/${code}`
  );

  const contentDisposition = response.headers.get("Content-Disposition");
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(
      /filename\*?=['"]?(?:UTF-8'')?([^'";]+)['"]?/i
    );
    if (filenameMatch && filenameMatch[1]) {
      filename = decodeURIComponent(filenameMatch[1]);
    }
  }

  const totalSize = parseInt(response.headers.get("Content-Length") || "0", 10);
  let loadSize = 0;
  const reader = response.body.getReader();
  const stream = new ReadableStream({
    async start(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        loadSize += value.length;
        const progress = ((loadSize / totalSize) * 100).toFixed(0);
        port2.postMessage({ progress });
        controller.enqueue(value);
      }
      controller.close();
    },
  });
  port2.postMessage({ stream, filename }, [stream]);
};

self.addEventListener("fetch", (event) => {
  const url = event.request.url;
});
