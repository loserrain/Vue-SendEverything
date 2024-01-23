<script setup>
import { ref, computed } from "vue";
import Send from "../components/upload/UploadFiles.vue";
import Receive from "../components/upload/UploadText.vue";
import Message from "../components/upload/UploadMessage.vue";
import { useUploadTab } from "../stores/upload";

const uploadTab = useUploadTab();

const currentTab = computed(() => {
  return uploadTab.selectedTab;
});

const tabs = {
  Send,
  Message,
};

function setSelectedTab(tab) {
  uploadTab.setSelectedTab(tab);
}

const verificationCode = ref('');

const uploadData = ref(false);

const handleSendFileInfo = (fileInfo) => {
  uploadData.value = fileInfo;
  verificationCode.value = uploadData.value.downloadCode;
  console.log(verificationCode.value)
  if (uploadData.value.fileName.length > 20) {
    uploadData.value.fileName =
      uploadData.value.fileName.slice(0, 8) +
      " --- " +
      uploadData.value.fileName.slice(-12);
  }
};

const previewImage = ref(null);

const handleSelectedFile = (files) => {
  const reader = new FileReader();
  const selectFileSize = files[0].size / 1024 / 1024;
  // 大於30MB就不顯示檔案預覽
  if (selectFileSize < 30) {
    reader.readAsDataURL(files[0]);
  }
  reader.onload = () => {
    previewImage.value = reader.result;
  };
};

const copyVerificationCode = () => {
  const blob = new Blob([verificationCode.value], { type: 'text/plain' });
  const clipboardItem = new ClipboardItem({ 'text/plain': blob });
  navigator.clipboard.write([clipboardItem]).then(
    () => {
      console.log('Verification code copied!');
    },
    (err) => {
      console.error('Unable to copy verification code', err);
    }
  );
}
</script>

<template>
  <div class="upload-view">
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
        ></component>
      </div>
    </div>

    <div class="upload-explore-container">
      <div class="upload-explore-download">
        <div class="upload-explore-qrcode">
          <div class="upload-qrcode-bg" v-if="!uploadData">
            <img src="../assets/image/QRCodeExample.gif" alt="" />
            <p>QR Code</p>
          </div>
          <div v-else>
            <img
              :src="`data:image/png;base64,${uploadData.qrcodeImg}`"
              alt="QR Code"
            />
          </div>
        </div>

        <div class="upload-explore-code">
          <div class="upload-code-border">
            <div class="upload-key-box" v-if="!uploadData">
              <span>0</span>
              <span>0</span>
              <span>0</span>
              <span>0</span>
              <span>0</span>
              <span>0</span>
            </div>

            <div class="upload-key-box" @click="copyVerificationCode" v-else>
              <span v-for="code in uploadData.downloadCode">
                {{ code }}
              </span>
            </div>

            <div>
              <p>Verification code</p>
            </div>
          </div>
          <Receive />
        </div>
      </div>

      <div class="upload-explore-hr"></div>

      <div class="upload-explore-preview">
        <p v-if="!previewImage" data-stroke="File Preview">File Preview.</p>
        <img v-if="previewImage" :src="previewImage" alt="" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "../assets/styles/layout/upload";

.upload-view {
  display: flex;
  justify-content: center;
  align-items: center;
}

.upload-select {
  border: 3px solid #ca878f4d;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.135);
  width: 520px;
}

.upload-explore-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #ffffff;
  border: 3px solid #ca878f4d;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.135);
  width: 800px;
  height: 721px;
  margin: 8vh 0 0 30px;
  border-radius: 10px;

  .upload-explore-download {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    width: 100%;
  }

  .upload-explore-qrcode {
    margin: 2.5vh 0 2.5vh 10px;
    width: 40%;
    border: 5px solid #dbdbdbbf;
    border-radius: 5px;

    img {
      display: block;
      width: 100%;
    }
  }

  .upload-qrcode-bg {
    position: relative;

    p {
      position: absolute;
      top: 50%;
      text-align: center;
      transform: translateY(-50%);
      width: 100%;
      font-size: 56px;
      font-weight: 700;
      color: $primary-text-gray-30;
      user-select: none;
      cursor: default;
    }
  }

  .upload-explore-code {
    width: 51%;
    height: 100%;
    // margin: 45px 20px 0 20px;
    // padding: 10px 0px 10px 0px;

    div {
      text-align: center;
    }

    // p {
    //   display: inline-block;
    //   margin: auto;
    //   font-size: 20px;
    //   font-weight: 700;
    //   background-color: #fad4d1;
    //   border: 2px solid #d42212c1;
    //   border-radius: 5px;
    //   color: #d42212c1;
    //   margin: 15px 0 15px;
    //   padding: 3px;
    // }

    .upload-code-border {
      background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='10' ry='10' stroke='%23BABABAFF' stroke-width='3' stroke-dasharray='10%2c10' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e");
      background-color: #fafafa;
      border-radius: 10px;
      margin: 2.8vh 15px 0 15px;
      height: 40%;
      display: flex;
      flex-direction: column;
      align-items: center;
      // justify-content: center;

      p {
        font-size: 20px;
        font-weight: 700;
        margin-top: 10px;
        color: #c1c1c1;
        user-select: none;
        cursor: default;
      }
    }
  }
}

.upload-key-box {
  margin-top: 33px;
  width: 280px;
  cursor: pointer;
  span {
    background-color: #e5e4e445;
    border: 1px solid $primary-text-gray-100;
    border-radius: 5px;
    margin: 0px 5px 0 5px;
    color: #011222c3;
    font-size: 32px;
    font-weight: 700;
    text-align: center;
    display: inline-block;
    width: 13%;
    line-height: 56px;
  }
}

.upload-explore-hr {
  border: 2px solid $primary-text-gray-100;
  width: 90%;
}

.upload-explore-preview {
  background-color: #fafafa;
  background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='10' ry='10' stroke='%23BABABAFF' stroke-width='3' stroke-dasharray='10%2c10' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e");
  border-radius: 10px;
  width: 92%;
  height: 100%;
  margin: 30px 0 20px;
  overflow-y: auto;
  text-align: center;
  position: relative;

  img {
    display: block;
    width: calc(100% - 0.3%);
  }

  p {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateY(-50%) translateX(-50%);
    width: 100%;
    font-size: 80px;
    font-weight: 700;
    color: $primary-text-gray-30;
    user-select: none;
    cursor: default;
  }
}
.upload-button {
  &.active {
    color: black;
  }

  &:hover {
    color: black;
  }
}
</style>
