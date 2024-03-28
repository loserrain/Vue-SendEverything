<script setup>
import { ref, watchEffect, computed, watch } from "vue";

const emits = defineEmits(["sendCreateStatus"]);

const inputTitle = ref("");
const inputDescription = ref("");
const inputPwd = ref("");

function handleSendCreateStatus(newStatus) {
  emits("sendCreateStatus", newStatus);
  inputTitle.value = "";
  inputDescription.value = "";
  inputPwd.value = "";
}

function handleCreate(room) {
  console.log("Room Data: ", room);
}

const isPublicChecked = ref(false);
const isPrivateChecked = ref(false);

const ckPublicIcon = computed(() => {
  return isPublicChecked.value ? ["far", "square-check"] : ["far", "square"];
});

const ckPrivateIcon = computed(() => {
  return isPrivateChecked.value ? ["far", "square-check"] : ["far", "square"];
});

watch(isPublicChecked, (newValue) => {
  if (newValue) {
    isPrivateChecked.value = false;
  }
});

watch(isPrivateChecked, (newValue) => {
  if (newValue) {
    isPublicChecked.value = false;
  }
});

// 檔案預覽
const file = ref(undefined);
const previewImage = ref(null);
const previewStatus = ref(false);
function selectFile() {
  console.log(file.value.files[0]);
  handlePreviewImg(file.value.files);
}
function handlePreviewImg (file) {
  const reader = new FileReader();
  const selectFileSize = file[0].size / 1024 / 1024;
  if (selectFileSize < 20) {
    reader.readAsDataURL(file[0]);
  }
  reader.onload = () => {
    previewImage.value = reader.result;
  };
  previewStatus.value = true;
}
</script>

<template>
  <div class="create-board-mask" @click="handleSendCreateStatus(false)">
    <div class="create-board" @click.stop>
      <p>ROOM SETUP</p>
      <div class="create-board-line"></div>
      <div class="create-board-form">
        <form @submit="handleCreate">
          <div class="create-board-title">
            <p>Title</p>
            <label for="title"></label>
            <input type="text" name="title" id="title" v-model="inputTitle" />
          </div>

          <div class="create-board-description">
            <p>Room description</p>
            <label for="description"></label>
            <textarea
              name="description"
              id="description"
              cols="41"
              rows="3"
              v-model="inputDescription"
            ></textarea>
          </div>

          <p>Password setting</p>
          <div class="create-board-pwd">
            <label for="pwd"></label>
            <input type="password" name="pwd" id="pwd" v-model="inputPwd" />
          </div>
        </form>

        <div class="create-board-Select">
          <div class="create-board-img">
            <img v-if="previewStatus" :src="previewImage" alt="">
            <p v-else>File Preview</p>
          </div>
          <div class="create-board-file">
            <label type="button" for="fileInput"> Select File </label>
            <input type="file" name="fileInput" id="fileInput" ref="file" @change="selectFile" />
          </div>
        </div>
      </div>

      <div class="create-board-decide">
        <button class="create-board-cancel" @click="handleSendCreateStatus(false)">Cancel</button>
        <button class="create-board-confirm">Confirm</button>
      </div>
      <span @click="handleSendCreateStatus(false)"><font-awesome-icon icon="xmark" /></span>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "../../assets/styles/layout/board/createBoard";
</style>
