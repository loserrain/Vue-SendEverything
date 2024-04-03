<script setup>
import { ref, watchEffect, onMounted } from "vue";

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
});

const totalSize = ref(0);
const reader = ref(null);
const chunks = ref([]);
const loadedSize = ref(0);
const filename = ref("example.txt");

function readStream(response) {
  totalSize.value = response.headers.get("Content-Length") || "未知大小";
  reader.value = response.body.getReader();
  console.log(chunks.value);

  const read = () => {
    return reader.value.read().then(({ done, value }) => {
      if (done) {
        return new Blob(chunks.value);
      }
      loadedSize.value += value.length;
      progress.value = ((loadedSize.value / totalSize.value) * 100).toFixed(0);
      chunks.value.push(value);
      return read();
    });
  };
  return read();
}

function downloadFile() {
  uploadStatus.value = true;
  const url = `http://localhost:8080/api/auth/downloadFileByCode/${code.value}`;
  fetch(url)
    .then((response) => {
      uploadStatus.value = false;
      code.value = "";
      progressStatus.value = false;
      const contentDisposition = response.headers.get("Content-Disposition");
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename\*?=['"]?(?:UTF-8'')?([^'";]+)['"]?/i
        );
        if (filenameMatch && filenameMatch[1]) {
          filename.value = decodeURIComponent(filenameMatch[1]);
        }
      }

      return readStream(response);
    })
    .then((blob) => {
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename.value;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
      progressStatus.value = true;
      loadedSize.value = 0;
      chunks.value = [];
    })
    .catch((error) => {
      console.error("下載過程中發生錯誤:", error);
      uploadStatus.value = false;
      chunks.value = [];
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
