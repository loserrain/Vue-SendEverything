<script setup>
import axios from "axios";
import { ref, watchEffect, onMounted } from "vue";

const code = ref("");
const isComplete = ref(false);
const downloadLink = ref(null);
const progress = ref(0);

onMounted(() => {
  watchEffect(() => {
    isComplete.value = code.value.length === 6;
  });
});


function showLoadingIndicator() {
  console.log('显示加载指示器...');
  // 这里可以添加加载动画的逻辑
}

function hideLoadingIndicator() {
  console.log('隐藏加载指示器...');
  // 这里可以添加隐藏加载动画的逻辑
}

function updateDownloadProgress(loaded, total) {
  // console.log(`下载进度：${loaded} / ${total} (${((loaded / total) * 100).toFixed(2)}%)`);
  // 这里可以更新页面上的进度条
}
const filename =ref("example.txt");
function downloadFile() {
  
  const url = `http://localhost:8080/api/auth/downloadFileByCode/${code.value}`;
  showLoadingIndicator();

  fetch(url)
    .then(response => {
      console.log(response.headers.get('Content-Disposition'));
      console.log(response.headers);
        const contentDisposition = response.headers.get('Content-Disposition');
        // 默认文件名，如果无法从Content-Disposition中获取，则使用
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename\*?=['"]?(?:UTF-8'')?([^'";]+)['"]?/i);
            if (filenameMatch && filenameMatch[1]) {
                filename.value = decodeURIComponent(filenameMatch[1]);
            }
        }
      const totalSize = response.headers.get('Content-Length') || '未知大小';
      let loadedSize = 0;

      const reader = response.body.getReader();
      const chunks = [];  // 用于存储接收到的数据块

      const read = () => {
        return reader.read().then(({ done, value }) => {
          if (done) {
            hideLoadingIndicator();
            console.log('文件数据接收完成');
            return new Blob(chunks);
          }

          loadedSize += value.length;
          progress.value = ((loadedSize / totalSize) * 100).toFixed(0);
          chunks.push(value);
          updateDownloadProgress(loadedSize, totalSize);

          // 递归读取下一块数据
          return read();
        });
      };

      return read();
    })
    .then(blob => {
      // 创建下载链接并触发下载
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename.value ;  // 设置下载文件名
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    })
    .catch(error => {
      console.error('下载过程中发生错误:', error);
    });
}
</script>


<template>
  <div class="upload-receive-container">
    <div class="upload-code-box">
      <input type="text" v-model="code" />
    </div>
    <button class="submit-btn" :class="{ active: isComplete }" :disabled="!isComplete" @click="downloadFile">
      Download
    </button>

    <div class="upload-progress-set">
      <div class="upload-progress">
        <div class="upload-progress-bar upload-progress-bar-striped" :aria-valuenow="progress" aria-valuemin="0"
          aria-valuemax="100" :style="{ width: progress + '%' }"></div>
      </div>
      <div>{{ progress }}%</div>
    </div>

    <a ref="downloadLink"></a>
  </div>
</template>

<style lang="scss" scoped>
@import "../../assets/styles/layout/upload";

// .upload-receive-container {
//   margin: 1.8vh 15px 0;
//   background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='10' ry='10' stroke='%23BABABAFF' stroke-width='3' stroke-dasharray='10%2c10' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e");
//   background-color: #fafafa;
//   border-radius: 10px;
//   height: 40%;
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: space-evenly;

//   button {
//     color: #fff;
//     background-color: #28a745;
//     border-radius: 7px;
//     border: none;
//     box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.135);
//     font-size: 18px;
//     font-weight: 700;
//     padding: 8px 12px 7px;
//     transition: 0.2s;
//     position: relative;
//     cursor: pointer;

//     &:hover {
//       opacity: 0.8;
//     }

//     &:disabled {
//       background-color: $primary-text-gray-150;
//       opacity: 0.4;

//       &:hover {
//         padding: 8px 12px 7px;
//       }
//     }
//   }
// }

// .upload-send {
//   height: 30px;
//   margin: 10px 0 0 0;
// }

// .upload-code-box {
//   margin-top: 10px;

//   input {
//     background-color: #dbdbdb44;
//     border: 2px solid $primary-text-gray-100;
//     border-radius: 5px;
//     // margin: 3vh 0 2vh;
//     padding: 10px 10px;
//     font-size: 20px;
//     width: 80%;

//     &:focus-visible {
//       background-color: #ffffff;
//       outline: none;
//       border: solid 2px $primary-button-blue-100;
//       box-shadow: 0px 1px 8px rgba(0, 0, 0, 0.28);
//       transition: 0.1s;
//     }
//   }
// }

// a {
//   display: none;
// }

.upload-progress-set {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

.upload-progress {
  display: flex;
  height: 0.8rem;
  overflow: hidden;
  font-size: 0.75rem;
  background-color: #85b5e6;
  border-radius: 0.25rem;
  width: 85%;

  .upload-progress-bar-striped {
    background-image: linear-gradient(45deg,
        rgba(255, 255, 255, 0.15) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.15) 50%,
        rgba(255, 255, 255, 0.15) 75%,
        transparent 75%,
        transparent);
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
</style>