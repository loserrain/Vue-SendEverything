<script setup>
import { ref, computed } from "vue";
import CreateBoard from "./CreateBoard.vue";
import UploadBoard from "./UploadBoard.vue";
import DeleteBoard from "./DeleteBoard.vue";

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

const roomTestNumber = 8;

// check檔案下載
const roomChecked = ref([]);

for (let i = 0; i < roomTestNumber; i++) {
  roomChecked.value.push(false);
}

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
</script>

<template>
  <div v-if="createStatus">
    <CreateBoard @send-create-status="handleSendCreateStatus"></CreateBoard>
  </div>
  <div v-if="uploadStatus">
    <UploadBoard @send-upload-status="handleSendUploadStatus"></UploadBoard>
  </div>
  <div v-if="deleteStatus">
    <DeleteBoard @send-delete-status="handleSendDeleteStatus"></DeleteBoard>
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
        <div
          class="room-board-sidebar-tab"
          :class="sidebarStatus ? 'room-board-sidebar-status' : ''"
          @click="toggleSidebarStatus()"
        >
          <p></p>
          <div><font-awesome-icon :icon="['far', 'circle-down']" /></div>
          <span>Download File{{ $route.params.roomId }}</span>
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

      <div class="room-board-data">
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
          <p>XBF4CR</p>
        </div>
      </div>

      <div class="room-board-fileList">
        <div class="room-board-fileTitle">
          <p>
            <span><font-awesome-icon :icon="['far', 'folder-open']" /></span>
            檔案
          </p>
          <div v-if="sidebarStatus">
            <button>下載</button>
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
            v-for="(room, index) in roomTestNumber"
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
                <p>Universal-System-Web.mp4</p>
                <p>40.9MB</p>
              </div>
            </div>
            <p class="room-board-main-room-description">
              這是房間擁有者上傳的檔案，此位置的文字為檔案簡述，供開發者參考用，過多文字將會縮短........
            </p>
            <p class="room-board-main-room-date">Creation date: 2024/03/04.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "../../assets/styles/layout/board/roomBoard";

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
  transition: all .2s;
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
