<script setup>
import { ref, computed } from 'vue';
import WorkCreateBoard from './WorkCreateBoard.vue';
import WorkUploadBoard from './WorkUploadBoard.vue';
import WorkDownloadBoard from './WorkDownloadBoard.vue';
import WorkDeleteBoard from './WorkDeleteBoard.vue'

const createStatus = ref(false);
function handleSendCreateStatus(newStatus) {
  createStatus.value = newStatus;
}

const uploadStatus = ref(false);
function handleSendUploadStatus(newStatus) {
  uploadStatus.value = newStatus
}

const downloadStatus = ref(false);
function handleSendDownloadStatus(newStatus) {
  downloadStatus.value = newStatus;
}

const deleteStatus = ref(false);
function handleSendDeleteStatus(newStatus) {
  deleteStatus.value = newStatus;
}

const roomTestNumber = 8;

</script>

<template>
  <div v-if="createStatus">
    <WorkCreateBoard @send-create-status="handleSendCreateStatus"></WorkCreateBoard>
  </div>
  <div v-if="uploadStatus">
    <WorkUploadBoard @send-upload-status="handleSendUploadStatus"></WorkUploadBoard>
  </div>
  <div v-if="downloadStatus">
    <WorkDownloadBoard @send-download-status="handleSendDownloadStatus"></WorkDownloadBoard>
  </div>
  <div v-if="deleteStatus">
    <WorkDeleteBoard @send-delete-status="handleSendDeleteStatus"></WorkDeleteBoard>
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
        <div class="room-board-sidebar-tab" @click="handleSendUploadStatus(true)">
          <div><font-awesome-icon icon="arrow-up-from-bracket" /></div>
          <span>Upload File</span>
        </div>
        <div class="room-board-sidebar-tab" @click="handleSendDownloadStatus(true)">
          <div><font-awesome-icon icon="users" /></div>
          <span>User List</span>
        </div>
        <div class="room-board-sidebar-tab" @click="handleSendCreateStatus(true)">
          <div><font-awesome-icon icon="gear" /></div>
          <span>Room Setup</span>
        </div>
      </div>
    </div>

    <div class="room-board-content">
      <pre>作業版 / 房間</pre>

      <div class="room-board-data">
        <div class="room-board-data-img">
          <img src="../../assets/image/main.png" alt="">
        </div>
        <div class="room-board-data-text">
          <h1>系統分析與設計</h1>
          <h2>這是一個可以一對多傳送檔案的房間，此功能名為One for all(暫定)，建立房間的房主可在此進行房間的簡述，使參加者了解房間傳送檔案的目的，使參加者了解房間傳送檔案的目的</h2>
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
        </div>

        <div class="room-board-file">

          <div class="room-board-main-room" v-for="(room, index) in roomTestNumber" :key="index">
            <div @click="handleSendDeleteStatus(true)"><font-awesome-icon icon="trash-can" /></div>
            <div class="room-board-main-room-user">
              <div><font-awesome-icon :icon="['far', 'user']" /></div>
              <span>User 1</span>
            </div>
            <div class="room-board-main-room-number">
              <span><font-awesome-icon :icon="['far', 'file']" /></span>
              <div>
                <p>Universal-System-Web.mp4</p>
                <p>40.9MB</p>
              </div>
            </div>
            <p class="room-board-main-room-description">
              這是房間擁有者上傳的檔案，此位置的文字為檔案簡述...
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

.room-board-main-room {

  >div:first-child {
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
  background-color: #FFFFE9;
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
</style>