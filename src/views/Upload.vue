<script setup>
import { ref } from "vue";
import Send from "../components/upload/UploadFiles.vue";
import Receive from "../components/upload/UploadText.vue";
import Message from "../components/upload/UploadMessage.vue";

const currentTab = ref("Send");
const tabs = {
  Send,
  Receive,
  Message,
};

const uploadData = ref(false);

const handleSendFileInfo = (fileInfo) => {
  uploadData.value = fileInfo;
  if (uploadData.value.fileName.length > 20) {
    uploadData.value.fileName =
      uploadData.value.fileName.slice(0, 8) +
      " --- " +
      uploadData.value.fileName.slice(-12);
    console.log(uploadData.value.fileName);
  }
  console.log(uploadData.value.fileName);
};
</script>

<template>
  <div class="container">
    <div class="upload-select">
      <div class="upload-switch">
        <button
          v-for="(_, tab) in tabs"
          :key="tab"
          :class="['upload-button', { active: currentTab === tab }]"
          @click="currentTab = tab"
        >
          {{ tab }}
        </button>
        <component
          :is="tabs[currentTab]"
          @sendFileInfo="handleSendFileInfo"
        ></component>
      </div>
    </div>

    <div class="upload-explore upload-select">
      <div v-if="uploadData">
        <p>{{ uploadData.fileName }}</p>
        <div class="upload-qrcode">
          <img
            :src="`data:image/png;base64,${uploadData.qrcodeImg}`"
            alt="QR Code"
          />
        </div>
        <p class="upload-downloadCode">{{ uploadData.downloadCode }}</p>
        <div>
          <p>Share Link:</p>
          <p class="upload-shareLink">{{ uploadData.fileDownloadUri }}</p>
        </div>
      </div>
      <div v-else>
        <p>fileName.txt...</p>
        <div class="upload-qrcode">
          <img
            src="https://www.kphoto.com.tw/image/catalog/Product/ASS/93_arctic_white.gif"
            alt=""
          />
        </div>
        <p class="upload-downloadCode">000000</p>
        <div class="">
          <p>Share Link:</p>
          <p class="upload-shareLink">https://www.flaticon.com/free-icon/qr-code_241528</p>
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

.upload-button {
  &.active {
    color: black;
  }

  &:hover {
    color: black;
  }
}

.upload-explore {
  padding: 25px 20px 0px 20px;

  img {
    width: 300px;
    height: 300px;
    display: block;
    margin: 0 auto;
  }

  p:first-child {
    font-size: 32px;
    font-weight: 700;
  }

  .upload-downloadCode {
    font-size: 32px;
    text-align: center;
    margin:60px 0 35px;
  }
}

.upload-qrcode {
  background-color: $theme-body-background;
  padding: 20px 0 20px;
  margin: 50px 50px 0;
  border-radius: 10px;
  border: 3px solid $primary-text-gray-150;
}

.upload-shareLink{
  background: $primary-text-gray-30;
  margin-top: 20px;
  padding: 13px 10px 13px;
  border-radius: 10px;
}
</style>
