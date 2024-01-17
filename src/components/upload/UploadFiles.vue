<script setup>
import { ref, onMounted } from "vue";
import UploadService from "../../services/uploadFilesService";
import SparkMD5 from "spark-md5";

const emits = defineEmits(["sendFileInfo", "selectUploadFile"]);

const selectedFiles = ref(undefined);
const file = ref(null);
const selectFileName = ref("");
const outputFileName = ref("");

const previewImage = ref(null);

// 當在input選擇檔案時，會做的動作，emit則是將資料傳至Upload.vue
function selectFile() {
  selectedFiles.value = file.value.files;
  outputFileName.value = file.value.files[0].name;
  selectFileName.value = shortenFileName(file.value.files[0].name, 24);
  console.log(selectFileName.value);
  emits("selectUploadFile", file.value.files);
}

// 縮減選擇檔案時的檔名(以免檔名過長跑版)
function shortenFileName(fileName, maxLength) {
  if (fileName.length > maxLength) {
    return `${fileName.slice(0, 10)} --- ${fileName.slice(-14)}`;
  }
  return fileName;
}

const currentFile = ref(undefined);
const progress = ref([]);
let progressFileCount = 0;
const fileInfos = ref([]);
const fileSort = ref([]);

const fileReceive = ref([]);
const qrCodeImage = ref(null);

function upload() {
  progress.value[progressFileCount] = 0;

  currentFile.value = selectedFiles.value.item(0);

  // 檔名長度超過24，進行擷取
  let fileNames = shortenFileName(currentFile.value.name, 24);
  let fileSize = currentFile.value.size;

  // 決定檔案大小的單位
  let sizeUnit;
  if (fileSize / 1024 < 1000) {
    fileSize = Math.round(fileSize / 1024);
    sizeUnit = "KB";
  } else {
    fileSize = (fileSize / 1024 / 1024).toFixed(2);
    sizeUnit = "MB";
  }

  const fileInfo = {
    fileName: fileNames,
    fileSize: `${fileSize} ${sizeUnit}`,
  };

  fileReceive.value.push(fileInfo);

  UploadService.upload(currentFile.value, (event) => {
    progress.value[progressFileCount] = Math.round(
      (100 * event.loaded) / event.total
    );

    progressFileCount += 1;
    console.log(progress.value);
  })
    .then((response) => {
      console.log(response.data);
      qrCodeImage.value = `data:image/png;base64,${response.data.qrcodeImg}`;
      emits("sendFileInfo", response.data);
      return response.data;
    })
    .catch(() => {
      progress.value = 0;
      currentFile.value = undefined;
      console.log(message.value);
      fileReceive.value = [];
    });

  selectedFiles.value = undefined;
}

// 檔案上傳後，檔名縮減
function shortFileName(fileNames) {
  fileNames.forEach((fileName, index) => {
    if (fileName.length > 24) {
      fileNames[index] = `${fileName.slice(0, 10)} --- ${fileName.slice(-14)}`;
    }
  });
}

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

// ----------------------------------------測試區-------------------------------------------

// 暫停與停止上傳狀態
const isPaused = ref(false);
const isStopped = ref(false);

// function pauseUpload() {
//   isPaused.value = true;
// }

// function stopUpload() {
//   isStopped.value = true;
// }

// 增加檔案分割的資料
const chunkSize = ref(5 * 1024 * 1024); // 5MB
const totalChunks = ref(0);
const currentChunkIndex = ref(0);
const fileId = "some-unique-file-id";

// 用於儲存已上傳分片的 ID
const uploadedChunksIds = [];


// 計算分片的 ID
function calculateChunkId(chunk) {
  return new Promise((resolve, reject) => {
    const spark = new SparkMD5.ArrayBuffer();

    const fileReader = new FileReader();

    fileReader.onload = function (e) {
      spark.append(e.target.result); // Append chunk to SparkMD5
      // console.log(e.target.result);
      const chunkId = spark.end();
      // console.log("Chunk ID:", chunkId);
      resolve(chunkId);
    };

    fileReader.onerror = function (err) {
      reject(err);
    };

    fileReader.readAsArrayBuffer(chunk);
  });
}

