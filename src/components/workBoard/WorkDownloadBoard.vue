<script setup>
import { ref, computed, onMounted, watch } from "vue";
import API_URL from "../../services/API_URL";
import WorkDeleteBoard from "./WorkDeleteBoard.vue";
import BoardService from "../boardUploadService/BoardRoom";
import { useAuthStore } from "../../stores/auth.module";

const emits = defineEmits(["sendDownloadStatus"]);
function handleSendDownloadStatus(newStatus) {
  emits("sendDownloadStatus", newStatus);
}
const props = defineProps(["roomCode"]);

const authStore = useAuthStore();

const currentUser = computed(() => {
  return authStore.dataStatus.user;
});

// check檔案下載
const roomChecked = ref([]);

const roomDownloadCode = computed(() => {
  const downloadCodes = [];
  roomChecked.value.forEach((checked, index) => {
    if (checked) {
      downloadCodes.push(roomDataDBFiles.value[index].verificationCode);
    }
  });
  return downloadCodes;
});

function handleRoomCheckboxToggle(index) {
  roomChecked.value[index] = !roomChecked.value[index];
}

const ckRoomIcon = computed(() => {
  return roomChecked.value.map((checked) =>
    checked ? ["far", "square-check"] : ["far", "square"]
  );
});

function selectAllRooms() {
  const allChecked = roomChecked.value.every((checked) => checked);
  for (let i = 0; i < roomChecked.value.length; i++) {
    roomChecked.value[i] = !allChecked;
  }
}
// check檔案下載

const fileEditStatus = ref(false);
function togglefileEditStatus() {
  fileEditStatus.value = !fileEditStatus.value;
  for (let i = 0; i < roomChecked.value.length; i++) {
    roomChecked.value[i] = false;
  }
}

function handleDownloadFile() {
  for (let i = 0; i < roomDownloadCode.value.length; i++) {
    setTimeout(() => {
      downloadFile(roomDownloadCode.value[i]);
    }, 300 * (i + 1));
  }
}

