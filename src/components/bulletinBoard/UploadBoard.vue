<script setup>
import { ref, watch, computed, onMounted } from "vue";
import { useAuthStore } from "../../stores/auth.module";
import UploadService from "../../services/uploadFilesService";

const emits = defineEmits(["sendUploadStatus"]);
const props = defineProps(["roomCode"]);

function handleSendUploadStatus(newStatus) {
  emits("sendUploadStatus", newStatus);
}

const authStore = useAuthStore();

const currentUser = computed(() => {
  return authStore.dataStatus.user;
});

function handleCurrentUserStatus() {
  if (currentUser.value) {
    textUserId.value = currentUser.value.username;
    verifyUserId.value = true;
  }
}

const fileCount = 2;
const textInput = ref([]);
const textUserId = ref("");
const verifyUserId = ref(false);

// --------------------------------------------------------------------

const progress = ref([]);
const fileUploadStatus = ref(true);
const fileListUploadStatus = ref(false);

// 檔案
const file = ref(undefined);
const selectedFiles = ref(undefined);
const selectFileName = ref("");
const selectFileSize = ref([]);
const outputFileName = ref("");

// 檔案上傳目錄
const fileList = ref([]);

// 檔案大小格式化
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
    sizeValue = (fileSize / KB).toFixed(0);
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

  handleFileSelectAndDrop(files.value);
  dropActive.value = false;
}
// 拖曳上傳的處理

// 選擇檔案
function selectFile() {
  // 當選擇檔案時，將壓縮檔案按鈕設為false
  uploadingStatus.value = false;
  selectedFiles.value = file.value.files;
  selectFileName.value = file.value.files[0].name;
  outputFileName.value = file.value.files[0].name;
  handleFileSelectAndDrop(file.value.files);
  updateSelectedZipFileSize();
}

function initialUpload() {
  fileList.value = [];
  progress.value = [];
  selectFileSize.value = [];
  fileUploadStatus.value = false;
  fileListUploadStatus.value = false;
}

function handleFileSelectAndDrop(file) {
  // 上傳狀態判別，若為true，則清空檔案列表與進度條
  if (fileListUploadStatus.value) {
    initialUpload();
  }

  for (let i = 0; i < file.length; i++) {
    fileList.value.push(file[i]);
    let formattedSize = formatFileSize(file[i].size);
    selectFileSize.value.push(
      `${formattedSize.sizeValue}  ${formattedSize.sizeUnit}`
    );
    progress.value.push(0);
  }
  fileUploadStatus.value = false;
}

// ---------------------------- zip壓縮 ----------------------------
// 多檔壓縮為zip檔，並使用WebWorker另開執行緒，加速壓縮時間，並使其不占用瀏覽器的效能

// 壓縮檔案使用
const zipFileBlob = ref([]);
const zipFileName = ref("SendEverything");
const zipFileStatus = ref(false);
const ckZipIcon = computed(() => {
  return zipFileStatus.value ? ["far", "square-check"] : ["far", "square"];
});

function handleZipFileStatus() {
  zipFileStatus.value = !zipFileStatus.value;
}

