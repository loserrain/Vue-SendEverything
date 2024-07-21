<script setup>
import { RouterLink } from "vue-router";
import { useUploadInfo } from "../stores/upload";

const uploadTab = useUploadInfo();

function setSelectedTab(tab) {
  uploadTab.setSelectedTab(tab);
}

</script>

<template>
  <div class="send-title">
    <img src="../assets/image/Logo.png" alt="">
    <h1><span class="send-word">Send</span>Everything</h1>
  </div>
  <div class="send-slogan">
    <h2>FREE FILE SHARING PLATFORM</h2>
    <RouterLink to="/uploadfile" 
      ><button class="upload-button" @click="setSelectedTab('Send')">+ UPLOAD</button></RouterLink
    >
  </div>
</template>

<style lang="scss" scoped>
.send-title {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 30px;
  img {
    margin-top: 120px;
    width: 400px;
  }

  h1,
  button {
    font-size: 96px;
    font-weight: 700;
    color: #553721;
    user-select: none;
    cursor: default;
  }

  .send-word {
    color: #EC773D;
    font-weight: 700;
  }
}

.send-slogan{
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  h2 {
    margin: 2px 0 20px;
    font-size: 22px;
    font-weight: bold;
    color: #553721;
    letter-spacing: 6px;
  }
}


.upload-button {
  border: 0;
  border-radius: 30px;
  background: #1291e0;
  color: #ffffff;
  font-size: 26px;
  font-weight: 700;
  padding: 19px 22px 17px 22px;
  transition: 0.1s;

  &:hover {
    background: #0399f6ca;
    cursor: pointer;
  }
}
</style>
