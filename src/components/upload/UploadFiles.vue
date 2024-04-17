<script setup>
import { ref, onMounted } from "vue";
import UploadService from "../../services/uploadFilesService";

const emits = defineEmits([
  "sendFileInfo",
  "selectUploadFile",
  "sendUploadStatus",
]);

// emit 傳送檔案資訊至Upload.vue元件
const sendEmitFileName = ref([]);
const sendEmitFileSize = ref([]);
const TotalFileSize = ref(0);
const sendTotalFileSize = ref(0);
const sendFileStatus = ref(false);
// emit 傳送檔案資訊至Upload.vue元件

// 取得檔案blob與資訊
const selectedFiles = ref(undefined);
const file = ref(null);
const selectFileName = ref("");
const outputFileName = ref("");

// 檔案上傳目錄
const fileList = ref([]);

// 壓縮檔案使用
const zipFileBlob = ref(undefined);
const zipFileName = ref("SendEverything");

// 狀態管理
const uploadStatus = ref(false);
const userConfirmKK = ref(false);

function userConfirm() {
  setTimeout(() => {
    userConfirmKK.value = !userConfirmKK.value;
    fileReceive.value = [];
    currentFile.value = undefined;
    emits("sendFileInfo", false);
    uploadGetFiles();
  }, 200);
}

function formatFileSize(fileSize) {
  const KB = 1024;
  const MB = KB * 1024;
  const GB = MB * 1024;

  let sizeUnit;
  let sizeValue;

  if (fileSize < KB) {
    sizeValue = fileSize;
    sizeUnit = "B";
  } else if (fileSize < MB) {
    sizeValue = (fileSize / KB).toFixed(2);
    sizeUnit = "KB";
  } else if (fileSize < GB) {
    sizeValue = (fileSize / MB).toFixed(2);
    sizeUnit = "MB";
  } else {
    sizeValue = (fileSize / GB).toFixed(2);
    sizeUnit = "GB";
  }

  return { sizeValue, sizeUnit };
}

// 儲存拖曳上傳的檔案
const files = ref(null);
const dropActive = ref(false);

function handleDragActive() {
  dropActive.value = true;
}

function handleDragNoActive(event) {
  console.log("event", event);
  if (
    !event.relatedTarget ||
    !event.currentTarget.contains(event.relatedTarget)
  ) {
    dropActive.value = false;
  }
}

function handleFileDrop(event) {
  event.preventDefault();

  files.value = event.dataTransfer.files;
  selectedFiles.value = files.value;
  outputFileName.value = files.value[0].name;
  selectFileName.value = shortenFileName(files.value[0].name, 24, 10, -14);

  handleFileSelectAndDrop(files.value);
  dropActive.value = false;
}

// 當在input選擇檔案時，會做的動作，emit則是將資料傳至Upload.vue
function selectFile() {
  selectedFiles.value = file.value.files;
  outputFileName.value = file.value.files[0].name;
  selectFileName.value = shortenFileName(file.value.files[0].name, 24, 10, -14);

  handleFileSelectAndDrop(file.value.files);
}

function handleFileSelectAndDrop(file) {
  uploadStatus.value = true;
  for (let i = 0; i < file.length; i++) {
    fileList.value.push(file[i]);

    // 計算傳給Upload.vue的Name與Size
    sendEmitFileName.value.push(shortenFileName(file[i].name, 12, 4, -8));
    let formattedSize = formatFileSize(file[i].size);
    sendEmitFileSize.value.push(
      `${formattedSize.sizeValue} ${formattedSize.sizeUnit}`
    );
    TotalFileSize.value += file[i].size;
  }

  let formattedTotalSize = formatFileSize(TotalFileSize.value);
  sendTotalFileSize.value = `${formattedTotalSize.sizeValue} ${formattedTotalSize.sizeUnit}`;
  // 計算傳給Upload.vue的檔案列表狀態(是否顯現)
  sendFileStatus.value = true;

  emits("selectUploadFile", {
    fileList: fileList.value,
    fileName: sendEmitFileName.value,
    fileSize: sendEmitFileSize.value,
    totalFileSize: sendTotalFileSize.value,
    fileStatus: sendFileStatus.value,
  });
}