async function downloadFile(code) {
  const url = API_URL + "/downloadRoomFileByCode/" + code;
  const a = document.createElement("a");
  a.href = url;
  a.download = "";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// 轉換檔案大小單位
function formatFileSize(fileSize) {
  let units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let unitIndex = 0;

  while (fileSize >= 1024 && unitIndex < units.length - 1) {
    fileSize /= 1024;
    unitIndex++;
  }

  return `${fileSize.toFixed(2)} ${units[unitIndex]}`;
}

// download
const roomDataDBFiles = ref([]);
const roomDataDBFilesStatus = ref(false);
function handleRoomDataDBFiles(dataFilesLength) {
  for (let i = 0; i < dataFilesLength; i++) {
    // 驗證檔案大小是否為數字
    if (Number(roomDataDBFiles.value[i].fileSize)) {
      roomDataDBFiles.value[i].fileSize = formatFileSize(
        roomDataDBFiles.value[i].fileSize
      );
    } else {
      return;
    }
  }
}

const deleteStatus = ref(false);
function handleSendDeleteStatus(newStatus) {
  deleteStatus.value = newStatus;
}

function showRoomFile(roomCode) {
  BoardService.showRoomContent(roomCode)
    .then((response) => {
      roomDataDBFiles.value = response.data.dbRoomFiles;
      roomDataDBFilesStatus.value = true;
      handleRoomDataDBFiles(roomDataDBFiles.value.length);
      for (let i = 0; i < roomDataDBFiles.value.length; i++) {
        roomChecked.value[i] = false;
        roomDataDBFiles.value[i].timestamp = new Date(
          roomDataDBFiles.value[i].timestamp
        ).toLocaleString();
      }
      fileEditStatus.value = true;
    })
    .catch((error) => {
      console.log(error);
    });
}

onMounted(() => {
  showRoomFile(props.roomCode);
});

watch()

watch(deleteStatus, (newStatus) => {
  if (!newStatus) {
    showRoomFile(props.roomCode);
  }
});

</script>

<template>
  <div v-if="deleteStatus">
    <WorkDeleteBoard
      @send-delete-status="handleSendDeleteStatus"
      :room-download-code="roomDownloadCode"
    ></WorkDeleteBoard>
  </div>
  <a class="downloadLink" ref="downloadLink"></a>
  <div class="download-board-mask" @click="handleSendDownloadStatus(false)">
    <div class="download-board-user-list" @click.stop>
      <h2>Current User : {{ currentUser.username }}</h2>
      <div class="download-board-mark">
        <h4 @click="togglefileEditStatus()">編輯</h4>
        <h3>檔案 / 記錄</h3>
      </div>
      <div class="download-board-file">
        <div class="download-board-file-title">
          <p class="download-board-file-check">
            <span v-show="fileEditStatus" @click="selectAllRooms()"
              ><font-awesome-icon :icon="['far', 'square']"
            /></span>
          </p>
          <div class="download-board-file-detail">
            <p class="download-board-file-name">檔案名稱</p>
            <p class="download-board-file-date">檔案上傳日期</p>
            <p class="download-board-file-ID">上傳身分</p>
            <p class="download-board-file-size">檔案大小</p>
          </div>
        </div>
        <div class="download-board-file-line"></div>
        <div v-if="roomDataDBFilesStatus">
          <div
            class="download-board-file-title"
            v-for="(fileList, index) in roomDataDBFiles"
            :key="index"
          >
            <p class="download-board-file-check">
              <label :for="'checkbox' + index" v-show="fileEditStatus">
                <input
                  type="checkbox"
                  :id="'checkbox' + index"
                  :checked="roomChecked[index]"
                  @change="handleRoomCheckboxToggle(index)"
                />
                <span><font-awesome-icon :icon="ckRoomIcon[index]" /></span>
              </label>
            </p>
            <div
              class="download-board-file-detail"
              @click="handleRoomCheckboxToggle(index)"
            >
              <p class="download-board-file-name">{{ fileList.fileName }}</p>
              <p class="download-board-file-date">{{ fileList.timestamp }}</p>
              <p class="download-board-file-ID">{{ fileList.uploaderName }}</p>
              <p class="download-board-file-size">{{ fileList.fileSize }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="download-board-decide" v-show="fileEditStatus">
        <button class="download-board-download" @click="handleDownloadFile()">
          Download
        </button>
        <button
          class="download-board-delete"
          @click="handleSendDeleteStatus(true)"
        >
          Delete
        </button>
        <button class="download-board-cancel" @click="togglefileEditStatus()">
          Cancel
        </button>
      </div>

      <span @click="handleSendDownloadStatus(false)"
        ><font-awesome-icon icon="xmark"
      /></span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.downloadLink {
  display: none;
}
.download-board-mask {
  position: fixed;
  left: 0px;
  top: 0px;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.65);
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
}

.download-board-user-list {
  width: 990px;
  height: 570px;
  border: 6px solid #cec8c8;
  border-radius: 7px;
  background-color: #fafafa;
  position: relative;
  padding: 2rem 1.5rem;

  h2 {
    font-size: 20px;
    font-weight: bold;
    color: #1e3050;
  }

  .download-board-mark {
    display: flex;
    justify-content: right;
    align-items: center;
    margin: 0 1rem 8px 0;
  }

  h3 {
    font-size: 18px;
    font-weight: bold;
    color: #615f5f;
    user-select: none;
  }

  h4 {
    font-size: 18px;
    font-weight: bold;
    color: #615f5f;
    background-color: #d9d9d9;
    border-radius: 8px;
    padding: 4px 12px;
    margin-right: 1rem;
    cursor: pointer;
  }

  .download-board-file {
    margin: 0 auto;
    padding: 1.5rem 1.5rem 0;
    width: 900px;
    height: 415px;
    background-color: #eaeaea;
    overflow: auto;

    .download-board-file-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 0 3rem 3px 0;
      font-size: 16px;
      font-weight: bold;
      color: #1e3050;

      span {
        cursor: pointer;
      }

      p {
        font-weight: bold;
      }

      .download-board-file-check {
        width: 14px;
        input[type="checkbox"] {
          display: none;
        }
      }

      .download-board-file-detail {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        text-align: center;
        user-select: none;

        .download-board-file-name {
          width: 310px;
          margin-left: 10px;
          user-select: none;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
          word-break: break-all;
          overflow: hidden;
        }

        .download-board-file-date {
          width: 210px;
        }

        .download-board-file-ID {
          width: 115px;
        }

        .download-board-file-size {
          width: 110px;
        }
      }
    }

    .download-board-file-line {
      border-top: 2px solid #000000;
      margin-bottom: 6px;
    }
  }

  .download-board-decide {
    display: flex;
    justify-content: right;
    align-items: center;

    button {
      margin-top: 9px;
      padding: 6px 10px;
      font-size: 16px;
      font-weight: bold;
      color: #ffffff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }

    .download-board-download {
      margin-right: 1rem;
      background-color: #3497de;
    }

    .download-board-delete {
      margin-right: 1rem;
      background-color: #f95252;
    }

    .download-board-cancel {
      margin-right: 2rem;
      background-color: #808080;
    }
  }

  > span {
    position: absolute;
    top: 10px;
    right: 16px;
    font-size: 22px;
    color: #767676;
    cursor: pointer;
  }
}
</style>
