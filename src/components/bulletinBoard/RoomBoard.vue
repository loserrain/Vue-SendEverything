<script setup>
import { ref, computed, onMounted } from "vue";
import CreateBoard from "./CreateBoard.vue";
import UploadBoard from "./UploadBoard.vue";
import DeleteBoard from "./DeleteBoard.vue";
import { useRouter } from "vue-router";
import BoardUploadService from "../boardUploadService/BoardRoom.js";

const router = useRouter();

const createStatus = ref(false);
function handleSendCreateStatus(newStatus) {
  createStatus.value = newStatus;
}

const uploadStatus = ref(false);
function handleSendUploadStatus(newStatus) {
  uploadStatus.value = newStatus;
}

const deleteStatus = ref(false);
function handleSendDeleteStatus(newStatus) {
  deleteStatus.value = newStatus;
}

// check檔案下載
const roomChecked = ref([]);

const roomDownloadCode = computed(() => {
  const downloadCodes = [];
  roomChecked.value.forEach((checked, index) => {
    if (checked) {
      downloadCodes.push(roomData.value.dbRoomFiles[index].verificationCode);
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
// check檔案下載

const sidebarStatus = ref(false);
function toggleSidebarStatus() {
  sidebarStatus.value = !sidebarStatus.value;
  for (let i = 0; i < roomChecked.value.length; i++) {
    roomChecked.value[i] = false;
  }
}

function selectAllRooms() {
  const allChecked = roomChecked.value.every((checked) => checked);
  for (let i = 0; i < roomChecked.value.length; i++) {
    roomChecked.value[i] = !allChecked;
  }
}

function handleRoomData(length) {
  roomData.value.roomResponse.createTime = new Date(
    roomData.value.roomResponse.createTime
  ).toLocaleString();

  for (let i = 0; i < length; i++) {
    roomData.value.dbRoomFiles[i].timestamp = new Date(
      roomData.value.dbRoomFiles[i].timestamp
    ).toLocaleString();
    let formattedSize = formatFileSize(roomData.value.dbRoomFiles[i].fileSize);
    roomDataFileSize.value.push(
      `${formattedSize.sizeValue}  ${formattedSize.sizeUnit}`
    );
  }
}

function formatFileSize(fileSize) {
  const KB = 1024;
  const MB = KB * 1024;
  const GB = MB * 1024;

  let sizeUnit;
  let sizeValue;

  if (fileSize < KB) {
    sizeValue = fileSize;
    sizeUnit = "B";
  } else if (fileSize < MB) {
    sizeValue = (fileSize / KB).toFixed(0);
    sizeUnit = "KB";
  } else if (fileSize < GB) {
    sizeValue = (fileSize / MB).toFixed(2);
    sizeUnit = "MB";
  } else {
    sizeValue = (fileSize / GB).toFixed(2);
    sizeUnit = "GB";
  }

  return { sizeValue, sizeUnit };
}

const roomCode = router.currentRoute.value.params.roomCode;
const roomData = ref(undefined);
const roomDataStatus = ref(true);
const roomDataFileLength = ref(undefined);
const roomDataFileSize = ref([]);

onMounted(() => {
  BoardUploadService.showRoomContent(roomCode).then((response) => {
    roomData.value = response.data;
    roomDataFileLength.value = roomData.value.dbRoomFiles.length;
    handleRoomData(roomDataFileLength.value);
    roomDataStatus.value = false;
    for (let i = 0; i < roomData.value.dbRoomFiles.length; i++) {
      roomChecked.value.push(false);
    }
  });
});

const totalSize = ref(0);
const reader = ref(null);
const chunks = ref([]);
const loadedSize = ref(0);
const filename = ref("example.txt");

function handleDownloadFile() {
  for(let i = 0; i < roomDownloadCode.value.length; i++) {
    console.log(roomDownloadCode.value[i])
    setTimeout(() => {
      downloadFile(roomDownloadCode.value[i]);
    }, 300 * (i + 1));
  }
}

function readStream(response) {
  totalSize.value = response.headers.get("Content-Length") || "未知大小";
  reader.value = response.body.getReader();
  console.log(totalSize.value);

  const read = () => {
    return reader.value.read().then(({ done, value }) => {
      if (done) {
        return new Blob(chunks.value);
      }
      loadedSize.value += value.length;
      // progress.value = ((loadedSize.value / totalSize.value) * 100).toFixed(0);
      chunks.value.push(value);
      return read();
    });
  };
  console.log(chunks.value)
  return read();
}

function downloadFile(code) {
  // uploadStatus.value = true;
  const url = `http://localhost:8080/api/auth/downloadRoomFileByCode/${code}`;
  fetch(url)
    .then((response) => {
      console.log(response.headers.get("Content-Disposition"))
      // uploadStatus.value = false;
      code = "";
      // progressStatus.value = false;
      const contentDisposition = response.headers.get("Content-Disposition");
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename\*?=['"]?(?:UTF-8'')?([^'";]+)['"]?/i
        );
        if (filenameMatch && filenameMatch[1]) {
          filename.value = decodeURIComponent(filenameMatch[1]);
        }
      }

      return readStream(response);
    })
    .then((blob) => {
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename.value;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
      // progressStatus.value = true;
      loadedSize.value = 0;
      chunks.value = [];
    })
    .catch((error) => {
      console.error("下載過程中發生錯誤:", error);
      chunks.value = [];
      // uploadStatus.value = false;
    });
}

</script>

<template>
  <div v-if="createStatus">
    <CreateBoard @send-create-status="handleSendCreateStatus"></CreateBoard>
  </div>
  <div v-if="uploadStatus">
    <UploadBoard
      @send-upload-status="handleSendUploadStatus"
      :roomCode="roomCode"
    ></UploadBoard>
  </div>
  <div v-if="deleteStatus">
    <DeleteBoard @send-delete-status="handleSendDeleteStatus"></DeleteBoard>
  </div>

  <a class="downloadLink" ref="downloadLink"></a>

  <div class="room-board-container">
    <div class="room-board-sidebar">
      <div class="room-board-sidebar-search">
        <p>Room Search</p>
        <div class="room-board-sidebar-input">
          <label for="search"></label>
          <input type="text" id="search" />
          <span>
            <font-awesome-icon icon="fa-solid fa-magnifying-glass" />
          </span>
        </div>
      </div>
      <div class="room-board-sidebar-room-mode">
        <p>Room Mode</p>
        <div
          class="room-board-sidebar-tab"
          :class="sidebarStatus ? 'room-board-sidebar-status' : ''"
          @click="toggleSidebarStatus()"
        >
          <p></p>
          <div><font-awesome-icon :icon="['far', 'circle-down']" /></div>
          <span>Download File</span>
        </div>
        <div
          class="room-board-sidebar-tab"
          @click="handleSendUploadStatus(true)"
        >
          <div><font-awesome-icon icon="arrow-up-from-bracket" /></div>
          <span>Upload File</span>
        </div>
        <div
          class="room-board-sidebar-tab"
          @click="handleSendCreateStatus(true)"
        >
          <div><font-awesome-icon icon="gear" /></div>
          <span>Room Setup</span>
        </div>
      </div>
    </div>

    <div class="room-board-content">
      <pre>佈告欄 / 房間</pre>

      <div class="room-board-data" v-if="roomDataStatus">
        <p class="room-board-data-line"></p>
        <div class="room-board-data-img">
          <img src="../../assets/image/main.png" alt="" />
        </div>
        <div class="room-board-data-text">
          <h1>系統分析與設計</h1>
          <h2>
            這是一個可以一對多傳送檔案的房間，此功能名為One for
            all(暫定)，建立房間的房主可在此進行房間的簡述，使參加者了解房間傳送檔案的目的，使參加者了解房間傳送檔案的目的
          </h2>
          <div class="room-board-data-date">
            <p>Created: 2024年3月7日 下午 08:39</p>
            <p>20 people</p>
          </div>
          <p>{{ $route.params.roomCode }}</p>
        </div>
      </div>

      <div class="room-board-data" v-else>
        <p class="room-board-data-line"></p>
        <div class="room-board-data-img">
          <img
            :src="'data:image/png;base64,' + roomData.roomResponse.image"
            alt=""
          />
        </div>
        <div class="room-board-data-text">
          <h1>{{ roomData.roomResponse.title }}</h1>
          <h2>
            {{ roomData.roomResponse.description }}
          </h2>
          <div class="room-board-data-date">
            <p>{{ roomData.roomResponse.createTime }}</p>
            <p>20 people</p>
          </div>
          <p>{{ $route.params.roomCode }}</p>
        </div>
      </div>

      <div class="room-board-fileList">
        <div class="room-board-fileTitle">
          <p>
            <span><font-awesome-icon :icon="['far', 'folder-open']" /></span>
            檔案
          </p>
          <div v-if="sidebarStatus">
            <button @click="handleDownloadFile()">下載</button>
            <button
              class="room-board-delete"
              @click="handleSendDeleteStatus(true)"
            >
              刪除
            </button>
            <button @click="selectAllRooms()">全選</button>
            <button @click="toggleSidebarStatus()">取消</button>
          </div>
        </div>

        <div class="room-board-file">
          <div
            class="room-board-main-room"
            v-for="(roomFile, index) in roomDataFileLength"
            :key="index"
          >
            <p class="room-board-main-room-check" v-if="sidebarStatus">
              <label :for="'checkbox' + index">
                <input
                  type="checkbox"
                  :id="'checkbox' + index"
                  :checked="roomChecked[index]"
                  @change="handleRoomCheckboxToggle(index)"
                />
                <span><font-awesome-icon :icon="ckRoomIcon[index]" /></span>
              </label>
            </p>
            <div class="room-board-main-room-number">
              <span><font-awesome-icon :icon="['far', 'file']" /></span>
              <div>
                <p>{{ roomData.dbRoomFiles[index].fileName }}</p>
                <p>{{ roomDataFileSize[index] }}</p>
              </div>
            </div>
            <p class="room-board-main-room-description">
              {{ roomData.dbRoomFiles[index].description }}
            </p>
            <p class="room-board-main-room-date">
              {{ roomData.dbRoomFiles[index].timestamp }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "../../assets/styles/layout/board/roomBoard";

.downloadLink {
  display: none;
}

.room-board-main-room-check {
  position: absolute;
  top: 6px;
  right: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  font-size: 22px;
  padding-top: 2px;
  color: #767676;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background-color: rgba(114, 114, 118, 0.174);
    border-radius: 6px;
  }

  label {
    cursor: pointer;
  }

  input[type="checkbox"] {
    display: none;
  }
}
</style>
