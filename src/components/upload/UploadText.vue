<script setup>
import axios from "axios";
import { ref, watchEffect, onMounted } from "vue";

const code = ref("");
const isComplete = ref(false);
const downloadLink = ref(null);

onMounted(() => {
  watchEffect(() => {
    isComplete.value = code.value.length === 6;
  });
});

const downloadCode = async () => {
  try {
    if (isComplete.value) {
      // nginx 更改網址
      const url = `http://localhost:8080/api/auth/downloadFileByCode/${code.value}`;
      // const response = await axios.get(url);
      // window.location.href = response.data.fileDownloadUri;
      const response = await axios.get(url, { responseType: "blob" });
      window.location.href = response.request.responseURL;
    }
  } catch (error) {
    console.log("Error downloading file:", error);
  }
};
</script>

<template>
  <div class="upload-receive-container">
    <div class="upload-code-box">
      <input type="text" id="verificationCode" placeholder=" " v-model="code" />
      <label for="verificationCode">Verification code</label>
    </div>
    <button
      class="submit-btn"
      :class="{ active: isComplete }"
      :disabled="!isComplete"
      @click="downloadCode"
    >
      Download
    </button>
    <a ref="downloadLink"></a>
  </div>
</template>

<style lang="scss" scoped>
@import "../../assets/styles/layout/upload";
.upload-receive-container {
  // margin: 1.8vh 15px 0;
  margin: 20px 15px 0;
  background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='10' ry='10' stroke='%23BABABAFF' stroke-width='3' stroke-dasharray='10%2c10' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e");
  background-color: #fafafa;
  border-radius: 10px;
  height: 40%;
  // height: 145px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;

  button {
    color: #fff;
    background-color: #28a745;
    border-radius: 7px;
    border: none;
    box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.135);
    font-size: 18px;
    font-weight: 700;
    padding: 8px 12px 7px;
    transition: 0.2s;
    position: relative;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }

    &:disabled {
      background-color: $primary-text-gray-150;
      opacity: 0.4;

      &:hover {
        padding: 8px 12px 7px;
      }
    }
  }
}

.upload-code-box {
  margin-top: 10px;
  position: relative;
  input {
    background-color: #dbdbdb44;
    border: 2px solid $primary-text-gray-100;
    border-radius: 5px;
    // margin: 3vh 0 2vh;
    padding: 10px 10px;
    font-size: 20px;
    width: 80%;
    &:focus-visible {
      background-color: #ffffff;
      outline: none;
      border: solid 2px $primary-button-blue-100;
      box-shadow: 0px 1px 8px rgba(0, 0, 0, 0.28);
      transition: 0.1s;
    }

    &:focus-visible + label, &:not(:placeholder-shown) + label {
      top: -23px;
      left: 35px;
      font-size: 18px;
      color: $primary-button-blue-100;
    }
  }

  label {
    position: absolute;
    top: 12px;
    left: 53px;
    font-size: 20px;
    color: #c1c1c1;
    user-select: none;
    font-weight: 700;
    transition: all .3s ease;
    cursor: text;
  }
}

a {
  display: none;
}
</style>
