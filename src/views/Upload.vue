<script setup>
import { ref } from "vue";
import UploadFiles from "../components/upload/UploadFiles.vue"
const tabs = ref(["Send", "Receive", "Message"]);

</script>

<template>
  <div class="container">
    <div class="upload-select">
      <div class="upload-switch">
        <button v-for="tab in tabs">
          {{ tab }}
        </button>
      </div>
      <UploadFiles />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "../assets/styles/layout/upload";
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
