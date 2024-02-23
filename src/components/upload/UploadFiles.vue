<script setup>
import { ref, onMounted } from "vue";
import UploadService from "../../services/uploadFilesService";

const emits = defineEmits(["sendFileInfo", "selectUploadFile", "sendUploadStatus"]);

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

// 檔案大小的轉換
// function formatFileSize(fileSize) {
//   let sizeUnit;
//   if (fileSize / 1024 < 1000) {
//     fileSize = Math.round(fileSize / 1024);
//     sizeUnit = "KB";
//   } else if (fileSize / 1024 / 1024 < 1000) {
//     fileSize = (fileSize / 1024 / 1024).toFixed(2);
//     sizeUnit = "MB";
//   } else {
//     fileSize = (fileSize / 1024 / 1024 / 1024).toFixed(2);
//     sizeUnit = "GB";
//   }
//   return { fileSize, sizeUnit };
// }

function formatFileSize(fileSize) {
  const KB = 1024;
  const MB = KB * 1024;
  const GB = MB * 1024;

  let sizeUnit;
  let sizeValue;

  if(fileSize < KB) {
    sizeValue = fileSize;
    sizeUnit = "B";
  } else if(fileSize < MB) {
    sizeValue = (fileSize / KB).toFixed(2);
    sizeUnit = "KB";
  } else if(fileSize < GB) {
    sizeValue = (fileSize / MB).toFixed(2);
    sizeUnit = "MB";
  } else {
    sizeValue = (fileSize / GB).toFixed(2);
    sizeUnit = "GB";
  }

  return { sizeValue, sizeUnit }
}

// 當在input選擇檔案時，會做的動作，emit則是將資料傳至Upload.vue
function selectFile() {
  selectedFiles.value = file.value.files;
  outputFileName.value = file.value.files[0].name;
  selectFileName.value = shortenFileName(file.value.files[0].name, 24, 10, -14);

  for (let i = 0; i < selectedFiles.value.length; i++) {
    fileList.value.push(selectedFiles.value[i]);

    // 計算傳給Upload.vue的Name與Size
    sendEmitFileName.value.push(
      shortenFileName(selectedFiles.value[i].name, 12, 4, -8)
    );
    let formattedSize = formatFileSize(selectedFiles.value[i].size);
    sendEmitFileSize.value.push(
      `${formattedSize.sizeValue} ${formattedSize.sizeUnit}`
    );
    TotalFileSize.value += selectedFiles.value[i].size;
  }

  let formattedTotalSize = formatFileSize(TotalFileSize.value)
  sendTotalFileSize.value = `${formattedTotalSize.sizeValue} ${formattedTotalSize.sizeUnit}`
  // 計算傳給Upload.vue的檔案列表狀態(是否顯現)
  sendFileStatus.value = true;

  emits("selectUploadFile", {
    fileList: fileList.value,
    fileName: sendEmitFileName.value,
    fileSize: sendEmitFileSize.value,
    totalFileSize: sendTotalFileSize.value,
    fileStatus: sendFileStatus.value
  });
}

// ---------------------------- zip壓縮 ----------------------------
// 多檔壓縮為zip檔，並使用WebWorker另開執行緒，加速壓縮時間，並使其不占用瀏覽器的效能
const createZipFile = async () => {
  const filesData = fileList.value.map((file) => ({
    name: file.name,
    content: file,
  }));

  const worker = new Worker(new URL("../../uploadService/zipWorker.js", import.meta.url), {
    type: "module",
  });

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
    const fileNames = fileInfos.value.fileName || [];
    const fileData = fileInfos.value.fileData || [];

    shortFileName(fileNames);

    if (fileNames.length === fileData.length) {
      fileSort.value = fileNames.map((fileName, index) => ({
        fileName: fileName,
        fileSize: fileData[index],
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
const chunkSize = 5 * 1024 * 1024; // 5MB
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
      const worker = new Worker(new URL("../../uploadService/uploadWorker.js", import.meta.url), {
        type: "module",
      });

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
    uploadLoading.value = false;

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

        // 將訊息加入FormData並傳入後端解析
        const formData = new FormData();
        formData.append("fileChunk", fileChunk);
        formData.append("chunkNumber", chunkNumber);
        formData.append("totalChunks", totalChunks);
        formData.append("fileId", fileId);
        formData.append("chunkId", chunkId);

        // 檔案列表為複數時，修改壓縮檔的檔名
        if (fileList.value.length >= 2) {
          outputFileName.value = fileId;
        }
        // formData.append("outputFileName", outputFileName.value)

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
                console.log("File upload completed", response.data);
                // emits('sendFileInfo', response.data);
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
    fileNames = shortenFileName(currentFile.value.name, 24, 10, -14);
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
  console.log(fileInfo);

  workerResult.value = []; // 清空workerResult

  // 清空選擇的檔案
  selectedFiles.value = undefined;
  file.value.value = null;

  uploadLoading.value = true; // 加載進度條完成

  // 傳送檔案上傳狀態到upload
  sendFileStatus.value = false;
  emits("sendUploadStatus", sendFileStatus.value)

  // 使用遞迴上傳下一份分割的資料
  if (fileList.value.length >= 2) {
    await createZipFile();
    uploadChunkThreads(zipFileBlob.value);
  } else {
    uploadChunkThreads(currentFile.value);
  }
}

// ----------------------------------------測試區-------------------------------------------
</script>

<template>
  <div class="upload-file-container">
    <!-- upload的檔案傳送列表 -->
    <div class="upload-send">
      <label for="fileInput" class="upload-fileinput">
        <font-awesome-icon icon="cloud-arrow-up" class="upload-font" />
        <input
          type="file"
          id="fileInput"
          multiple
          ref="file"
          @change="selectFile"
        />
      </label>
      <div v-if="selectedFiles">{{ selectFileName }}</div>
      <div v-else class="upload-send-file-noselect">Please select a file.</div>
      <p>
        <button
          @click="uploadChunks"
          :disabled="!selectedFiles || uploadLoading"
        >
          <span v-if="!uploadLoading">Click to Upload</span>
          <div v-else class="loader"></div>
        </button>
      </p>

      <p class="upload-send-maxfile">(Max. File size: 25 MB)</p>
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
    <p class="uploat-history-line"></p>
    <p class="upload-history-title">Historical record</p>
    <div class="upload-history">
      <div class="upload-file" v-for="(files, index) in fileSort" :key="index">
        <div class="upload-set">
          <div>
            <font-awesome-icon icon="file-lines" />
          </div>
          <div>
            <span>{{ files.fileName }}</span>
            <p>{{ files.fileSize }}</p>
          </div>
          <div>
            <font-awesome-icon icon="circle-check" class="upload-check" />
          </div>
        </div>
        <div class="upload-progress-set">
          <div class="upload-progress upload-progress-status"></div>

          <div>100%</div>
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

.uploat-history-line {
  border: 1.5px solid $primary-text-gray-100;
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

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>