const createZipFile = async () => {
  const filesData = fileList.value.map((file) => ({
    name: file.name,
    content: file,
  }));

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
    });

    // 接收來自worker的JS檔案傳遞過來的參數
    worker.onmessage = (event) => {
      zipFileBlob.value.push(event.data);
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

// zip檔案壓縮模式的檔案大小計算
const selectedZipFileSize = ref(0);
// 定義更新檔案大小的函數
function updateSelectedZipFileSize() {
  selectedZipFileSize.value = 0;
  for (let i = 0; i < fileList.value.length; i++) {
    selectedZipFileSize.value += parseFloat(fileList.value[i].size);
  }
  let formattedSize = formatFileSize(selectedZipFileSize.value);
  selectedZipFileSize.value = `${formattedSize.sizeValue}  ${formattedSize.sizeUnit}`;
}
// 監聽zip檔案狀態，若為true，則更新zip檔案大小，並為zip檔案命名
watch(zipFileStatus, (newValue) => {
  if (newValue) {
    zipFileName.value = "SendEverything";
    zipFileName.value += "_" + Date.now() + ".zip";
    updateSelectedZipFileSize();
  } else {
    zipFileName.value = "SendEverything";
  }
});
// ---------------------------- zip壓縮 ----------------------------

// 增加檔案分割的資料
const chunkSize = 5 * 1024 * 1024; // 檔案分片
const currentChunkIndex = ref(0); // 當前分片索引
const totalThreads = navigator.hardwareConcurrency || 2; // 硬體執行緒數量
const workerResult = ref([]); // 檔案分片worker的結果
const workerMultiple = ref([]); // 多執行緒的結果，將多個result合併

const fileListSize = ref([]); // 檔案列表大小
const fileSendSize = ref(0); // 傳送至後端的檔案大小
const sendTextInput = ref([]); // 檔案描述
const confirmOpened = ref(false); // 確認視窗是否開啟
const chunksFileInfo = ref([]);

// 處理檔案分割與檔案數量不對等時的資料
function handleFileChunkData(chunksInfo) {
  chunksInfo.forEach((chunkInfo) => {
    sendTextInput.value.push(chunkInfo.textInput);
    fileListSize.value.push(chunkInfo.fileSize);
  });
}

// 計算檔案分割資料，如檔案分為十片時，則會有十筆這個檔案描述、進度條與檔案大小的資料
function calculateFileChunks(fileList, chunkSize) {
  const chunksInfo = [];
  let progressFileNumber = 0;

  fileList.forEach((file) => {
    const fileSize = file.size;
    const totalChunks = Math.ceil(fileSize / chunkSize);
    for (let i = 0; i < totalChunks; i++) {
      chunksInfo.push({
        textInput: textInput.value[fileList.indexOf(file)],
        fileSize: fileSize,
        progress: progressFileNumber,
      });
    }
    progressFileNumber++;
  });

  handleFileChunkData(chunksInfo);

  return chunksInfo;
}

// 初始化檔案資料，如檔案描述、檔案大小與
function initialFileData(file) {
  sendTextInput.value = []; // 清空sendTextInput
  fileListSize.value = []; // 清空fileListSize
  chunksFileInfo.value = []; // 清空chunksFileInfo
  for (let i = 0; i < file.length; i++) {
    progress.value[i] = 0;
  }
}

const uploadingStatus = ref(false);

async function uploadChunks() {
  // 計算已選擇檔案的總大小
  const totalSize = Array.from(selectedFiles.value).reduce(
    (acc, curr) => acc + curr.size,
    0
  );

  if (!textUserId.value) {
    // 如果用戶沒有輸入UserID，則顯示警告
    alert("Please enter User ID before uploading files.");
    return;
    // 如果選擇的檔案總大小超過5GB，則顯示警告
  } else if (totalSize > 5 * 1024 * 1024 * 1024) {
    alert(
      "The total size of selected files exceeds 5GB. Please select files with total size less than 5GB."
    );
    return;
    // 如果用戶沒有選擇檔案或已經開始上傳檔案，則不執行上傳
  } else if (
    !selectedFiles.value ||
    selectedFiles.value.length === 0 ||
    confirmOpened.value
  ) {
    return;
  }

  // 開始上傳檔案，禁止壓縮檔案按鈕
  uploadingStatus.value = true;
  // 確保用戶重複點擊後的問題
  confirmOpened.value = true;

  // 初始化檔案資料與進度條
  initialFileData(fileList.value);

  // 利用分片計算檔案描述、檔案大小與進度條
  // chunksFileInfo.value = calculateFileChunks(fileList.value, chunkSize);

  if (zipFileStatus.value) {
    await createZipFile();
    chunksFileInfo.value = calculateFileChunks(zipFileBlob.value, chunkSize);
    await uploadChunkThreads(zipFileBlob.value);
    setTimeout(() => {
      handleSendUploadStatus(false);
    }, 1000);
  } else {
    // 開始上傳檔案
    chunksFileInfo.value = calculateFileChunks(fileList.value, chunkSize);
    await uploadChunkThreads(fileList.value);
    setTimeout(() => {
      handleSendUploadStatus(false);
    }, 1000);
  }
}

// 遞迴上傳分片
async function uploadChunkThreads(file) {
  try {
    // 分片處理上傳的檔案 (多執行緒) ------------------------------------------------------------------------------------
    for (let j = 0; j < file.length; j++) {
      const chunkCount = Math.ceil(file[j].size / chunkSize); // 檔案總分片次數
      const workerChunkCount = Math.ceil(chunkCount / totalThreads); // 每個worker分配到的分片數量
      const workerPromises = []; // 用來存放每個 worker 的 Promise

      for (let i = 0; i < totalThreads; i++) {
        // import.meta.url指向當前執行module的JavaScript文件的位置
        const worker = new Worker(
          new URL("../../uploadService/boardUploadWorker.js", import.meta.url),
          {
            type: "module",
          }
        );
        // 每個worker處理的分片範圍
        const startIndex = i * workerChunkCount;
        let endIndex = startIndex + workerChunkCount;
        if (endIndex >= chunkCount) {
          endIndex = chunkCount;
        }
        // 傳送給worker的資料
        const workerPromise = new Promise((resolve) => {
          worker.postMessage({
            file: file[j],
            chunkSize,
            startIndex,
            endIndex,
            zipFileName: zipFileName.value,
            zipFileStatus: zipFileStatus.value,
            roomCode: props.roomCode,
          });
          // 接收來自worker的JS檔案傳遞過來的參數
          worker.onmessage = (e) => {
            for (let i = startIndex; i < endIndex; i++) {
              workerResult.value[i] = e.data[i - startIndex];
            }
            worker.terminate();
            resolve();
          };
          // worker發生錯誤時的處理
          worker.onerror = (error) => {
            console.error("Worker error: ", error);
            resolve();
          };
        });
        // 將每個worker的Promise存入workerPromises
        workerPromises.push(workerPromise);
      }
      // 等待所有worker的Promise完成後，再進行下一個檔案的處理
      await Promise.all(workerPromises);
      workerMultiple.value.push(...workerResult.value);
      workerResult.value = [];
    }
    // 分片處理上傳的檔案 (多執行緒) ------------------------------------------------------------------------------------

    await uoloadChunksRecurively(0);
    // 當上傳完成後，可點擊確認按鈕
    confirmOpened.value = false;
  } catch (error) {
    console.error("Error in uploadChunkThreads: ", error);
  }

  async function uoloadChunksRecurively(index) {
    if (index >= workerMultiple.value.length) {
      fileListUploadStatus.value = true;
      workerMultiple.value = [];
      return;
    }

    const { fileChunk, totalChunks, fileId, chunkId } =
      workerMultiple.value[index];
    const chunkNumber = workerMultiple.value[index].chunkNumber + 1;

    // 根據是否壓縮檔案更改檔案大小邏輯
    if (zipFileStatus.value) {
      fileSendSize.value = zipFileBlob.value[0].size;
    } else {
      fileSendSize.value = fileListSize.value[index];
    }
    outputFileName.value = workerMultiple.value[index].fileName;
    // 根據分片檔案計算進度條，第一個檔案有3個分片，其值就會是0,0,0
    const progressIndex = chunksFileInfo.value[index].progress;
    const description = sendTextInput.value[index] || "";

    const formData = new FormData();
    formData.append("fileChunk", fileChunk);
    formData.append("chunkNumber", chunkNumber);
    formData.append("totalChunks", totalChunks);
    formData.append("fileId", fileId);
    formData.append("chunkId", chunkId);
    formData.append("size", fileSendSize.value);
    formData.append("outputFileName", outputFileName.value);
    formData.append("description", description);
    formData.append("roomCode", props.roomCode);
    formData.append("uploaderName", textUserId.value);

    await UploadService.uploadRoomFileChunk(formData);
    // 每上傳一個分片，進度條就會增加1
    currentChunkIndex.value++;
    // 進度條的值
    progress.value[progressIndex] = Math.ceil(
      (100 * currentChunkIndex.value) / totalChunks
    );
    // 若分片數量等於總分片數量，則告知後端上傳完成第一個檔案
    if (currentChunkIndex.value === totalChunks) {
      // 重製分片索引
      currentChunkIndex.value = 0;
      await UploadService.completeUploadRoomFile(
        fileId,
        outputFileName.value,
        chunkId
      );
    }
    // 遞迴上傳下一個分片
    await uoloadChunksRecurively(index + 1);
  }
}

onMounted(() => {
  handleCurrentUserStatus();
});
</script>

<template>
  <div class="upload-board-mask">
    <div class="upload-board-page" @click.stop>
      <div class="upload-board-page-title">
        <h2>
          <span><font-awesome-icon :icon="['far', 'file']" /></span>
          Upload Files
        </h2>
        <p>Attachments that have been uploaded as part of this project.</p>
      </div>

      <div
        class="upload-board-select"
        :class="dropActive ? 'drop-active' : ''"
        @drop="handleFileDrop"
        @dragover.prevent="handleDragActive"
        @dragenter.prevent="handleDragActive"
        @dragleave="handleDragNoActive"
        @dragend="handleDragNoActive"
      >
        <p><font-awesome-icon :icon="['far', 'file']" /></p>
        <h3>
          Drag & drop your files here or
          <span>
            <label type="button" for="fileInput"> choose files </label>
            <input
              type="file"
              name="fileInput"
              id="fileInput"
              multiple
              ref="file"
              @change="selectFile"
            />
          </span>
        </h3>
        <h4>5 GB max file size.</h4>
      </div>

      <div class="upload-board-fileTitle">
        <!-- 新增確認壓縮檔案按鈕 -->
        <div class="upload-board-zip">
          <h2>Uploaded Files</h2>

          <div class="upload-board-input-userId" v-if="!verifyUserId">
            <label for="userId">
              <input
                type="text"
                name="userId"
                id="userId"
                placeholder="User ID"
                v-model="textUserId"
              />
            </label>
          </div>

          <div class="upload-board-zip-button">
            <label for="zipCheck">
              <input
                type="checkbox"
                name="zipCheck"
                id="zipCheck"
                :disabled="uploadingStatus"
                :checked="zipFileStatus"
                @change="handleZipFileStatus()"
              />
              <span><font-awesome-icon :icon="ckZipIcon" /></span>
              <p>Archived files</p>
            </label>
          </div>
        </div>

        <div class="upload-board-fileList">
          <!-- Loading的樣板 -->
          <div
            class="upload-board-file"
            v-for="count in fileCount"
            v-if="fileUploadStatus"
          >
            <div class="upload-board-file-data">
              <span><font-awesome-icon :icon="['far', 'file']" /></span>
              <div>
                <p>Universal-System-Web-Example.mp4</p>
                <p>40.9 MB</p>
              </div>
            </div>
            <div class="upload-board-textarea">
              <textarea
                name="textarea"
                id="textarea"
                rows="2"
                placeholder="Please enter a brief description of the file."
              ></textarea>
            </div>

            <div class="upload-progress-set">
              <div class="upload-progress">
                <div
                  class="upload-progress-bar upload-progress-bar-striped"
                  :aria-valuenow="progress"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  :style="{ width: 40 + '%' }"
                ></div>
              </div>
              <div class="upload-progress-text">{{ 40 }}%</div>
            </div>
          </div>
          <!-- 取得資料後的樣子 -->
          <div v-else>
            <!-- 判斷用戶是否點擊壓縮檔案按鈕 -->
            <div v-if="zipFileStatus">
              <div class="upload-board-file">
                <div class="upload-board-file-data">
                  <span><font-awesome-icon :icon="['far', 'file']" /></span>
                  <div>
                    <p>{{ zipFileName }}</p>
                    <p>{{ selectedZipFileSize }}</p>
                  </div>
                </div>
                <div class="upload-board-textarea">
                  <textarea
                    name="textarea"
                    id="textarea"
                    rows="2"
                    v-model="textInput[0]"
                    placeholder="Please enter a brief description of the file.&nbsp;"
                  ></textarea>
                </div>

                <div class="upload-progress-set">
                  <div class="upload-progress">
                    <div
                      class="upload-progress-bar upload-progress-bar-striped"
                      :aria-valuenow="progress"
                      aria-valuemin="0"
                      aria-valuemax="100"
                      :style="{ width: progress[0] + '%' }"
                    ></div>
                  </div>
                  <div class="upload-progress-text">{{ progress[0] }}%</div>
                </div>
              </div>

              <!-- zip -->
            </div>

            <!-- 否則是多檔列表 -->
            <div v-else class="upload-board-fileList">
              <div
                class="upload-board-file"
                v-for="(file, index) in fileList"
                :key="index"
              >
                <div class="upload-board-file-data">
                  <span><font-awesome-icon :icon="['far', 'file']" /></span>
                  <div>
                    <p>{{ file.name }}</p>
                    <p>{{ selectFileSize[index] }}</p>
                  </div>
                </div>
                <div class="upload-board-textarea">
                  <textarea
                    name="textarea"
                    id="textarea"
                    rows="2"
                    v-model="textInput[index]"
                    placeholder="Please enter a brief description of the file.&nbsp;"
                  ></textarea>
                </div>

                <div class="upload-progress-set">
                  <div class="upload-progress">
                    <div
                      class="upload-progress-bar upload-progress-bar-striped"
                      :aria-valuenow="progress"
                      aria-valuemin="0"
                      aria-valuemax="100"
                      :style="{ width: progress[index] + '%' }"
                    ></div>
                  </div>
                  <div class="upload-progress-text">{{ progress[index] }}%</div>
                </div>
              </div>
            </div>
          </div>
          <!--  -->
        </div>
      </div>

      <div class="upload-board-decide">
        <button @click="handleSendUploadStatus(false)">Cancel</button>
        <button @click="uploadChunks">Attach files</button>
      </div>

      <span @click="handleSendUploadStatus(false)"
        ><font-awesome-icon icon="xmark"
      /></span>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "../../assets/styles/layout/board/uploadBoard";

.upload-progress-set {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 3px;
  width: 440px;

  .upload-progress-text {
    font-size: 14px;
  }
}

.upload-progress {
  display: flex;
  height: 0.5rem;
  overflow: hidden;
  font-size: 0.75rem;
  background-color: #e9ecef;
  border-radius: 0.25rem;
  width: 90%;

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
    animation: progress-animation 1.5s linear infinite;
  }
  @keyframes progress-animation {
    0% {
      background-position: 1rem 0;
    }
    100% {
      background-position: 0 0;
    }
  }

  .upload-progress-bar {
    display: flex;
    align-items: center;
    color: #fff;
    text-align: center;
    white-space: nowrap;
    background-color: #675bf9;
    transition: width ease;
  }
}
</style>
