<script setup>
import { ref, watchEffect } from "vue";
import UploadService from "../../services/uploadFilesService";

const emits = defineEmits(["sendUploadStatus"]);
const props = defineProps(["roomCode"]);

function handleSendUploadStatus(newStatus) {
  emits("sendUploadStatus", newStatus);
}

const fileCount = 2;
const textInput = ref([]);

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

// 壓縮檔案使用
const zipFileBlob = ref(undefined);
const zipFileName = ref("SendEverything");

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

// 選擇檔案
function selectFile() {
  selectedFiles.value = file.value.files;
  selectFileName.value = file.value.files[0].name;
  outputFileName.value = file.value.files[0].name;
  handleFileSelectAndDrop(file.value.files);
}

function handleFileSelectAndDrop(file) {
  // 上傳狀態判別，若為true，則清空檔案列表與進度條
  if (fileListUploadStatus.value) {
    fileListUploadStatus.value = false;
    fileList.value = [];
    progress.value = [];
    selectFileSize.value = [];
    fileUploadStatus.value = false;
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

const currentFile = ref(undefined);

// 增加檔案分割的資料
const chunkSize = 10 * 1024 * 1024; // 5MB
const totalChunks = ref(0);
const currentChunkIndex = ref(0);
const totalThreads = navigator.hardwareConcurrency || 2;
const workerResult = ref([]);
const sendTextInput = ref([]);
const fileListSize = ref([]);

function calculateFileChunks(fileList, chunkSize) {
  const chunksInfo = [];
  let progressFileNumber = 0;

  fileList.forEach((file) => {
    const fileSize = file.size;
    const totalChunks = Math.ceil(fileSize / chunkSize);
    // console.log("progressFileNumber", progressFileNumber);
    for (let i = 0; i < totalChunks; i++) {
      chunksInfo.push({
        textInput: textInput.value[fileList.indexOf(file)],
        fileSize: fileSize,
        progress: progressFileNumber,
      });
    }
    progressFileNumber++;
  });

  return chunksInfo;
}

async function uploadChunks() {
  if (!selectedFiles.value || selectedFiles.value.length === 0) return;

  // 取得當前選擇檔案
  currentFile.value = selectedFiles.value[0];
  totalChunks.value = Math.ceil(currentFile.value.size / chunkSize);
  currentChunkIndex.value = 0;
  console.log("fileLise.value", fileList.value);

  workerResult.value = []; // 清空workerResult
  sendTextInput.value = []; // 清空sendTextInput
  fileListSize.value = []; // 清空fileListSize

  const chunksInfo = calculateFileChunks(fileList.value, chunkSize);

  chunksInfo.forEach((chunkInfo) => {
    sendTextInput.value.push(chunkInfo.textInput);
    fileListSize.value.push(chunkInfo.fileSize);
  });
  await uploadChunkThreads(fileList.value);
}

const workerMultiple = ref([]);

// 分片上傳
// 遞迴上傳分片
async function uploadChunkThreads(file) {
  try {
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

        const startIndex = i * workerChunkCount;
        let endIndex = startIndex + workerChunkCount;
        if (endIndex >= chunkCount) {
          endIndex = chunkCount;
        }
        const workerPromise = new Promise((resolve) => {
          worker.postMessage({
            file: file[j],
            chunkSize,
            startIndex,
            endIndex,
          });

          worker.onmessage = (e) => {
            for (let i = startIndex; i < endIndex; i++) {
              workerResult.value[i] = e.data[i - startIndex];
            }
            worker.terminate();
            resolve();
          };

          worker.onerror = (error) => {
            console.error("Worker error: ", error);
            resolve();
          };
        });

        workerPromises.push(workerPromise);
      }

      await Promise.all(workerPromises);
      workerMultiple.value.push(...workerResult.value);
      console.log("workerMultiple", workerMultiple.value);
      workerResult.value = [];
    }

    const chunksInfoProgress = calculateFileChunks(file, chunkSize);
    await uoloadChunksRecurively(0, chunksInfoProgress);
  } catch (error) {
    console.error("Error in uploadChunkThreads: ", error);
  }

  async function uoloadChunksRecurively(index, chunksInfoProgress) {
    if (index >= workerMultiple.value.length) {
      fileListUploadStatus.value = true;
      workerMultiple.value = [];
      return;
    }

    const { fileChunk, totalChunks, fileId, chunkId } =
      workerMultiple.value[index];
    const chunkNumber = workerMultiple.value[index].chunkNumber + 1;
    const fileSize = fileListSize.value[index];
    outputFileName.value = workerMultiple.value[index].fileName;
    const progressIndex = chunksInfoProgress[index].progress;
    const description = sendTextInput.value[index] || "";

    const formData = new FormData();
    formData.append("fileChunk", fileChunk);
    formData.append("chunkNumber", chunkNumber);
    formData.append("totalChunks", totalChunks);
    formData.append("fileId", fileId);
    formData.append("chunkId", chunkId);
    formData.append("size", fileSize);
    formData.append("outputFileName", outputFileName.value);
    formData.append("description", description);
    formData.append("roomCode", props.roomCode);

    await UploadService.uploadRoomFileChunk(formData);
    currentChunkIndex.value++;
    progress.value[progressIndex] = Math.ceil(
      (100 * currentChunkIndex.value) / totalChunks
    );
    if (currentChunkIndex.value === totalChunks) {
      currentChunkIndex.value = 0;
      await UploadService.completeUploadRoomFile(
        fileId,
        outputFileName.value,
        chunkId
      );
    }
    await uoloadChunksRecurively(index + 1, chunksInfoProgress);
  }
}
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
        <h4>500 MB max file size.</h4>
      </div>

      <div class="upload-board-fileTitle">
        <h2>Uploaded Files</h2>
        <div class="upload-board-fileList">
          <!--  -->
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
          <!--  -->
          <div
            class="upload-board-file"
            v-for="(file, index) in fileList"
            :key="index"
            v-else
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
