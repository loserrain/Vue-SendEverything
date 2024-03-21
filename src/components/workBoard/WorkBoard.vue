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
</script>

<template>
  <div v-if="loginStatus">
    <WorkLoginBoard @send-login-status="handleLoginStatus"></WorkLoginBoard>
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
        <div class="board-sidebar-tab board-sidebar-status">
          <p></p>
          <div><font-awesome-icon icon="globe" /></div>
          <span>All Room</span>
        </div>
        <div class="board-sidebar-tab">
          <div><font-awesome-icon icon="lock-open" /></div>
          <span>Joined</span>
        </div>
        <div class="board-sidebar-tab">
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
.board-container {
  display: flex;

  .board-sidebar {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 70px);

    .board-sidebar-search {
      padding: 2.5rem 2rem 1rem 2rem;
      border-bottom: 5px solid #f8f8f8;

      p {
        font-size: 16px;
        font-weight: bold;
        color: #615f5f;
      }
    }

    .board-sidebar-input {
      display: flex;
      align-items: center;
      width: 200px;
      height: 35px;
      background-color: #f6f6f6;
      border: 2px solid #858585;
      border-radius: 18px;
      margin: 5px 0 0 -5px;

      input {
        background: none;
        outline: none;
        border: none;
        font-size: 18px;
        color: #8b8b8b;
        width: 80%;
        margin-left: 10px;
      }

      span {
        font-size: 20px;
        color: rgb(139, 139, 139);
        margin-top: 1px;
      }
    }

    // Room mode
    .board-sidebar-room-mode {
      padding: 1.5rem 0 0 0.8rem;

      >p {
        font-size: 16px;
        font-weight: bold;
        color: #615f5f;
        margin-left: 1.3rem;
      }

      .board-sidebar-tab {
        display: flex;
        align-items: center;
        position: relative;
        height: 40px;
        width: 230px;
        color: #615f5f;
        font-size: 20px;
        background-color: #f5f6f7;
        margin-top: 9px;
        padding-left: 1rem;
        cursor: pointer;

        div {
          width: 30px;
        }

        span {
          margin-left: 6px;
          font-weight: bold;
        }

        p {
          position: absolute;
          width: 5px;
          height: 17px;
          background-color: #84b6ff;
          left: 0;
        }
      }

      .board-sidebar-status {
        background-color: #e9f2ff;
      }
    }
  }

  .board-main {
    padding: 0 0 0 2rem;
    border-left: 5px solid #f8f8f8;
    border-right: 5px solid #f8f8f8;

    >pre {
      font-size: 32px;
      font-weight: bolder;
      color: #615f5f;
      margin: 3.8rem 0 3.5rem 0.5rem;
      user-select: none;
    }

    .board-main-content {
      display: flex;
      flex-wrap: wrap;
      gap: 35px 24px;
      width: 1520px;

      >div {
        height: 180px;
        width: 350px;
        background-color: #f5f6f7;
        border-radius: 8px;
      }

      .board-main-room {
        position: relative;
        display: flex;
        justify-content: space-between;
        flex-direction: column;
        padding: 8px 1rem 8px;
        cursor: pointer;

        .board-main-room-number {
          display: flex;
          align-items: center;

          span {
            font-size: 32px;
            color: #626f86;
          }

          p {
            font-size: 18px;
            font-weight: bold;
            color: #1E3050;
            margin-left: 10px;
          }
        }

        .board-main-room-description {
          font-size: 18px;
          font-weight: bold;
          color: #373737;
        }

        .board-main-room-date {
          font-size: 14px;
          font-weight: bold;
          color: #8b8b8b;
          margin: 6px 0;
        }
      }
    }

    .board-main-room-page {
      display: flex;
      justify-content: center;
      margin-top: 1rem;
      user-select: none;

      // > pre {
      //   font-size: 20px;
      //   font-weight: bold;
      //   color: #acacac;
      //   cursor: pointer;
      // }

      ul {
        display: flex;
        list-style: none;
      }

      >span {
        font-size: 20px;
        color: #615f5f;
        cursor: pointer;
      }
    }
  }
}
</style>
