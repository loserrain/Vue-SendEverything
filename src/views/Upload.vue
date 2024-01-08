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
  Receive,
  
};

function setSelectedTab(tab) {
  uploadTab.setSelectedTab(tab);
}

const uploadData = ref(false);

const handleSendFileInfo = (fileInfo) => {
  uploadData.value = fileInfo;
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
  reader.readAsDataURL(files[0]);
  reader.onload = () => {
    previewImage.value = reader.result;
  };
};

</script>

<template>
  <div class="upload-view container">
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

    <div class="upload-explore upload-select">
      <!-- <div class="upload-decorations upload-top"></div>
      <div class="upload-decorations upload-bottom"></div> -->
      <div v-if="uploadData">
        <h2>{{ uploadData.fileName }}</h2>
        <div class="upload-qrcode">
          <img
            :src="`data:image/png;base64,${uploadData.qrcodeImg}`"
            alt="QR Code"
          />
        </div>
        <div class="upload-key-box">
          <span v-for="code in uploadData.downloadCode">
            {{ code }}
          </span>
        </div>
      </div>

      <div v-else>
        <h2>fileName.txt...</h2>
        <div class="upload-qrcode">
          <img
            src="https://www.kphoto.com.tw/image/catalog/Product/ASS/93_arctic_white.gif"
            alt=""
          />
        </div>
        <div class="upload-key-box">
          <span>0</span>
          <span>0</span>
          <span>0</span>
          <span>0</span>
          <span>0</span>
          <span>0</span>
        </div>
      </div>
    </div>

    <!-- <div class="upload-img">
      <img :src="previewImage" alt="" />
    </div> -->
  </div>
</template>

<style lang="scss" scoped>
@import "../assets/styles/layout/upload";
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

// .upload-view{
//   display: flex;
//   justify-content: center;
//   align-items: center;
// }

.upload-select {
  border: 3px solid #ca878f4d;
  box-shadow: 4px 5px 5px rgba(0, 0, 0, 0.135);
  // width: 25%;
  // margin-left: 2%;
  // margin-right: 1%;
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
  padding: 110px 20px 0px 20px;
  position: relative;

  img {
    width: 200px;
    height: 200px;
    display: block;
    margin: 0 auto;
    // border: 5px solid #c8dbec;
    border-radius: 10px;
  }

  h2 {
    font-size: 32px;
    font-weight: 700;
    text-align: center;
    // color: #011222c3;
    color: aliceblue;
    background-color: #7492ea;
    padding: 10px;
    border-radius: 10px 0px;
  }
}

.upload-qrcode {
  background-color: $theme-body-background;
  padding: 25px 0 25px;
  margin: 45px 90px 0;
  border-radius: 10px;
  border: 3px solid $primary-text-gray-150;
}

.upload-key-box {
  margin-top: 50px;
  text-align: center;
  span {
    background-color: #e5e4e445;
    margin: 0 5px;
    color: #011222c3;
    font-size: 36px;
    font-weight: 700;
    text-align: center;
    display: inline-block;
    width: 40px;
    line-height: 64px;
  }
}

.upload-shareLink {
  :first-child {
    margin: 40px 0 20px;
  }
  p:nth-child(2) {
    display: block;
    background: $primary-text-gray-30;
    border: 1px solid #01122217;
    border-radius: 10px;
    box-shadow: 1px 1px 10px rgba(0, 0, 0, 0.135);
    text-align: center;
    font-size: 18px;
    padding: 13px 10px 13px;
  }
}

.upload-decorations {
  position: absolute;
  left: 0%;
  height: 70px;
  width: 100%;
  background-color: #d3dadf;
}

.upload-top {
  top: 0%;
}

.upload-bottom {
  bottom: 0%;
}

.upload-img{
  width: 200px;
  height: 200px;

  img{
    width: 100%;
  }
}
</style>
