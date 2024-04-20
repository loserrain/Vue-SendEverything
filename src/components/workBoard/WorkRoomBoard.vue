<script setup>
import { ref, computed, onMounted, watch } from "vue";
import WorkCreateBoard from "./WorkCreateBoard.vue";
import WorkUploadBoard from "./WorkUploadBoard.vue";
import WorkDownloadBoard from "./WorkDownloadBoard.vue";
import WorkDeleteBoard from "./WorkDeleteBoard.vue";
import { useAuthStore } from "../../stores/auth.module";
import { useRouter } from "vue-router";
import BoardUploadService from "../boardUploadService/BoardRoom.js";

const authStore = useAuthStore();

const currentUser = computed(() => {
  return authStore.dataStatus.user;
});

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

const downloadStatus = ref(false);
function handleSendDownloadStatus(newStatus) {
  downloadStatus.value = newStatus;
}

const deleteStatus = ref(false);
function handleSendDeleteStatus(newStatus) {
  deleteStatus.value = newStatus;
}

watch(uploadStatus, (newStatus) => {
  if (!newStatus) {
    BoardUploadService.showRoomContent(roomCode)
      .then((response) => {
        roomDataStatus.value = false;
        roomData.value = response.data;
        roomDataIsOwner.value = roomData.value.isRoomOwner;

        // 判斷是否為房間擁有者與是否有登入
        if (roomDataIsOwner.value && currentUser.value) {
          roomData.value.dbRoomFiles = roomData.value.dbRoomFiles;
        } else if (currentUser.value && !roomDataIsOwner.value) {
          roomData.value.dbRoomFiles = roomData.value.dbRoomFiles.filter(
            (roomFile) => roomFile.uploaderName === currentUser.value.username
          );
        } else {
          roomData.value.dbRoomFiles = [];
        }

        // 判斷是否有檔案，若非房間擁有者且無檔案則不顯示檔案列表
        if (roomData.value.dbRoomFiles.length > 0) {
          roomDataFileStatus.value = true;
        }

        roomDataFileLength.value = roomData.value.dbRoomFiles.length;
        handleRoomData(roomDataFileLength.value);
        updataPageNumber();
      })
      .catch((error) => {
        console.error(error);
      });
  }
});

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
    BoardUploadService.showRoomContent(roomCode)
      .then((response) => {
        roomDataStatus.value = false;
        roomData.value = response.data;
        roomDataIsOwner.value = roomData.value.isRoomOwner;

        // 判斷是否為房間擁有者與是否有登入
        if (roomDataIsOwner.value && currentUser.value) {
          roomData.value.dbRoomFiles = roomData.value.dbRoomFiles;
        } else if (currentUser.value && !roomDataIsOwner.value) {
          roomData.value.dbRoomFiles = roomData.value.dbRoomFiles.filter(
            (roomFile) => roomFile.uploaderName === currentUser.value.username
          );
        } else {
          roomData.value.dbRoomFiles = [];
        }

        // 判斷是否有檔案，若非房間擁有者且無檔案則不顯示檔案列表
        if (roomData.value.dbRoomFiles.length > 0) {
          roomDataFileStatus.value = true;
        }

        roomDataFileLength.value = roomData.value.dbRoomFiles.length;
        handleRoomData(roomDataFileLength.value);
        updataPageNumber();
      })
      .catch((error) => {
        console.error(error);
      });
  }, 1000);
});

function updataPageNumber() {
  roomDataPage.value = Math.ceil(
    roomDataFileLength.value / roomDataNumber.value,
    0
  );
  for (let i = 0; i < roomDataNumber.value; i++) {
    roomDataPageLength.value[i] = i;
  }
}

function clickPageNumber(page) {
  const startIndex = (page - 1) * roomDataNumber.value;
  let endIndex = page * roomDataNumber.value - 1;
  endIndex = Math.min(endIndex, roomDataFileLength.value - 1);

  roomDataPageLength.value = [];
  for (let i = startIndex; i <= endIndex; i++) {
    roomDataPageLength.value[i] = i;
  }
  roomActiveTab.value = page;
}
</script>

