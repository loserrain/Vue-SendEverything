<script setup>
console.log("qwekqwjepeijkkqw");
</script>

<template>
  <div class="container">
    <div class="upload-select">
      <div class="upload-switch">
        <span>Send</span>
        <span>Receive</span>
        <span>Message</span>
      </div>
      <div class="upload-container">
        <div class="upload-send">
          <font-awesome-icon icon="file-arrow-up" class="upload-font" />
          <p><span>Click to Upload </span> or drag and frop</p>
          <p class="upload-send-maxfile">(Max. File size: 25 MB)</p>
        </div>

        <div class="upload-file">
          <div class="upload-set">
            <div>
              <font-awesome-icon icon="file-lines" />
            </div>
            <div>
              <p>HannahBusing_Resume.pdf</p>
              <p>200 KB</p>
            </div>
            <div>
              <font-awesome-icon icon="trash-can" />
            </div>
          </div>
          <div class="upload-progress">
            <span class="upload-progress-line"></span>40%
          </div>
        </div>

        <div class="upload-file">
          <div class="upload-set">
            <div>
              <font-awesome-icon icon="file-lines" />
            </div>
            <div>
              <p>HannahBusing_Resume.pdf</p>
              <p>200 KB</p>
            </div>
            <div>
              <font-awesome-icon icon="trash-can" />
            </div>
          </div>
          <div class="upload-progress">
            <span class="upload-progress-line"></span>40%
          </div>
        </div>

        <div class="upload-file">
          <div class="upload-set">
            <div>
              <font-awesome-icon icon="file-lines" />
            </div>
            <div>
              <p>HannahBusing_Resume.pdf</p>
              <p>200 KB</p>
            </div>
            <div>
              <font-awesome-icon icon="trash-can" />
            </div>
          </div>
          <div class="upload-progress">
            <span class="upload-progress-line"></span>40%
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import "../assets/styles/layout/upload";
</style>