// ---------------------------- zip壓縮 ----------------------------
// 多檔壓縮為zip檔，並使用WebWorker另開執行緒，加速壓縮時間，並使其不占用瀏覽器的效能
const createZipFile = async () => {
  const filesData = fileList.value.map((file) => ({
    name: file.name,
    content: file,
  }));
  // console.log("filesData", filesData);

  const worker = new Worker(
    new URL("../../uploadService/zipWorker.js", import.meta.url),
    {
      type: "module",
    }
  );

  const zipWorker = new Promise((resolve) => {
    // 將訊息傳送給執行worker的JS檔案
    worker.postMessage({
      filesData,
      zipFileName: zipFileName.value,
    });

    // 接收來自worker的JS檔案傳遞過來的參數
    worker.onmessage = (event) => {
      zipFileBlob.value = event.data;
      // 停止worker的運行，並結束Promise
      worker.terminate();
      resolve();
    };

    worker.onerror = (error) => {
      console.error("Worker error: ", error);
      resolve(); // 發生錯誤也算是完成
    };
  });

  await zipWorker;
};

// ---------------------------- zip壓縮 ----------------------------

// ---------------------------- 上傳檔案區 ----------------------------
// 縮減選擇檔案時的檔名(以免檔名過長跑版)
function shortenFileName(fileName, maxLength, front, end) {
  if (fileName.length > maxLength) {
    return `${fileName.slice(0, front)} ... ${fileName.slice(end)}`;
  }
  return fileName;
}

// 歷史檔案區:檔案上傳後，檔名縮減
function shortFileName(fileNames) {
  fileNames.forEach((fileName, index) => {
    if (fileName.length > 24) {
      fileNames[index] = `${fileName.slice(0, 10)} --- ${fileName.slice(-14)}`;
    }
  });
}

const fileSort = ref([]);
// 上傳檔案後取得資料
function uploadGetFiles() {
  UploadService.getFiles().then((response) => {
    fileInfos.value = response.data;
    const fileNames = fileInfos.value.map(
      (fileInfo) => fileInfo.fileName || []
    );
    const fileSizes = fileInfos.value.map(
      (fileInfo) => fileInfo.fileSize || []
    );

    let formattedSizes = fileSizes.map((size) => {
      const formattedSize = formatFileSize(size);
      return `${formattedSize.sizeValue} ${formattedSize.sizeUnit}`;
    });
    shortFileName(fileNames);

    if (fileNames.length === fileSizes.length) {
      fileSort.value = fileNames.map((fileName, index) => ({
        fileName: fileName,
        fileSize: formattedSizes[index],
      }));
    }
  });
}

// 當載入文件時，呼叫此函數，並從後端取得已上傳的歷史紀錄檔案
onMounted(() => {
  uploadGetFiles();
});
// ---------------------------- 上傳檔案區 ----------------------------

// --------------------------------------------------------
const currentFile = ref(undefined);
const progress = ref(0);
const fileInfos = ref([]);
const fileReceive = ref([]);

// 增加檔案分割的資料
const chunkSize = 10 * 1024 * 1024; // 5MB
const totalChunks = ref(0);
const currentChunkIndex = ref(0);
const totalThreads = navigator.hardwareConcurrency || 2;
const workerResult = ref([]);
const uploadLoading = ref(false);

