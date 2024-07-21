<script setup>
import { ref, watchEffect } from "vue";
import { useUploadInfo } from "../../stores/upload";
import UploadService from "../../services/FilesService";

const uploadInfo = useUploadInfo();

const textInput = ref("");

function uploadMessage() {
  UploadService.uploadMessage(textInput.value)
    .then((response) => {
      uploadInfo.setTextReceiveStatus(true);
      uploadInfo.setTextReceiveCode(response.data.verificationCode);
    })
    .catch((e) => {
      console.log(e);
    });
}

const receiveMessage = ref("");

watchEffect(() => {
  if (uploadInfo.textReceiveResult === "") {
    receiveMessage.value = "No message received.";
  } else {
    receiveMessage.value = uploadInfo.textReceiveResult;
  }
});

// 複製訊息
const copyMessage = () => {
  const blob = new Blob([receiveMessage.value], { type: "text/plain" });
  const clipboardItem = new ClipboardItem({ "text/plain": blob });
  navigator.clipboard.write([clipboardItem]);
};
</script>

<template>
  <div class="upload-file-container">
    <div class="upload-send">
      <p class="p">Upload.</p>
      <textarea
        v-model="textInput"
        name="message"
        id="message"
        cols="45"
        rows="12"
        placeholder="please input your message."
        class="upload-send-message"
      ></textarea>
      <button @click="uploadMessage">CLick to Upload</button>
    </div>
    <div class="upload-send">
      <p class="p">Receive Message.</p>
      <div class="upload-send-copy" @click="copyMessage">
        <font-awesome-icon :icon="['far', 'copy']" />
      </div>
      <textarea
        class="upload-send-receiveMessage"
        @click="copyMessage"
        cols="42"
        rows="13"
        readonly
        >{{ receiveMessage }}
      </textarea>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "../../assets/styles/layout/upload";

.upload-send-copy {
  position: absolute;
  top: 0.8rem;
  right: 2.5rem;
  font-size: 22px;
  color: #5380f0;
  transition: all 0.1s;
  cursor: pointer;

  &:hover {
    color: #1d58ee;
  }

  &:active {
    scale: 0.8;
  }
}

.upload-file-container {
  > div {
    margin-bottom: 15px;
  }
}

.upload-send {
  position: relative;
  margin-top: 20px;
  height: 300px;

  .upload-send-message {
    margin-top: 10px;
    padding: 7px 10px 5px;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-shadow: 4px 5px 5px rgba(0, 0, 0, 0.135);
    background-color: #021729dc;
    color: #f5f5dc;
    letter-spacing: 1px;
    resize: none;

    &:focus-visible {
      outline: none;
    }

    &::placeholder {
      color: #cccccc;
    }
  }

  button {
    margin-top: 4px;
    padding: 7px 11px 6px;
  }

  p {
    // 設定margin-top的話，此距會根據父元素的邊距進行設定
    padding-top: 10px;
    font-size: 20px;
    font-weight: 700;
    color: #011222c3;
  }
}

.upload-send-receiveMessage {
  margin-top: 10px;
  padding: 7px 10px 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 2px 3px 5px rgba(0, 0, 0, 0.135);
  background-color: #e9f2ff;
  font-size: 14px;
  color: #61615f;
  letter-spacing: 1px;
  resize: none;
  cursor: pointer;

  &:focus-visible {
    outline: none;
  }

  &::placeholder {
    color: #cccccc;
    font-weight: 700;
  }
}
</style>
