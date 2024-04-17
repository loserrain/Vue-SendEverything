<script setup>
import { ref, computed, onMounted } from "vue";
import CreateBoard from "./CreateBoard.vue";
import UploadBoard from "./UploadBoard.vue";
import DeleteBoard from "./DeleteBoard.vue";
import { useRouter } from "vue-router";
import BoardUploadService from "../boardUploadService/BoardRoom.js";
import API_URL from "../../services/API_URL";

const router = useRouter();
const roomLoadingCode = 8;

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

  // 對 roomData.dbRoomFiles 根據 timestamp 進行排序
  roomData.value.dbRoomFiles.sort((a, b) => {
    // 將時間戳字串轉換為 Date 物件進行比較
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    return dateB - dateA;
  });

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
const roomDataFileStatus = ref(false);
const roomDataNumber = computed(() => {
  if (roomDataFileLength.value < 8) {
    return roomDataFileLength.value;
  } else {
    return 8;
  }
});
const roomDataPage = ref(1);
const roomDataPageLength = ref([]);
const roomActiveTab = ref(1);
const roomDataIsOwner = ref(false);

onMounted(() => {
  setTimeout(() => {
    BoardUploadService.showRoomContent(roomCode).then((response) => {
      roomDataStatus.value = false;
      roomData.value = response.data;
      roomDataIsOwner.value = roomData.value.isRoomOwner;

      // 判斷是否有檔案
      if (roomData.value.dbRoomFiles.length > 0) {
        roomDataFileStatus.value = true;
        sidebarStatus.value = true;
      }

      roomDataFileLength.value = roomData.value.dbRoomFiles.length;
      handleRoomData(roomDataFileLength.value);
      updataPageNumber();
      for (let i = 0; i < roomData.value.dbRoomFiles.length; i++) {
        roomChecked.value.push(false);
      }
    });
  }, 1000);
});

const totalSize = ref(0);
const reader = ref(null);
const chunks = ref([]);
const loadedSize = ref(0);
const filename = ref("example.txt");

