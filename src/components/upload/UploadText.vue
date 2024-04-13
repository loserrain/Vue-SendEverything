<script setup>
import { ref, watchEffect, onMounted } from "vue";
import API_URL from "../../services/API_URL";
import UploadService from "../../services/uploadFilesService"

const code = ref("");
const isComplete = ref(false);
const downloadLink = ref(null);
const uploadStatus = ref(false);
const progressStatus = ref(true);
const progress = ref(0);

onMounted(() => {
  watchEffect(() => {
    isComplete.value = code.value.length === 6;
  });
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log("SW registered: ", registration);
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });
    });
  }
});

const totalSize = ref(0);
const reader = ref(null);
const chunks = ref([]);
const loadedSize = ref(0);
const filename = ref("example.txt");

async function getDataStreamFromServiceWorker() {
  const sw = await registerServiceWorker();
  const { port1, port2 } = new MessageChannel();
  sw.postMessage({ sendWorkerCode: code.value }, [port2]);
  return new Promise((resolve) => {
    port1.onmessage = (event) => {
      progress.value = event.data.progress;
      resolve({ stream: event.data.stream, filename: event.data.filename });
    };
  });
}

async function downloadFile() {
  if(window.showSaveFilePicker) {
    await dowlonadFileWithFileAPI();
  } else {
    await downloadFileWithNoFileAPI();
  }

}

async function downloadFileWithNoFileAPI() {
  const url = API_URL + "/downloadFileByCode/" + code.value;
  // const url = `http://localhost:8080/api/auth/downloadFileByCode/${code.value}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
      code.value = "";
      progressStatus.value = false;

    totalSize.value = parseInt(response.headers.get("Content-Length") || "0", 10);
    const contentDisposition = response.headers.get("Content-Disposition");
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename\*?=['"]?(?:UTF-8'')?([^'";]+)['"]?/i
        );
        if (filenameMatch && filenameMatch[1]) {
          filename.value = decodeURIComponent(filenameMatch[1]);
        }
      }
    const reader = response.body.getReader();

    // Create a stream and write to it in chunks as they arrive
    const stream = new ReadableStream({
      async start(controller) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            progressStatus.value = true;
            uploadStatus.value = false;
            break;
          }
          loadedSize.value += value.length;
          progress.value = ((loadedSize.value / totalSize.value) * 100).toFixed(0);
          controller.enqueue(value);
        }
        controller.close();
      }
    });

    const blob = await new Response(stream).blob();
    const downloadUrl = URL.createObjectURL(blob);

    // Set up the download link and click it to start the download
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = filename.value;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);

    // Reset after download
    code.value = "";
    loadedSize.value = 0;
    progress.value = 0;
  } catch (error) {
    console.error("下载过程中发生错误:", error);
  }
}
const downloadWithFileAPIName = ref("example.txt");
async function dowlonadFileWithFileAPI() {
  await UploadService.getFileNameByCode(code.value)
  .then((response) => {
    downloadWithFileAPIName.value = response.data.fileName;
  }).catch((error) => {
    console.log(error);
  });
  
  const fileHandle = await window.showSaveFilePicker({
    suggestedName: downloadWithFileAPIName.value,
  });
  
  // 创建写入流
  const writableStream = await fileHandle.createWritable();
  
  const { stream } = await getDataStreamFromServiceWorker();

  if (stream) {
    progressStatus.value = false;
    uploadStatus.value = true;
    code.value = "";
    await stream.pipeTo(writableStream);
    progressStatus.value = true;
    uploadStatus.value = false;
  }
}

async function registerServiceWorker() {
  if (navigator.serviceWorker.controller) {
    return navigator.serviceWorker.controller;
  }

  const registration = await navigator.serviceWorker.register(
    "/service-worker.js",
    {
      scope: "./",
    }
  );
  return new Promise((resolve, reject) => {
    if (registration.installing) {
      registration.installing.onstatechange = function () {
        if (this.state === "activated") {
          resolve(this);
        }
      };
    } else if (registration.active) {
      resolve(registration.active);
    } else {
      reject("Service worker registration failed");
    }
  });
}
</script>

<template>
  <div class="upload-receive-container">
    <div class="upload-code-box">
      <input type="text" v-model="code" />
    </div>
    <button
      class="submit-btn"
      :class="{ active: isComplete, 'wide-btn': !progressStatus }"
      :disabled="!isComplete"
      @click="downloadFile"
    >
      <div v-if="progressStatus">
        <div class="loader" v-if="uploadStatus"></div>
        <span v-else> Download </span>
      </div>
      <div class="upload-progress-set" v-else>
        <div class="upload-progress">
          <div
            class="upload-progress-bar upload-progress-bar-striped"
            :aria-valuenow="progress"
            aria-valuemin="0"
            aria-valuemax="100"
            :style="{ width: progress + '%' }"
          ></div>
        </div>
        <div class="upload-progress-percent">{{ progress }}%</div>
      </div>
    </button>

    <a ref="downloadLink"></a>
  </div>
</template>

<style lang="scss" scoped>
@import "../../assets/styles/layout/upload";

.upload-receive-container {
  margin: 1.8vh 15px 0;
  background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='10' ry='10' stroke='%23BABABAFF' stroke-width='3' stroke-dasharray='10%2c10' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e");
  background-color: #fafafa;
  border-radius: 10px;
  height: 40%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;

  .submit-btn {
    height: 40px;
    width: 130px;
    color: #fff;
    background-color: #28a745;
    border-radius: 7px;
    border: none;
    // box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.135);
    font-size: 18px;
    transition: 0.2s;
    position: relative;
    cursor: pointer;

    &.wide-btn {
      width: 300px;
    }

    &:hover {
      opacity: 0.8;
    }

    &:disabled {
      background-color: #d3d3d3;

      // &:hover {
      //   padding: 8px 12px 7px;
      // }
    }
  }
}

.upload-send {
  height: 30px;
  margin: 10px 0 0 0;
}

.upload-code-box {
  margin-top: 10px;

  input {
    background-color: #dbdbdb44;
    border: 2px solid $primary-text-gray-100;
    border-radius: 5px;
    // margin: 3vh 0 2vh;
    padding: 10px 10px;
    font-size: 20px;
    width: 80%;

    &:focus-visible {
      background-color: #ffffff;
      outline: none;
      border: solid 2px $primary-button-blue-100;
      box-shadow: 0px 1px 8px rgba(0, 0, 0, 0.28);
      transition: 0.1s;
    }
  }
}

a {
  display: none;
}

.loader {
  margin-top: 3px;
  border: 3px solid #f3f3f3;
  border-radius: 50%;
  border-top: 3px solid #464346;
  width: 20px;
  height: 20px;
  display: inline-block;
  text-align: center;
  // margin-left: 43%;
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.upload-progress-set {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0px;
  padding: 0 0 0 10px;
  color: #1e3050;

  .upload-progress-percent {
    font-size: 16px;
    font-weight: 700;
    color: #1e3050;
    width: 22%;
  }

  .upload-progress {
    display: flex;
    height: 0.8rem;
    overflow: hidden;
    background-color: rgb(150, 188, 225);
    border-radius: 0.25rem;
    width: 78%;

    .upload-progress-bar-striped {
      background-image: linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.15) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.15) 50%,
        rgba(255, 255, 255, 0.15) 75%,
        transparent 75%,
        transparent
      );
      background-size: 1rem 1rem;
    }

    .upload-progress-bar {
      display: flex;
      align-items: center;
      color: #a85151;
      text-align: center;
      white-space: nowrap;
      background-color: $primary-text-purple-200;
      transition: width ease;
    }
  }
}
</style>