<template>
  <div v-if="createStatus">
    <WorkCreateBoard
      @send-create-status="handleSendCreateStatus"
    ></WorkCreateBoard>
  </div>
  <div v-if="uploadStatus">
    <WorkUploadBoard
      @send-upload-status="handleSendUploadStatus"
      :roomCode="roomCode"
    ></WorkUploadBoard>
  </div>
  <div v-if="downloadStatus">
    <WorkDownloadBoard
      @send-download-status="handleSendDownloadStatus"
      :roomData="roomData.dbRoomFiles"
    ></WorkDownloadBoard>
  </div>
  <div v-if="deleteStatus">
    <WorkDeleteBoard
      @send-delete-status="handleSendDeleteStatus"
    ></WorkDeleteBoard>
  </div>

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
        <div class="room-board-sidebar-tab-user">
          <p></p>
          <div><font-awesome-icon :icon="['far', 'user']" /></div>
          <span>User 1(Owner)</span>
        </div>
        <div
          class="room-board-sidebar-tab"
          @click="handleSendUploadStatus(true)"
        >
          <div><font-awesome-icon icon="arrow-up-from-bracket" /></div>
          <span>Upload File</span>
        </div>
        <div v-if="roomDataIsOwner">
          <div
            class="room-board-sidebar-tab"
            @click="handleSendDownloadStatus(true)"
          >
            <div><font-awesome-icon icon="users" /></div>
            <span>User List</span>
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
      <pre>作業版 / 房間</pre>

      <div class="room-board-data" v-if="roomDataStatus">
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
        <!-- <p class="room-board-data-line"></p> -->
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
        </div>

        <!-- loading -->
        <div class="room-board-file" v-if="roomDataStatus">
          <div
            class="room-board-main-room"
            v-for="(roomFile, index) in roomLoadingCode"
            :key="index"
          >
            <div
              class="room-board-main-trash"
              @click="handleSendDeleteStatus(true)"
            >
              <font-awesome-icon icon="trash-can" />
            </div>
            <div class="room-board-main-room-user">
              <div><font-awesome-icon :icon="['far', 'user']" /></div>
              <span>User 1</span>
            </div>
            <div class="room-board-main-room-number">
              <span><font-awesome-icon :icon="['far', 'file']" /></span>
              <div class="room-board-main-loading-text">
                <p><i class="flash-across"></i></p>
                <p><i class="flash-across"></i></p>
              </div>
            </div>
            <div
              class="room-work-board-main-room-description room-board-main-loading-description"
            >
              <p><i class="flash-across"></i></p>
              <p class="loading-text-210"><i class="flash-across"></i></p>
            </div>
            <p class="room-board-main-room-date room-board-main-loading-date">
              <i class="flash-across"></i>
            </p>
          </div>
        </div>
        <!-- loading -->

        <!-- RoomData -->
        <div v-else>
          <div class="room-board-file" v-if="roomDataFileStatus">
            <div
              class="room-board-main-room"
              v-for="(roomFile, index) in roomDataPageLength"
              :key="index"
            >
              <div
                class="room-board-main-trash"
                @click="handleSendDeleteStatus(true)"
              >
                <font-awesome-icon icon="trash-can" />
              </div>
              <div class="room-board-main-room-user">
                <div><font-awesome-icon :icon="['far', 'user']" /></div>
                <span>{{ roomData.dbRoomFiles[roomFile].uploaderName }}</span>
              </div>
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
        <!-- RoomData -->
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "../../assets/styles/layout/board/roomBoard";

.room-board-main-room {
  .room-board-main-trash {
    position: absolute;
    top: 10px;
    right: 16px;
    color: #615f5f;
    font-size: 16px;
    cursor: pointer;
  }

  .room-board-main-room-user {
    display: flex;
    color: #615f5f;
    margin-top: -2px;
    user-select: none;

    span {
      margin: 0 0 8px 6px;
      font-size: 16px;
      font-weight: bold;
    }
  }
}

.room-board-sidebar-tab-user {
  display: flex;
  align-items: center;
  height: 40px;
  width: 230px;
  color: #615f5f;
  font-size: 20px;
  background-color: #ffffe9;
  border-radius: 18px;
  margin-top: 9px;
  padding-left: 1rem;
  user-select: none;

  div {
    width: 30px;
  }

  span {
    margin-left: 6px;
    font-weight: bold;
  }
}

.room-work-board-main-room-description {
  height: 70px;
  p {
    font-size: 16px;
    font-weight: bold;
    color: #373737;
    line-height: 1.33;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    word-break: break-all;
    overflow: hidden;
  }
}

.room-board-main-loading-description {
  margin-top: 10px;
}
</style>