function handleDownloadFile() {
  for (let i = 0; i < roomDownloadCode.value.length; i++) {
    console.log(roomDownloadCode.value[i]);
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
  console.log(chunks.value);
  return read();
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

// function downloadFile(code) {
//   // uploadStatus.value = true;
//   const url = API_URL + "/downloadRoomFileByCode/" + code;
//   // const url = `/api/auth/downloadRoomFileByCode/${code}`;
//   fetch(url)
//     .then((response) => {
//       console.log(response.headers.get("Content-Disposition"));
//       // uploadStatus.value = false;
//       code = "";
//       // progressStatus.value = false;
//       const contentDisposition = response.headers.get("Content-Disposition");
//       if (contentDisposition) {
//         const filenameMatch = contentDisposition.match(
//           /filename\*?=['"]?(?:UTF-8'')?([^'";]+)['"]?/i
//         );
//         if (filenameMatch && filenameMatch[1]) {
//           filename.value = decodeURIComponent(filenameMatch[1]);
//         }
//       }

//       return readStream(response);
//     })
//     .then((blob) => {
//       const downloadUrl = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = downloadUrl;
//       a.download = filename.value;
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       URL.revokeObjectURL(downloadUrl);
//       // progressStatus.value = true;
//       loadedSize.value = 0;
//       chunks.value = [];
//     })
//     .catch((error) => {
//       console.error("下載過程中發生錯誤:", error);
//       chunks.value = [];
//       // uploadStatus.value = false;
//     });
// }

function updataPageNumber() {
  roomDataPage.value = Math.ceil(
    roomDataFileLength.value / roomDataNumber.value,
    0
  );
  for (let i = 0; i < roomDataNumber.value; i++) {
    roomDataPageLength.value.push(i);
  }
}

function clickPageNumber(page) {
  const startIndex = (page - 1) * roomDataNumber.value;
  let endIndex = page * roomDataNumber.value - 1;
  endIndex = Math.min(endIndex, roomDataFileLength.value - 1);

  roomDataPageLength.value = [];
  for (let i = startIndex; i <= endIndex; i++) {
    roomDataPageLength.value.push(i);
  }
  roomActiveTab.value = page;
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
        <div v-if="roomDataIsOwner">
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
    </div>

    <div class="room-board-content">
      <pre>佈告欄 / 房間</pre>

      <div class="room-board-data" v-if="roomDataStatus">
        <p class="room-board-data-line"></p>
        <div class="room-board-loading-img"></div>
        <div class="room-board-data-text room-board-loading-text">
          <h1><i class="flash-across"></i></h1>
          <div class="room-board-data-description">
            <h2><i class="flash-across"></i></h2>
            <h2 class="loading-text600"><i class="flash-across"></i></h2>
            <h2 class="loading-text800"><i class="flash-across"></i></h2>
          </div>
          <div class="room-board-data-date room-board-loading-date">
            <p><i class="flash-across"></i></p>
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
          <div class="room-board-data-description">
            <h2>{{ roomData.roomResponse.description }}</h2>
          </div>
          <div class="room-board-data-date">
            <p>Created: {{ roomData.roomResponse.createTime }}</p>
            <p>20 people</p>
          </div>
          <p>{{ $route.params.roomCode }}</p>
        </div>
      </div>

      <div class="room-board-fileList">
        <div class="room-board-fileTitle">
          <div class="room-board-pageNumber" v-if="roomDataFileStatus">
            <span>Page -</span>
            <p
              v-for="page in roomDataPage"
              @click="clickPageNumber(page)"
              :class="[{ 'room-board-pageNumber-now': roomActiveTab === page }]"
            >
              {{ page }}
            </p>
          </div>
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

        <div class="room-board-file" v-if="roomDataStatus">
          <div
            class="room-board-main-room"
            v-for="(roomFile, index) in roomLoadingCode"
            :key="index"
          >
            <div class="room-board-main-room-number">
              <span><font-awesome-icon :icon="['far', 'file']" /></span>
              <div class="room-board-main-loading-text">
                <p><i class="flash-across"></i></p>
                <p><i class="flash-across"></i></p>
              </div>
            </div>
            <div
              class="room-board-main-room-description room-board-main-loading-description"
            >
              <p><i class="flash-across"></i></p>
              <p class="loading-text-210"><i class="flash-across"></i></p>
              <p class="loading-text-260"><i class="flash-across"></i></p>
              <!-- <p></p> -->
            </div>
            <p class="room-board-main-room-date room-board-main-loading-date">
              <i class="flash-across"></i>
            </p>
          </div>
        </div>

        <!--  -->

        <div v-else>
          <div class="room-board-file" v-if="roomDataFileStatus">
            <div
              class="room-board-main-room"
              v-for="(roomFile, index) in roomDataPageLength"
              :key="index"
            >
              <p class="room-board-main-room-check" v-if="sidebarStatus">
                <label :for="'checkbox' + roomFile">
                  <input
                    type="checkbox"
                    :id="'checkbox' + roomFile"
                    :checked="roomChecked[roomFile]"
                    @change="handleRoomCheckboxToggle(roomFile)"
                  />
                  <span
                    ><font-awesome-icon :icon="ckRoomIcon[roomFile]"
                  /></span>
                </label>
              </p>
              <div class="room-board-main-room-number">
                <span><font-awesome-icon :icon="['far', 'file']" /></span>
                <div>
                  <p>{{ roomData.dbRoomFiles[roomFile].fileName }}</p>
                  <p>{{ roomDataFileSize[roomFile] }}</p>
                </div>
              </div>
              <div class="room-board-main-room-description">
                <p>
                  {{ roomData.dbRoomFiles[roomFile].description }}
                </p>
              </div>
              <p class="room-board-main-room-date">
                {{ roomData.dbRoomFiles[roomFile].timestamp }}
              </p>
            </div>
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
  font-size: 22px;
  padding-top: 2px;
  color: #767676;
  cursor: pointer;

  span {
    padding: 3px 5px 2px;
    border-radius: 5px;
    transition: all 0.2s;

    &:hover {
      background-color: rgba(114, 114, 118, 0.174);
    }
  }

  label {
    cursor: pointer;
  }

  input[type="checkbox"] {
    display: none;
  }
}
</style>
