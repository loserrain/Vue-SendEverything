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
          <div v-if="!uploadData">
            <img
              src="https://www.kphoto.com.tw/image/catalog/Product/ASS/93_arctic_white.gif"
              alt=""
            />
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

            <div class="upload-key-box" v-else>
              <span v-for="code in uploadData.downloadCode">
                {{ code }}
              </span>
            </div>

            <div>
              <p>10:00</p>
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

    <!-- <div class="upload-explore upload-select">
      <div class="upload-decorations upload-top"></div>
      <div class="upload-decorations upload-bottom"></div>
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
    </div> -->

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

.upload-view {
  display: flex;
  justify-content: center;
  align-items: center;
}

.upload-select {
  border: 3px solid #ca878f4d;
  box-shadow: 4px 5px 5px rgba(0, 0, 0, 0.135);
  width: 26%;
  // margin-left: 2%;
  // margin-right: 1%;
}

.upload-explore-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #ffffff;
  border: 3px solid #ca878f4d;
  box-shadow: 4px 5px 5px rgba(0, 0, 0, 0.135);
  width: 40%;
  height: 721px;
  margin: 8vh 0 0 30px;
  border-radius: 10px;

  .upload-explore-download {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 98%;
  }

  .upload-explore-qrcode {
    margin: 30px 0 30px 30px;
    width: 40%;
    border: 2px solid #dbdbdbbf;
    border-radius: 5px;

    img {
      display: block;
      width: 100%;
    }
  }

  .upload-explore-code {
    width: 51%;
    height: 330px;
    // border: 2px solid #dbdbdbbf;
    // border-radius: 5px;
    margin: 0 20px 0 20px;

    div {
      text-align: center;
    }

    p {
      display: inline-block;
      margin: auto;
      font-size: 20px;
      font-weight: 700;
      background-color: #fad4d1;
      border: 2px solid #d42212c1;
      border-radius: 5px;
      color: #d42212c1;
      margin: 15px 0 15px;
      padding: 3px;
    }

    .upload-code-border {
      background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='10' ry='10' stroke='%23BABABAFF' stroke-width='3' stroke-dasharray='10%2c10' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e");
      background-color: #fafafa;
      border-radius: 10px;
      margin: 0 15px 0 15px;
    }
  }
}

.upload-key-box {
  margin-top: 10px;
  text-align: center;
  span {
    background-color: #e5e4e445;
    margin: 15px 5px 0 5px;
    color: #011222c3;
    font-size: 36px;
    font-weight: 700;
    text-align: center;
    display: inline-block;
    width: 40px;
    line-height: 64px;
  }
}

.upload-explore-hr{
  border: 2px solid $primary-text-gray-100;
  // margin: 0 45px;
  width: 90%;
}

.upload-explore-preview{
  background-color: #fafafa;
  background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='10' ry='10' stroke='%23BABABAFF' stroke-width='3' stroke-dasharray='10%2c10' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e");
  // border: 3px solid $primary-text-gray-100;
  border-radius: 10px;
  width: 92%;
  height: 100%;
  margin: 30px 0 20px;
  overflow-y: auto;
  text-align: center;
  position: relative;
  // width: 400px;

  img{
    display: block;
    // object-fit: cover;
    // object-fit: contain;
    // border-radius: 5px;
    // width: 100%;
    width: calc(100% - 0.3%);
    // height: 100%;
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
    // text-shadow: 
    //   3px 3px 0 #ccc,
    //   6px 6px 0 #c8b59c,
    //   9px 9px 0 #b2a080;
    
    // text-shadow: -1px -1px 0 #efe4d1,
    //           1px -1px 0 #efe4d1,
    //           -1px 1px 0 #efe4d1,
    //           1px 1px 0 #efe4d1;

    // &::before{
    //   content: attr(data-stroke);
    //   position: absolute;
    //   z-index: -1;
    //   -webkit-text-stroke: 10px #cb9f62;
    // }
  }
}

// -------------------------------------------------------------------------------------------------------
.upload-button {
  &.active {
    color: black;
  }

  &:hover {
    color: black;
  }
}

// .upload-explore {
//   padding: 110px 20px 0px 20px;
//   position: relative;

//   img {
//     width: 200px;
//     height: 200px;
//     display: block;
//     margin: 0 auto;
//     // border: 5px solid #c8dbec;
//     border-radius: 10px;
//   }

//   h2 {
//     font-size: 32px;
//     font-weight: 700;
//     text-align: center;
//     // color: #011222c3;
//     color: aliceblue;
//     background-color: #7492ea;
//     padding: 10px;
//     border-radius: 10px 0px;
//   }
// }

// .upload-qrcode {
//   background-color: $theme-body-background;
//   padding: 25px 0 25px;
//   margin: 45px 90px 0;
//   border-radius: 10px;
//   border: 3px solid $primary-text-gray-150;
// }

// .upload-key-box {
//   margin-top: 50px;
//   text-align: center;
//   span {
//     background-color: #e5e4e445;
//     margin: 0 5px;
//     color: #011222c3;
//     font-size: 36px;
//     font-weight: 700;
//     text-align: center;
//     display: inline-block;
//     width: 40px;
//     line-height: 64px;
//   }
// }

// .upload-shareLink {
//   :first-child {
//     margin: 40px 0 20px;
//   }
//   p:nth-child(2) {
//     display: block;
//     background: $primary-text-gray-30;
//     border: 1px solid #01122217;
//     border-radius: 10px;
//     box-shadow: 1px 1px 10px rgba(0, 0, 0, 0.135);
//     text-align: center;
//     font-size: 18px;
//     padding: 13px 10px 13px;
//   }
// }

// .upload-decorations {
//   position: absolute;
//   left: 0%;
//   height: 70px;
//   width: 100%;
//   background-color: #d3dadf;
// }

// .upload-top {
//   top: 0%;
// }

// .upload-bottom {
//   bottom: 0%;
// }

// .upload-img{
//   width: 200px;
//   height: 200px;

//   img{
//     width: 100%;
//   }
// }
</style>
