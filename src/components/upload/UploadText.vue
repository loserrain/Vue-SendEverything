<script setup>
import axios from "axios";
import { ref, watchEffect, defineEmits, nextTick } from "vue";

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

// const emits = defineEmits(['emailCode']);
// const verificationCodes = ref(['', '', '', '', '', '']);

// const handleInput = (index, event) => {
//   const value = event.target.value;
//   verificationCodes.value[index] = value;

//   // 判断是否输入完成
//   if (verificationCodes.value.join('').length === 6) {
//     emits('emailCode', verificationCodes.value.join(''));
//   }

//   // 自动跳到下一个输入框
//   if (value && index < verificationCodes.value.length - 1) {
//     const nextInput = event.target.nextElementSibling;
//     if (nextInput) {
//       nextTick(() => {
//         nextInput.focus();
//       });
//     }
//   }
// };
// const handleKeyDown = (index, event) => {
//   // 处理删除操作
//   if (event.key === 'Backspace' && !event.target.value && index > 0) {
//     const prevInput = event.target.previousElementSibling;
//     if (prevInput) {
//       nextTick(() => {
//         prevInput.focus();
//       });
//     }
//   }
// };
</script>

<template>
  <div class="upload-file-container">
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

.upload-send {
  height: 200px;
  margin: 215px 0 0 0;
}

.upload-code-box {
  input {
    background-color: #dbdbdb44;
    border: 2px solid $primary-text-gray-100;
    border-radius: 5px;
    margin: 70px 0 20px;
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
