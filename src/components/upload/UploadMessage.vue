<template>
<div class="upload-container">
    <div class="upload-send">
      <label for="fileInput" class="upload-fileinput">
        <font-awesome-icon icon="folder-plus" class="upload-font" />
        <input type="file" id="fileInput" ref="file"/>
      </label>
      <div class="upload-send-file-noselect">I am Message.</div>
      <p>
        <!-- <button @click="upload" :disabled="!selectedFiles">
          Click to Upload
        </button> -->
      </p>
      <p class="upload-send-maxfile">(Max. File size: 25 MB)</p>
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
</style>