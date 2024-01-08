<script setup>
import axios from "axios";
import { ref, watchEffect } from "vue";

const code = ref("");
const isComplete = ref(false);
const downloadLink = ref(null);

watchEffect(() => {
  isComplete.value = code.value.length === 6;
});

const downloadCode = async () => {
  try {
    if (isComplete.value) {
      const url = `http://localhost:8080/api/auth/downloadFileByCode/${code.value}`;
      const response = await axios.get(url, {responseType: 'blob'});
      window.location.href = response.request.responseURL;
    }
  } catch (error) {
    console.log("Error downloading file:", error);
  }
};
</script>

<template>
  <div class="upload-receive-container">
    <div class="upload-send">
      <div class="upload-code-box">
        <input type="text" v-model="code" />
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
  </div>
</template>

<style lang="scss" scoped>
@import "../../assets/styles/layout/upload";
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upload-receive-container{
  margin: 20px 15px 0;
}

.upload-send {
  height: 150px;
  margin: 10px 0 0 0;
}

.upload-code-box {
  input {
    background-color: #dbdbdb44;
    border: 2px solid $primary-text-gray-100;
    border-radius: 5px;
    margin: 30px 0 20px;
    padding: 10px 10px;
    font-size: 20px;
    &:focus-visible {
      outline: none;
    }
  }
}

a{
  display: none;
}
</style>
