<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../../stores/auth.module";
import UploadService from "../../services/uploadFilesService";

const emits = defineEmits(["sendFileInfo", "selectUploadFile"]);

const authStore = useAuthStore();

// const currentUser = computed(() => {
//   return authStore.dataStatus.user;
// });

const selectedFiles = ref(undefined);
const file = ref(null);
const selectFileName = ref('');

const previewImage = ref(null);

function selectFile() {
  selectedFiles.value = file.value.files;
  selectFileName.value = shortenFileName(file.value.files[0].name, 24)
  console.log(selectFileName.value);
  emits("selectUploadFile", file.value.files);
}

function shortenFileName(fileName, maxLength) {
  if (fileName.length > maxLength) {
    return `${fileName.slice(0, 10)} --- ${fileName.slice(-14)}`;
  }
  return fileName;
}

const currentFile = ref(undefined);
const progress = ref(0);
const fileInfos = ref([]);
const fileSort = ref([]);

const fileReceive = ref([]);
const qrCodeImage = ref(null);
console.log("qwe", fileSort.value);

function upload() {
  progress.value = 0;

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
    progress.value = Math.round((100 * event.loaded) / event.total);
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

onMounted(() => {
  uploadGetFiles();
});
</script>

<template>
  <div class="upload-file-container">
    <!-- upload的檔案傳送列表 -->
    <div class="upload-send">
      <label for="fileInput" class="upload-fileinput">
        <font-awesome-icon icon="plus" class="upload-font" />
        <input type="file" id="fileInput" ref="file" @change="selectFile" />
      </label>
      <div v-if="selectedFiles">{{ selectFileName }}</div>
      <div v-else class="upload-send-file-noselect">Please select a file.</div>
      <p>
        <button @click="upload" :disabled="!selectedFiles">
          Click to Upload
        </button>
      </p>
      <p class="upload-send-maxfile">(Max. File size: 25 MB)</p>
    </div>

    <!-- 上傳時的檔案區 -->
    <div class="upload-sort" v-if="currentFile">
      <div class="upload-file" v-for="file in fileReceive" :key="file.fileName">
        <div class="upload-set">
          <div>
            <font-awesome-icon icon="file-lines" />
          </div>
          <div>
            <span>{{ file.fileName }}</span>
            <p>{{ file.fileSize }}</p>
          </div>
          <div>
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

    <!-- 上傳檔案區 -->
    <!-- <div class="upload-file" v-for="(files, index) in fileSort" :key="index" v-if="!currentUser">
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
    </div> -->

    <!-- 歷史紀錄區(登入後) -->
    <p class="uploat-history-line"></p>
    <p class="upload-history-title">Historical record</p>
    <div class="upload-history">
      <!-- <div class="upload-history-title">Historical record</div> -->
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
  // border: 3px solid #01122217;
  // border-radius: 10px;
  // padding: 5px;
  // margin-top: 50px;
  position: relative;
}

.upload-history-title {
  text-align: center;
  margin-bottom: 10px;
  margin-top: 15px;
  font-size: 32px;
  // color: $primary;

  // font-size: 32px;
  font-weight: 700;
  // text-align: center;
  color: aliceblue;
  background-color: #7492ea;
  padding: 10px;
  border-radius: 10px 0px;

  // position: absolute;
  // top: -1%;
  // left: 50%;

  // top: -37px;
  // left: 0;
  // color: rgb(255, 255, 255);
  // font-size: 18px;
  // border-radius: 5px;
  // background-color: #ec9ea9;
  // padding: 5px 10px 5px;
}

.uploat-history-line{
  border: 1.5px solid $primary-text-gray-100;
}
</style>