// 多執行緒將檔案分片後上傳至陣列，使其按照順序將檔案上傳至後端進行管理
async function uploadChunkThreads(file) {
  try {
    const chunkCount = Math.ceil(file.size / chunkSize); // 檔案總分片次數
    const workerChunkCount = Math.ceil(chunkCount / totalThreads); // 每個worker分配到的分片數量
    const workerPromises = []; // 用來存放每個 worker 的 Promise

    for (let i = 0; i < totalThreads; i++) {
      // import.meta.url指向當前執行module的JavaScript文件的位置
      const worker = new Worker(
        new URL("../../uploadService/uploadWorker.js", import.meta.url),
        {
          type: "module",
        }
      );

      const startIndex = i * workerChunkCount;
      let endIndex = startIndex + workerChunkCount;
      if (endIndex >= chunkCount) {
        endIndex = chunkCount;
      }
      // 使用 Promise 包裹 worker 的執行
      const workerPromise = new Promise((resolve) => {
        worker.postMessage({
          file,
          chunkSize,
          startIndex,
          endIndex,
          fileListLength: fileList.value.length,
          zipFileName: zipFileName.value,
        });

        worker.onmessage = (e) => {
          for (let i = startIndex; i < endIndex; i++) {
            workerResult.value[i] = e.data[i - startIndex];
          }
          worker.terminate();
          resolve(); // 告訴外部這個 worker 完成了
        };

        worker.onerror = (error) => {
          console.error("Worker error: ", error);
          resolve(); // 發生錯誤也算是完成
        };
      });

      workerPromises.push(workerPromise);
    }

    // 等待所有 worker 完成
    await Promise.all(workerPromises);

    // 加載中
    // uploadLoading.value = false;
    const formDataList = [];

    // 這裡使用 setTimeout 實現每100毫秒發送一次請求
    let i = 0;
    const interval = setInterval(() => {
      if (i < workerResult.value.length) {
        // 檔案分片
        const fileChunk = workerResult.value[i].fileChunk;
        // 分片的編號與順序
        const chunkNumber = workerResult.value[i].chunkNumber + 1;
        // 檔案總分片大小
        const totalChunks = workerResult.value[i].totalChunks;
        // 檔名
        const fileId = workerResult.value[i].fileId;
        // 每個分片的hash code
        const chunkId = workerResult.value[i].chunkId;
        // 檔案大小
        const size = file.size;

        // 將訊息加入FormData並傳入後端解析
        const formData = new FormData();
        formData.append("fileChunk", fileChunk);
        formData.append("chunkNumber", chunkNumber);
        formData.append("totalChunks", totalChunks);
        formData.append("fileId", fileId);
        formData.append("chunkId", chunkId);
        formData.append("size", size);
        formDataList.push({
          fileChunk: fileChunk,
          chunkNumber: chunkNumber,
          totalChunks: totalChunks,
          fileId: fileId,
          chunkId: chunkId,
          size: size,
        });
        // 檔案列表為複數時，修改壓縮檔的檔名
        if (fileList.value.length >= 2) {
          outputFileName.value = fileId;
        }
        formData.append("outputFileName", outputFileName.value);

        // 調用上傳函數
        UploadService.uploadChunk(formData).then(() => {
          // 計算當前分片數量
          currentChunkIndex.value++;

          // 利用上傳分片數與總分片數計算進度條
          progress.value = Math.ceil(
            (100 * currentChunkIndex.value) / totalChunks
          );

          // 若分片數量與總分片數量相同，通知後端合併
          if (currentChunkIndex.value === totalChunks) {
            UploadService.completeFileUpload(
              fileId,
              outputFileName.value,
              chunkId
            )
              .then((response) => {
                console.log(response.data)
                let sendFileInfo = {
                  downloadCode: response.data.downloadCode,
                  qrcodeImg: response.data.qrcodeImg,
                }
                uploadStatus.value = false; // 上傳完成
                userConfirmKK.value = true; // 確認按鈕
                uploadLoading.value = false; // 加載中
                emits("sendFileInfo", sendFileInfo);
              })
              .catch((error) => {
                console.error("Error completing file upload", error);
              });
          }
        });

        i++;
      } else {
        clearInterval(interval); // 當所有結果都處理完後停止定時器
        fileList.value = []; // 清除檔案列表
        // 清除傳遞給upload.vue父組件的檔名、檔案大小與總檔案大小
        TotalFileSize.value = 0;
        sendEmitFileName.value = [];
        sendEmitFileSize.value = [];
      }
    }, 100);
  } catch {
    console.error("Error in uploadChunkThreads: ", error);
  }
}

// 分割並上傳文件
async function uploadChunks() {
  if (!selectedFiles.value || selectedFiles.value.length === 0) return;

  // 取得當前選擇檔案
  currentFile.value = selectedFiles.value[0];
  totalChunks.value = Math.ceil(currentFile.value.size / chunkSize);
  currentChunkIndex.value = 0;

  // 上傳檔案歸零
  fileReceive.value = [];

  // 進度條設定初始值
  progress.value = 0;

  // 檔名長度超過24，進行擷取
  zipFileName.value = "SendEverything";
  zipFileName.value += "_" + Date.now() + ".zip";
  let fileNames = "";
  let fileSize = 0;
  if (fileList.value.length >= 2) {
    fileNames = zipFileName.value;
    fileList.value.forEach((file) => {
      fileSize += parseInt(file.size);
    });
  } else {
    fileNames = shortenFileName(currentFile.value.name, 18, 10, -8);
    fileSize = currentFile.value.size;
  }

  // 決定檔案大小的單位
  const formattedSize = formatFileSize(fileSize);

  // 上傳檔案區
  const fileInfo = {
    fileName: fileNames,
    fileSize: `${formattedSize.sizeValue} ${formattedSize.sizeUnit}`,
  };

  fileReceive.value.push(fileInfo);
  // console.log(fileInfo);

  workerResult.value = []; // 清空workerResult

  // 清空選擇的檔案
  selectedFiles.value = undefined;
  file.value.value = null;

  uploadLoading.value = true; // 加載進度條完成

  // 傳送檔案上傳狀態到upload
  sendFileStatus.value = false;
  emits("sendUploadStatus", sendFileStatus.value);
  // 使用遞迴上傳下一份分割的資料
  if (fileList.value.length >= 2) {
    await createZipFile();
    uploadChunkThreads(zipFileBlob.value);
    // console.log("zipFileBlob", zipFileBlob.value)
  } else {
    uploadChunkThreads(currentFile.value);
    // console.log("currentFile", currentFile.value)
  }
}

