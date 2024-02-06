<script setup>
import { ref } from "vue";
import navbar from "./views/Navbar.vue";

const previewImage = ref(undefined);
const previewImageStatus = ref(false);

const handleSendImgInfo = (imgInfo) => {
  const { img, status } = imgInfo;
  previewImage.value = img;
  previewImageStatus.value = status;
};

function changdImgStatus() {
  previewImageStatus.value = false;
}
</script>

<template>
  <div class="outer" v-if="previewImageStatus" @click="changdImgStatus">
    <img :src="previewImage" alt="" @click.stop />
  </div>

  <div>
    <navbar />
  </div>
  <div>
    <RouterView @sendImgInfo="handleSendImgInfo" />
  </div>
</template>

<style lang="scss" scoped>
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
</style>
