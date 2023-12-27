<script setup>
import { ref, onMounted, computed } from "vue";
import UploadService from "../services/uploadFilesService";
import { object } from "yup";
const tabs = ref(["Send", "Receive", "Message"]);

const selectedFiles = ref(undefined);
const file = ref(null);

function selectFile() {
  selectedFiles.value = file.value.files;
  console.log(selectedFiles.value[0].name);
}

const currentFile = ref(undefined);
const progress = ref(0);
const message = ref();
const fileInfos = ref([]);
const fileSort = ref([]);

const fileReceive = ref([]);

function upload() {
  progress.value = 0;

  currentFile.value = selectedFiles.value.item(0);

  const fileInfo = {
    fileName: currentFile.value.name,
    fileSize: Math.round(currentFile.value.size / 1024),
  };

  fileReceive.value.push(fileInfo);

  UploadService.upload(currentFile.value, (event) => {
    progress.value = Math.round((100 * event.loaded) / event.total);
  })
    .then((response) => {
      message.value = response.data.message;

      return response.data;
    })
    .then((files) => {
      fileInfos.value = files.data;
    })
    .catch(() => {
      progress.value = 0;
      message.value = "Could not upload the file!";
      currentFile.value = undefined;
      console.log(message.value);
      fileReceive.value = [];
    });

  selectedFiles.value = undefined;
}

function uploadGetFiles() {
  UploadService.getFiles().then((response) => {
    fileInfos.value = response.data;
    const fileNames = fileInfos.value.fileName || [];
    const fileData = fileInfos.value.fileData || [];

    fileNames.forEach((fileName, index) => {
      if (fileName.length > 18) {
        fileNames[index] = `${fileName.slice(0, 8)} --- ${fileName.slice(-10)}`;
      }
    });

    // if(Object.keys(fileData).length < 18) {
    //   const sliceFileData = Object.fromEntries(
    //     Object.entries(fileData).slice(0, 8).concat(Object.entries(fileData).slice(-10))
    //   );
    //   fileSort.value = fileNames.map((fileName, index) => ({
    //     fileName: fileName,
    //     fileSize: sliceFileData[index],
    //   }));
    //   console.log('123')
    // } else {
    //   fileSort.value = fileNames.map((fileName, index) => ({
    //     fileName: fileName,
    //     fileSize: fileData[index],
    //   }))
    //   console.log(Object.keys(fileData).length)
    // }

    if (fileNames.length === fileData.length) {
      fileSort.value = fileNames.map((fileName, index) => ({
        fileName: fileName,
        fileSize: fileData[index],
      }));
      console.log(fileNames[0]);
    }
  });
}

onMounted(() => {
  uploadGetFiles();
});
</script>

<template>
  <div class="container">
    <div class="upload-select">
      <div class="upload-switch">
        <button v-for="tab in tabs">
          {{ tab }}
        </button>
      </div>
      <div class="upload-container">
        <div class="upload-send">
          <label for="fileInput" class="upload-fileinput">
            <font-awesome-icon icon="folder-plus" class="upload-font" />
            <input type="file" id="fileInput" ref="file" @change="selectFile" />
          </label>
          <div v-if="selectedFiles">{{ selectedFiles[0].name }}</div>
          <div v-else class="upload-send-file-noselect">No file selected.</div>
          <p>
            <button @click="upload" :disabled="!selectedFiles">
              Click to Upload
            </button>
          </p>
          <p class="upload-send-maxfile">(Max. File size: 25 MB)</p>
        </div>

        <div
          class="upload-file"
          v-for="file in fileReceive"
          :key="file.fileName"
        >
          <div class="upload-set">
            <div>
              <font-awesome-icon icon="file-lines" />
            </div>
            <div>
              <span>{{ file.fileName }}</span>
              <p>{{ file.fileSize }} KB</p>
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

        <div
          class="upload-file"
          v-for="(files, index) in fileSort"
          :key="index"
        >
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
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "../assets/styles/layout/upload";
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
