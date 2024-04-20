<script setup>
import { ref } from "vue";
import API_URL from "../../services/API_URL";
import BoardUploadService from "../boardUploadService/BoardRoom.js";

const emits = defineEmits(["sendDeleteStatus"]);
function handleSendDeleteStatus(newStatus) {
  emits("sendDeleteStatus", newStatus);
}

const props = defineProps({ roomDownloadCode: Array });
const deleteStatus = ref(false);

async function deleteFiles() {
  deleteStatus.value = true;
  for (let i = 0; i < props.roomDownloadCode.length; i++) {
    await BoardUploadService.cleanUpRoomFileByCode(props.roomDownloadCode[i])
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }
  deleteStatus.value = false;
  setTimeout(() => {
    handleSendDeleteStatus(false);
  }, 1000);
}
</script>

<template>
  <div class="delete-board-mask">
    <div class="delete-board" @click.stop>
      <p><font-awesome-icon icon="trash-can" /></p>
      <h2>Delete File</h2>
      <h3>Are you sure you want to delete this file?</h3>
      <h3>This action cannot be undone.</h3>
      <div class="delete-board-decide">
        <button
          class="delete-board-cancel"
          @click="handleSendDeleteStatus(false)"
        >
          Cancel
        </button>
        <button class="delete-board-confirm" @click="deleteFiles()">
          <span v-if="!deleteStatus"> Delete </span>
          <div class="loader" v-else></div>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "../../assets/styles/layout/board/deleteBoard";

.loader {
  margin-top: 0px;
  border: 3px solid #f3f3f3;
  border-radius: 50%;
  border-top: 3px solid #1e1d1e;
  width: 20px;
  height: 20px;
  margin-left: 43%;
  animation: spin 1.5s linear infinite;
}

.drop-active {
  background-color: #d9f7c3;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
