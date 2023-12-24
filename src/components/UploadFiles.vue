<script setup>
import { onMounted, ref } from "vue";
import UploadService from "../services/uploadFilesService.js";

const selectedFiles = ref(undefined);
const file = ref(null);

function selectFile() {
  selectedFiles.value = file.value.files; // files為用戶選擇的文件
}

const currentFile = ref(undefined);
const progress = ref(0);
const message = ref();
const fileInfos = ref([]);

function upload() {
  progress.value = 0;

  currentFile.value = selectedFiles.value.item(0);

  UploadService.upload(currentFile.value, (event) => {
    progress.value = Math.round((100 * event.loaded) / event.total);
    
  })
    .then((response) => {
      //message.value = response.data.message;
      //return UploadService.getFiles(selectedFiles.value.item(0));
      // The response object contains the data returned by the server
      let responseData = response.data;
      console.log(responseData);
       // Open the download URL in a new browser tab
      window.open(responseData.fileDownloadUri, '_blank');
      //return message
    })
    .then((files) => {
      fileInfos.value = files.data;
    })
    .catch(() => {
      progress.value = 0;
      message.value = "Could not upload the file!";
      currentFile.value = undefined;
    });

  selectedFiles.value = undefined;
}

onMounted(() => {
  UploadService.getFiles().then((response) => {
    fileInfos.value = response.data;
  });
});
</script>

<template>
  <div class="container">
    <div v-if="currentFile" class="progress">
      <div
        class="progress-bar progress-bar-info progress-bar-striped"
        role="progressbar"
        :aria-valuenow="progress"
        aria-valuemin="0"
        aria-valuemax="100"
        :style="{ width: progress + '%' }"
      >
        {{ progress }}%
      </div>
    </div>

    <div class="label_style">
      <label for="fileInput" class="">
        <input type="file" id="fileInput" ref="file" @change="selectFile" />
      </label>
      <button
        class="btn btn-success"
        :disabled="!selectedFiles"
        @click="upload"
      >
        Upload
      </button>
    </div>

    <div class="alert alert-light" role="alert">{{ message }}</div>

    <div class="card">
      <div class="card-header">List of Files</div>
      <ul class="list-group list-group-flush">
        <li
          class="list-group-item"
          v-for="(file, index) in fileInfos"
          :key="index"
        >
          <a :href="file.url">{{ file.name }}</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.label_style {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 5px;
}

.btn {
  display: inline-block;
  font-weight: 400;
  color: #212529;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  user-select: none;
  background-color: transparent;
  border: 1px solid transparent;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.25rem;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.btn-success {
  color: #fff;
  background-color: #28a745;
  border-color: #28a745;
}

.btn-success.disabled,
.btn-success:disabled {
  color: #fff;
  background-color: #28a745;
  border-color: #28a745;
}

.btn.disabled,
.btn:disabled {
  opacity: 0.65;
}

.alert {
  position: relative;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  text-align: center;
}

.alert-light {
  color: #818182;
  background-color: #fefefe;
  border-color: #fdfdfe;
}

.card {
  position: relative;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-direction: column;
  flex-direction: column;
  min-width: 0;
  word-wrap: break-word;
  background-color: #fff;
  background-clip: border-box;
  border: 1px solid rgba(0, 0, 0, 0.125);
  border-radius: 0.25rem;
}

.card-header {
  padding: 0.75rem 1.25rem;
  margin-bottom: 0;
  background-color: rgba(0, 0, 0, 0.03);
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

.card-header:first-child {
  border-radius: calc(0.25rem - 1px) calc(0.25rem - 1px) 0 0;
}

.list-group {
  display: flex;
  flex-direction: column;
  padding-left: 0;
  margin-bottom: 0;
}

.list-group-item {
  position: relative;
  display: block;
  padding: 0.75rem 1.25rem;
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.list-group-flush .list-group-item {
  border-right-width: 0;
  border-left-width: 0;
  border-radius: 0;
}

a {
  color: #007bff;
  text-decoration: none;
  background-color: transparent;
}

.progress {
  display: flex;
  height: 1rem;
  overflow: hidden;
  font-size: 0.75rem;
  background-color: #e9ecef;
  border-radius: 0.25rem;
}

.progress-bar-striped {
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

.progress-bar {
  display: flex;
  -ms-flex-direction: column;
  flex-direction: column;
  -ms-flex-pack: center;
  justify-content: center;
  overflow: hidden;
  color: #fff;
  text-align: center;
  white-space: nowrap;
  background-color: #007bff;
  transition: width 0.6s ease;
}
</style>
