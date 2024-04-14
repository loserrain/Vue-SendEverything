<script setup>
import { RouterLink } from "vue-router";
import { useUploadTab } from "../stores/upload";

const uploadTab = useUploadTab();


function setSelectedTab(tab) {
  uploadTab.setSelectedTab(tab);
}
</script>

<template>
  <div>
    <p><span class="send-word">Send</span>Everything</p>
    <p>Simple, Fast, and Free File Sharing</p>
    <RouterLink to="/uploadfile" @click="setSelectedTab('Send')"
      ><button class="upload-button">+ UPLOAD</button></RouterLink
    >
  </div>
</template>

<style lang="scss" scoped>
div {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: calc(83vh - 70px);

  p,
  button {
    margin: 36px 0 0 0;
    user-select: none;
    cursor: default;
  }

  p:first-child {
    font-size: 96px;
    font-weight: 700;
  }

  p:nth-child(2) {
    font-size: 36px;
    font-weight: 400;
  }
}

.send-word {
  color: #f04545;
  font-weight: 700;
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
