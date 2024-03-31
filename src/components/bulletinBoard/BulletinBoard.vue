<script setup>
import { ref, onMounted } from "vue";

import CreateBoard from "./CreateBoard.vue";
import LoginBoard from "./LoginBoard.vue";
import BoardUploadService from "../boardUploadService/BoardRoom.js";

const createStatus = ref(false);
const loginStatus = ref(false);

function handleSendCreateStatus(newStatus) {
  createStatus.value = newStatus;
}

function handleLoginStatus(newStatus) {
  loginStatus.value = newStatus;
}

const activeTab = ref('all');

const handleTabClick = (tab) => {
  activeTab.value = tab;
}

const roomTestNumber = 12;
const roomCode = ref("6N3YVKE7");

// onMounted(() => {
//   BoardUploadService.getRoomList().then((response) => {
//     console.log(response);
//   })
// });
</script>

<template>
  <div v-if="loginStatus">
    <LoginBoard @send-login-status="handleLoginStatus" :roomCode="roomCode"></LoginBoard>
  </div>
  <div v-if="createStatus">
    <CreateBoard @send-create-status="handleSendCreateStatus"></CreateBoard>
  </div>
  <div class="board-container">

<!--  -->
    <div class="board-sidebar">
      <div class="board-sidebar-search">
        <p>Room Search</p>
        <div class="board-sidebar-input">
          <label for="search"></label>
          <input type="text" id="search" />
          <span>
            <font-awesome-icon icon="fa-solid fa-magnifying-glass" />
          </span>
        </div>
      </div>
      <div class="board-sidebar-room-mode">
        <p>Room Mode</p>
        <div class="board-sidebar-tab" :class="[{'board-sidebar-status': activeTab === 'all'}]" @click="handleTabClick('all')">
          <p></p>
          <div><font-awesome-icon icon="globe" /></div>
          <span>All Room</span>
        </div>
        <div class="board-sidebar-tab" :class="[{'board-sidebar-status': activeTab === 'public'}]" @click="handleTabClick('public')">
          <p></p>
          <div><font-awesome-icon icon="lock-open" /></div>
          <span>Public</span>
        </div>
        <div class="board-sidebar-tab" :class="[{'board-sidebar-status': activeTab === 'private'}]" @click="handleTabClick('private')">
          <p></p>
          <div><font-awesome-icon icon="lock" /></div>
          <span>Private</span>
        </div>
        <div class="board-sidebar-tab" :class="[{'board-sidebar-status': activeTab === 'created'}]" @click="handleTabClick('created')">
          <p></p>
          <div><font-awesome-icon icon="clock-rotate-left" /></div>
          <span>Created</span>
        </div>
      </div>

      <div class="board-sidebar-room-mode">
        <p>Room Dev</p>
        <div class="board-sidebar-tab" @click="handleSendCreateStatus(true)">
          <div><font-awesome-icon icon="plus" /></div>
          <span>Create Room</span>
        </div>
      </div>
    </div>
    <!--  -->

    <div class="board-main">
      <pre>佈告欄 / 加入與設定</pre>
      <div class="board-main-content">
        <div class="board-main-room" v-for="Number in roomTestNumber" @click="handleLoginStatus(true)">
          <p class="board-main-room-status">Public</p>
          <div class="board-main-room-number">
            <span><font-awesome-icon icon="house-user" /></span>
            <p>{{ roomCode }}</p>
          </div>
          <p class="board-main-room-description">
            這是一個使用者參與過的房間，此為示例，供開發者參考用，過多文字將會縮短........
          </p>
          <p class="board-main-room-date">Creation date: 2024/03/04.</p>
        </div>
      </div>

    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "../../assets/styles/layout/board/board";

</style>
