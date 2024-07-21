<script setup>
import { ref, watchEffect, onMounted } from "vue";
import API_URL from "../../services/Unify_API/API_URL";
import UploadService from "../../services/FilesService";
import Webstomp from "webstomp-client";
import socketURL from "../../services/Unify_API/webSocket_URL";
import { v4 as uuidv4 } from "uuid";
import { useUploadInfo } from "../../stores/upload";

const uploadInfo = useUploadInfo();

const code = ref("");
const isComplete = ref(false);
const downloadLink = ref(null);
const uploadStatus = ref(false);
const progressStatus = ref(true);
const progress = ref(0);
const downloadUUID = ref(uuidv4());
const downloadStatus = ref(false);

let client;

onMounted(() => {
  watchEffect(() => {
    isComplete.value = code.value.length === 6;
  });
});

function downloadFiles() {
  progress.value = 0;
  if (/[a-zA-Z]/.test(code.value)) {
    UploadService.getMessage(code.value).then((response) => {
      uploadInfo.setTextReceiveResult(response.data.verificationCode);
    });
  } else {
    downloadFile();
  }
}

async function downloadFile() {
  if (!isComplete.value) {
    return;
  }
  downloadStatus.value = true;
  connectWebSocket(downloadUUID.value);
  progressStatus.value = false;
  uploadStatus.value = true;
  createDownloadLink();
}

function connectWebSocket(downloadUUID) {
  const socket = new WebSocket(socketURL);
  client = Webstomp.over(socket);
  client.connect(
    {},
    () => {
      client.subscribe(`/topic/downloadProgress/${downloadUUID}`, (message) => {
        progress.value = Math.round(JSON.parse(message.body));
        if (progress.value === 100) {
          updateProgressComplete()
        }
      });
    },
    (error) => {
      console.error("WebSocket Connection error: ", error);
    }
  );
}

function createDownloadLink() {
  const url =
    API_URL + "/downloadFileByCode/" + code.value + "/" + downloadUUID.value;
  code.value = "";
  downloadStatus.value = true;
  const a = document.createElement("a");
  a.href = url;
  a.download = "";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function updateProgressComplete() {
  client.disconnect();
  progressStatus.value = true;
  uploadStatus.value = false;
  downloadStatus.value = false;
}
</script>

<template>
  <div class="upload-receive-container">
    <div>
      <p class="upload-receive">Receive</p>
      <p class="upload-receive-fileName">input code</p>
    </div>
    <div class="upload-code-box" v-if="!downloadStatus">
      <input
        type="text"
        v-model="code"
        @keyup.enter="downloadFiles()"
        placeholder=""
      />
      <div @click="downloadFiles()"><font-awesome-icon icon="download" /></div>
    </div>
    <div v-else>
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
      </div>
      <div class="upload-progress-percent">
        <p :style="{ width: progress + '%' }">{{ progress }}%</p>
      </div>
    </div>
    <a ref="downloadLink"></a>
  </div>
</template>

<style lang="scss" scoped>
@import "../../assets/styles/layout/uploadReceive";
</style>
