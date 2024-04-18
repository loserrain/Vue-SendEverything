<script setup>
import { ref, computed, watch, watchEffect } from "vue";
import Send from "../components/upload/UploadFiles.vue";
import Receive from "../components/upload/UploadText.vue";
import Message from "../components/upload/UploadMessage.vue";
import { useUploadInfo } from "../stores/upload";

const uploadInfo = useUploadInfo();

const emits = defineEmits(["sendImgInfo"]);

const currentTab = computed(() => {
  return uploadInfo.selectedTab;
});

const tabs = {
  Send,
  Message,
};

function setSelectedTab(tab) {
  uploadInfo.setSelectedTab(tab);
}

watch(currentTab, (newTab) => {
  if (newTab === "Message") {
    uploadFileStatus.value = false;
  }
});

const verificationCode = ref(false);
const verificationCodeStatus = ref(false);

watchEffect(() => {
  if (verificationCodeStatus) {
    setTimeout(() => {
      verificationCodeStatus.value = false;
    }, 1000);
  }
});

function resetTransition() {
  verificationCodeStatus.value = false;
}

const uploadData = ref(false);
const uploadFile = ref(undefined);
const uploadFileName = ref([]);
const uploadFileSize = ref([]);
const uploadFileTotalSize = ref(0);
const uploadFileStatus = ref(false);

// 監聽pinia store的textReceiveCode，並將其賦值給verificationCode
watchEffect(() => {
  if (uploadInfo.textReceiveStatus) {
    verificationCode.value = uploadInfo.textReceiveCode;
    verificationCodeStatus.value = true;
  }
});

const handleSendFileInfo = (fileInfo) => {
  uploadData.value = fileInfo;
  verificationCode.value = uploadData.value.downloadCode;
  // 當從父組件取得資料時，更改驗證碼動畫狀態
  if(uploadData.value) {
    verificationCodeStatus.value = true;
  }
};

const previewImage = ref(null);

const handleSelectedFile = (fileData) => {
  const { fileList, fileName, fileSize, totalFileSize, fileStatus } = fileData;
  uploadFile.value = fileList;
  uploadFileName.value = fileName;
  uploadFileSize.value = fileSize;
  uploadFileTotalSize.value = totalFileSize;
  uploadFileStatus.value = fileStatus; // 檔案列表狀態
  if (uploadFileStatus.value) {
    uploadData.value = false;
  }
};

const handleUploadStatus = (fileStatus) => {
  uploadFileStatus.value = fileStatus;
};

const FileClickPreview = (index) => {
  const reader = new FileReader();
  const selectFileSize = uploadFile.value[index].size / 1024 / 1024;
  if (selectFileSize < 30) {
    reader.readAsDataURL(uploadFile.value[index]);
  }
  reader.onload = () => {
    previewImage.value = reader.result;
  };
};

// 放大圖片預覽區域
const previewImageStatus = ref(false);

function changdImgStatus(newStatus) {
  previewImageStatus.value = newStatus;
}

// 放大圖片預覽區域

// 複製驗證碼
const copyVerificationCode = () => {
  const blob = new Blob([verificationCode.value], { type: "text/plain" });
  const clipboardItem = new ClipboardItem({ "text/plain": blob });
  navigator.clipboard.write([clipboardItem]);
};
</script>

<template>
  <div class="outer" v-if="previewImageStatus" @click="changdImgStatus(false)">
    <img :src="previewImage" alt="" @click.stop />
  </div>

  <div class="upload-view">
    <div>
      <h1>Upload File</h1>
      <div class="upload-select">
        <div class="upload-switch">
          <button
            v-for="(_, tab) in tabs"
            :key="tab"
            :class="['upload-button', { active: currentTab === tab }]"
            @click="setSelectedTab(tab)"
          >
            {{ tab }}
          </button>
          <component
            :is="tabs[currentTab]"
            @sendFileInfo="handleSendFileInfo"
            @selectUploadFile="handleSelectedFile"
            @sendUploadStatus="handleUploadStatus"
          >
          </component>
        </div>
      </div>

    </div>
    <div>
      <h3>Receive File</h3>
      <div class="upload-explore-container">
        <div class="upload-explore-download">
          <div class="upload-explore-qrcode">
            <div v-if="!uploadData">
              <div class="upload-qrcode-bg" v-if="!uploadFileStatus">
                <p class="upload-qrcode-icon"><font-awesome-icon icon="qrcode" /></p>
                <p>QR Code</p>
              </div>
              <div class="upload-fileList-block" v-else>
                <h2>Upload File List:</h2>
                <p></p>
                <div>
                  <div class="upload-fileList">
                    <div
                      v-for="(fileName, index) in uploadFileName"
                      :key="index"
                      @click="FileClickPreview(index)"
                    >
                      <p>{{ fileName }}</p>
                      <p>{{ uploadFileSize[index] }}</p>
                    </div>
                  </div>
                </div>
  
                <p></p>
  
                <div class="upload-totalFileSize">
                  <p>Total Size:</p>
                  <p>{{ uploadFileTotalSize }}</p>
                </div>
              </div>
            </div>
            <div v-else>
              <img
                :src="uploadData.qrcodeImg"
                alt="QR Code"
              />
            </div>
          </div>
  
          <div class="upload-explore-code">
            <div
              class="upload-code-border"
              :class="verificationCodeStatus ? 'upload-key-box-shake' : ''"
              @transitionend="resetTransition"
            >
              <div class="upload-code-copy" @click="copyVerificationCode()"><font-awesome-icon :icon="['far', 'copy']" /></div>
              <p>Receive Code</p>
              <div class="upload-key-box upload-key-box-default" v-if="!verificationCode">
                <span v-for="index in 6">0</span>
              </div>
              
              <div class="upload-key-box" @click="copyVerificationCode()" v-else>
                <span v-for="code in verificationCode">
                  {{ code }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="upload-explore-preview">
          
          <p v-if="!previewImage" data-stroke="Picture Preview"><font-awesome-icon :icon="['far', 'image']" /></p>
          <img v-else :src="previewImage" @click="changdImgStatus(true)" alt="" />
        </div>
        
      </div>
      <Receive />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "../assets/styles/layout/uploadViews";

</style>
