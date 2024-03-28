<script setup>
import { ref, computed } from "vue";
import Send from "../components/upload/UploadFiles.vue";
import Receive from "../components/upload/UploadText.vue";
import Message from "../components/upload/UploadMessage.vue";
import { useUploadTab } from "../stores/upload";

const emits = defineEmits(["sendImgInfo"]);

const uploadTab = useUploadTab();

const times = ref(10 * 60 * 1000);

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

const verificationCode = ref("");

const uploadData = ref(false);
const uploadFile = ref(undefined);
const uploadFileName = ref([]);
const uploadFileSize = ref([]);
const uploadFileTotalSize = ref(0);
const uploadFileStatus = ref(false);

const handleSendFileInfo = (fileInfo) => {
  uploadData.value = fileInfo;
  verificationCode.value = uploadData.value.downloadCode;

  // 當取得驗證碼時，更改檔案列表狀態
  // uploadFileStatus.value = false;
  console.log(verificationCode.value);
};

const previewImage = ref(null);

const handleSelectedFile = (fileData) => {
  const { fileList, fileName, fileSize, totalFileSize, fileStatus } = fileData;
  uploadFile.value = fileList;
  uploadFileName.value = fileName;
  uploadFileSize.value = fileSize;
  uploadFileTotalSize.value = totalFileSize;
  uploadFileStatus.value = fileStatus; // 檔案列表狀態
  console.log("fileList:", uploadFile.value);

};

const handleUploadStatus = (fileStatus) => {
  uploadFileStatus.value = fileStatus;
  console.log("uploadFileStatus.value", uploadFileStatus.value);
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
  navigator.clipboard.write([clipboardItem]).then(
    () => {
      console.log("Verification code copied!");
    },
    (err) => {
      console.error("Unable to copy verification code", err);
    }
  );
};

const transformSlotProps = (props) => {
  const formattedProps = {};

  Object.entries(props).forEach(([key, value]) => {
    formattedProps[key] = value < 10 ? `0${value}` : String(value);
  });

  return formattedProps;
};
</script>

<template>
  <div class="outer" v-if="previewImageStatus" @click="changdImgStatus(false)">
    <img :src="previewImage" alt="" @click.stop />
  </div>

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
          @sendUploadStatus="handleUploadStatus"
        >
        </component>
      </div>
    </div>

    <div class="upload-explore-container">
      <div class="upload-explore-download">
        <div class="upload-explore-qrcode">
          <div v-if="!uploadData">
            <div class="upload-qrcode-bg" v-if="!uploadFileStatus">
              <!-- <img src="../assets/image/QRCodeExample.gif" alt="" /> -->
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
            <vue-countdown
              :time="10 * 60 * 1000"
              :transform="transformSlotProps"
              v-slot="{ minutes, seconds }"
            >
              {{ minutes }} : {{ seconds }}
            </vue-countdown>
          </div>
          <Receive />
        </div>
      </div>

      <div class="upload-explore-hr"></div>

      <div class="upload-explore-preview">
        <p v-if="!previewImage" data-stroke="File Preview">Picture Preview.</p>
        <img v-else :src="previewImage" @click="changdImgStatus(true)" alt="" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "../assets/styles/layout/upload";

.outer {
  position: fixed; /*此行指定黑色背景區塊不會隨著網頁捲動而隨著移動*/
  left: 0px; /*此行指定黑色背景區塊貼齊瀏覽器左方*/
  top: 0px; /*此行指定黑色背景區塊貼齊瀏覽器上方*/
  width: 100vw; /*此行指定黑色背景區塊的寬度為整個瀏覽器的寬度*/
  height: 100vh; /*此行指定黑色背景區塊的高度為整個瀏覽器的高度*/
  background-color: rgba(0, 0, 0, 0.65); /*此行指定背景區塊的背景顏色70%的黑色*/
  text-align: center; /*此行指定黑色背景區塊的內容會居中*/
  z-index: 2;

  img {
    height: 70%;
    margin-top: 13vh;
  }
}

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
    // margin: 2.5vh 0 2.5vh 10px;
    margin: 25px 0 25px 10px;
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
    width: 100%;
    height: 310px;
    background-color: #F9F6F6;

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

  .upload-fileList-block {
    background-color: #fafafa;
    width: 100%;
    height: 310px;
    // padding: 10px  5px 0;
    overflow: hidden;

    h2 {
      background-color: #fafafa;
      font-size: 20px;
      font-weight: 700;

      // box-shadow: 2px 2px 1px 2px rgba(0, 0, 0, 0.2);
      padding: 10px 15px 6px 15px;
    }

    > p {
      margin: 2px 0px 2px;
      border: 1.5px solid #dedede;
    }

    > div {
      overflow: auto;
    }

    .upload-fileList {

      // 檔案列表反轉
      display: flex;
      flex-direction: column-reverse;
      justify-content: start;
      // 檔案列表反轉

      height: 225px;
      margin: 0 5px 0 5px;

      div {
        display: flex;
        justify-content: space-between;
        padding: 2px 3px 2px;
        cursor: pointer;
      }
      div:nth-child(odd) {
        background-color: #e0e0e0;

        margin: 2px 0px 2px;
        border-radius: 2px;
      }
    }

    .upload-totalFileSize {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #ececec;
      height: 33px;
      padding: 0 5px 0;
      p {
        font-size: 18px;
        font-weight: 700;
        color: #656565;
      }
    }

  }

  .upload-explore-code {
    width: 51%;
    height: 100%;

    div {
      text-align: center;
    }

    .upload-code-border {
      background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='10' ry='10' stroke='%23BABABAFF' stroke-width='3' stroke-dasharray='10%2c10' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e");
      background-color: #fafafa;
      border-radius: 10px;
      // margin: 2.8vh 15px 0 15px;
      margin: 28px 15px 0 15px;
      height: 40%;
      display: flex;
      flex-direction: column;
      align-items: center;
      // justify-content: center;
      position: relative;

      p {
        font-size: 20px;
        font-weight: 700;
        margin-top: 15px;
        color: #c1c1c1;
        user-select: none;
        cursor: default;
      }

      > span {
        font-size: 18px;
        font-weight: 700;
        color: #912323;
        position: absolute;
        right: 2%;
        top: 5%;
      }
    }
  }
}

.upload-key-box {
  margin-top: 32px;
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
  margin-right: 3px;
  width: 92%;
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
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    display: block;
    max-height: calc(100% - 3%);
    width: auto;
    cursor: pointer;
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
    color: #327CCF;
    background-color: #e7f0fc;
    border-radius: 6px;
  }

  &:hover {
    color: #656973;
    background-color: #ECEFF1;
    border-radius: 6px;
  }
}
</style>
