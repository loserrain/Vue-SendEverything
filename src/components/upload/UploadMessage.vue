<script setup>
import { ref, watchEffect } from "vue";

const textInput = ref("");

watchEffect(() => {
  console.log('Uploading data to Spring:', textInput.value)
});


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
        rows="11"
        placeholder="please input your message."
      ></textarea>
      <button>CLick to Upload</button>
    </div>
    <div class="upload-send">
      <p class="p">Message.</p>
      <textarea
        v-model="textInput"
        name="message"
        id="message"
        cols="45"
        rows="15"
      ></textarea>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "../../assets/styles/layout/upload";

.upload-file-container {

  > div {
    margin-bottom: 15px;
  }
}

.upload-send {
  margin-top: 20px;
  height: 300px;

  textarea {
    margin-top: 10px;
    padding: 7px 10px 5px;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-shadow: 4px 5px 5px rgba(0, 0, 0, 0.135);
    background-color: #011222e2;
    color: beige;
    letter-spacing: 1px;
    resize: none;

    &:focus-visible {
      outline: none;
    }

    &::placeholder {
      color: #b8b8b8;
      font-weight: 700;
    }
  }

  button {
    margin-top: 10px;
    padding: 7px 11px 6px;
  }

  p{
    // 設定margin-top的話，此距會根據父元素的邊距進行設定
    padding-top: 10px;
    font-size: 20px;
    font-weight: 700;
    color: #011222c3;
  }
}
</style>
