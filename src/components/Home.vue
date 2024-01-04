<script setup>
import { RouterLink } from "vue-router";
import OauthService from "../services/auth.service";
import { useAuthStore } from "../stores/auth.module";
import { useUploadTab } from "../stores/upload";
import { onMounted } from "vue";

const authStore = useAuthStore();
const uploadTab = useUploadTab();

// const oauth2 = async() => {
//   try {
//     const response = await OauthService.oauth2();
//     localStorage.setItem("user", JSON.stringify(response.data));
//     console.log("test oauth2", response.data);
//   } catch (error) {
//     console.log("error:", error)
//   }
// }

function setSelectedTab(tab) {
  uploadTab.setSelectedTab(tab);
}

onMounted(() => {
  authStore.oauth2();
});
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