// 計算已上傳分片的總體 ID
function calculateTotalFileId(uploadedChunksIds) {
  const spark = new SparkMD5();

  // Append all chunk IDs to SparkMD5
  uploadedChunksIds.forEach((chunkId) => {
    spark.append(chunkId);
  });

  return spark.end();
}

// 分割並上傳文件
function uploadChunks() {
  if (!selectedFiles.value || selectedFiles.value.length === 0) return;
  // if (isPaused.value || isStopped.value) return;

  const file = selectedFiles.value[0];
  totalChunks.value = Math.ceil(file.size / chunkSize.value);
  currentChunkIndex.value = 0;

  // 進度條設定初始值
  progress.value[progressFileCount] = 0;

  // 取得當前選擇檔案
  currentFile.value = selectedFiles.value.item(0);

  // 檔名長度超過24，進行擷取
  let fileNames = shortenFileName(currentFile.value.name, 24);
  let fileSize = currentFile.value.size;

  // 決定檔案大小的單位
  let sizeUnit;
  if (fileSize / 1024 < 1000) {
    fileSize = Math.round(fileSize / 1024);
    sizeUnit = "KB";
  } else {
    fileSize = (fileSize / 1024 / 1024).toFixed(2);
    sizeUnit = "MB";
  }

  // 上傳檔案區
  const fileInfo = {
    fileName: fileNames,
    fileSize: `${fileSize} ${sizeUnit}`,
  };

  fileReceive.value.push(fileInfo);

  // 使用遞迴上傳下一份分割的資料
  uploadNextChunk(file);
}

function uploadNextChunk(file) {
  const start = currentChunkIndex.value * chunkSize.value;
  const end = Math.min(start + chunkSize.value, file.size);
  const chunk = file.slice(start, end);
  progress.value[progressFileCount] = Math.ceil(
    (100 * currentChunkIndex.value) / totalChunks.value
  );

  // 計算當前分片的 ID
  calculateChunkId(chunk).then((chunkId) => {
    uploadedChunksIds.push(chunkId);

    // 計算已上傳分片的總體 ID（動態計算）
    const totalFileId = calculateTotalFileId(uploadedChunksIds);
    console.log("totalFileId", totalFileId)

    // 建立FormData並加入分割資料
    const formData = new FormData();
    formData.append("fileChunk", chunk);
    formData.append("chunkNumber", currentChunkIndex.value + 1);
    formData.append("totalChunks", totalChunks.value);
    formData.append("fileId", fileId);
    formData.append("totalFileId", totalFileId);

    // 調用上傳函數
    UploadService.uploadChunk(formData).then(() => {
      currentChunkIndex.value++;
      if (currentChunkIndex.value < totalChunks.value) {
        uploadNextChunk(file); // 上傳下一個分割資料
      } else {
        // 當所有分割資料上傳完畢，通知spring合併檔案並回傳資料(檔名、大小、QRCODE與驗證碼等等)
        UploadService.completeFileUpload(fileId, outputFileName.value)
          .then((response) => {
            console.log("File upload completed", response.data);
            progressFileCount += 1;
          })
          .catch((error) => {
            console.error("Error completing file upload", error);
          });
      }
    });
  });
}

// ----------------------------------------測試區-------------------------------------------
</script>

<template>
  <div class="upload-file-container">
    <!-- upload的檔案傳送列表 -->
    <div class="upload-send">
      <label for="fileInput" class="upload-fileinput">
        <font-awesome-icon icon="cloud-arrow-up" class="upload-font" />
        <input type="file" id="fileInput" ref="file" @change="selectFile" />
      </label>
      <div v-if="selectedFiles">{{ selectFileName }}</div>
      <div v-else class="upload-send-file-noselect">Please select a file.</div>
      <p>
        <!-- <button @click="upload" :disabled="!selectedFiles"> -->
        <button @click="uploadChunks" :disabled="!selectedFiles">
          Click to Upload
        </button>
      </p>
      <p class="upload-send-maxfile">(Max. File size: 25 MB)</p>
    </div>

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
              :aria-valuenow="progress[index]"
              aria-valuemin="0"
              aria-valuemax="100"
              :style="{ width: progress[index] + '%' }"
            ></div>
          </div>
          <div>{{ progress[index] }}%</div>
        </div>
      </div>
    </div>

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

    <div v-if="previewImage">
      <img :src="previewImage" alt="" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "../../assets/styles/layout/upload";
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

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
</style>