// ----------------------------------------測試區-------------------------------------------
</script>

<template>
  <div class="upload-file-container">
    <!-- upload的檔案傳送列表 -->
    <div
      class="upload-send"
      :class="dropActive ? 'drop-active' : ''"
      @drop="handleFileDrop"
      @dragover.prevent="handleDragActive"
      @dragenter.prevent="handleDragActive"
      @dragleave="handleDragNoActive"
      @dragend="handleDragNoActive"
    >
      <label for="fileInput" class="upload-fileinput">
        <font-awesome-icon icon="plus" class="upload-font" />
        <input
          type="file"
          id="fileInput"
          multiple
          ref="file"
          @change="selectFile"
          :disabled="userConfirmKK"
        />
      </label>
      <div v-if="selectedFiles" class="upload-send-fileName">{{ selectFileName }}</div>
      <div v-else class="upload-send-file-noselect">Please select a file.</div>
      <p class="upload-send-maxfile">(Max. File size: 5 GB)</p>
      <p v-if="uploadStatus">
        <button @click="uploadChunks" :disabled="uploadLoading">
          <span v-if="!uploadLoading">Click to Upload</span>
          <div v-else class="loader"></div>
        </button>
      </p>
      <p v-else>
        <button v-if="userConfirmKK" @click="userConfirm()">
          <span>OK</span>
        </button>
      </p>
    </div>
    <!-- upload的檔案傳送列表 -->

    <!-- 上傳時的檔案區 -->
    <div class="upload-sort" v-if="currentFile">
      <div
        class="upload-file"
        v-for="(file, index) in fileReceive"
        :key="index"
      >
        <div class="upload-set">
          <div>
            <font-awesome-icon icon="file-lines" />
          </div>
          <div>
            <span>{{ file.fileName }}</span>
            <p>{{ file.fileSize }}</p>
          </div>
          <div class="upload-delete">
            <font-awesome-icon icon="trash-can" />
          </div>
        </div>
        <div class="upload-progress-set">
          <div class="upload-progress">
            <div
              class="upload-progress-bar upload-progress-bar-striped"
              :aria-valuenow="progress"
              aria-valuemin="0"
              aria-valuemax="100"
              :style="{ width: progress + '%' }"
            ></div>
          </div>
          <div>{{ progress }}%</div>
        </div>
      </div>
    </div>
    <!-- 上傳時的檔案區 -->

    <!-- 歷史紀錄區(登入後) -->
    <!-- <p class="upload-history-line"></p> -->
    <!-- <p class="upload-history-title">Historical record</p> -->
    <div class="upload-history">
      <div class="upload-file" v-for="(files, index) in fileSort" :key="index">
        <div class="upload-set">
          <div class="upload-set-icon">
            <font-awesome-icon icon="clock-rotate-left" />
          </div>
          <div>
            <span>{{ files.fileName }}</span>
            <p>{{ files.fileSize }}</p>
          </div>
          <div>
            <font-awesome-icon icon="circle-check" class="upload-check" />
          </div>
        </div>
        <div class="upload-history-time">
          <p class="">2024-04-18</p>
          <div>
            <font-awesome-icon icon="stopwatch" />
            <span>
              2d 4h
            </span>
          </div>
        </div>
      </div>
    </div>
    <!-- 歷史紀錄區(登入後) -->
  </div>
</template>

<style lang="scss" scoped>
@import "../../assets/styles/layout/upload";

// 將上傳時的檔案順序相反，使最新上傳檔案在最上面
.upload-sort {
  display: flex;
  flex-direction: column-reverse;
  gap: 20px;
}

.upload-history {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
}

.upload-history-title {
  text-align: center;
  margin-bottom: 10px;
  margin-top: 15px;
  font-size: 32px;
  font-weight: 700;
  color: aliceblue;
  background-color: #7492ea;
  padding: 10px;
  border-radius: 10px 0px;
}

.upload-history-line {
  border: 1.5px solid $primary-text-gray-100;
}

.upload-history-time {
  display: flex;
  justify-content: space-between;
  margin-top: 1.7rem;
  p {
    font-size: 16px;
    font-weight: bold;
    color: #5B5959;
  }

  div {
    font-size: 18px;
    color: #7D7A7A;

    span {
      font-size: 16px;
      font-weight: bold;
    }
  }
}

.upload-delete {
  cursor: pointer;
}

.loader {
  margin-top: 0px;
  border: 3px solid #f3f3f3;
  border-radius: 50%;
  border-top: 3px solid #1e1d1e;
  width: 20px;
  height: 20px;
  margin-left: 43%;
  animation: spin 1.5s linear infinite;
}

.drop-active {
  background-color: #d9f7c3;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
