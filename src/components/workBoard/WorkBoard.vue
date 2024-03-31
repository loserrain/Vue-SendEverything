<script setup>
import { ref } from "vue";

import WorkCreateBoard from "./WorkCreateBoard.vue";
import WorkLoginBoard from "./WorkLoginBoard.vue";
const createStatus = ref(false);
const loginStatus = ref(false);

function handleSendCreateStatus(newStatus) {
  createStatus.value = newStatus;
}

function handleLoginStatus(newStatus) {
  loginStatus.value = newStatus;
}

const roomTestNumber = 12;

const activeTab = ref('all');

const handleTabClick = (tab) => {
  activeTab.value = tab;
}

const roomCode = ref("6N3YVKE7");

</script>

<template>
  <div v-if="loginStatus">
    <WorkLoginBoard @send-login-status="handleLoginStatus" :roomCode="roomCode"></WorkLoginBoard>
  </div>
  <div v-if="createStatus">
    <WorkCreateBoard @send-create-status="handleSendCreateStatus"></WorkCreateBoard>
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
        <div class="board-sidebar-tab" :class="[{'board-sidebar-status': activeTab === 'joined'}]" @click="handleTabClick('joined')">
          <p></p>
          <div><font-awesome-icon icon="lock-open" /></div>
          <span>Joined</span>
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
      <pre>作業版 / 加入與設定</pre>
      <div class="board-main-content">
        <div class="board-main-room" v-for="Number in roomTestNumber" @click="handleLoginStatus(true)">
          <div class="board-main-room-number">
            <span><font-awesome-icon icon="house-user" /></span>
            <p>XBF4CR</p>
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
