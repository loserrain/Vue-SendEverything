<script setup>
import { ref, computed } from 'vue';
import CreateBoard from "./CreateBoard.vue";
import UploadBoard from './UploadBoard.vue';
import DeleteBoard from './DeleteBoard.vue';

const createStatus = ref(false);
function handleSendCreateStatus(newStatus) {
  createStatus.value = newStatus;
}

const uploadStatus = ref(false);
function handleSendUploadStatus(newStatus) {
  uploadStatus.value = newStatus
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
  return roomChecked.value.map(checked => checked ? ["far", "square-check"] : ["far", "square"]);
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
  const allChecked = roomChecked.value.every(checked => checked);
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
        <div class="room-board-sidebar-tab " :class="sidebarStatus ? 'room-board-sidebar-status' : ''"
          @click="toggleSidebarStatus()">
          <p></p>
          <div><font-awesome-icon :icon="['far', 'pen-to-square']" /></div>
          <span>Edit File</span>
        </div>
        <div class="room-board-sidebar-tab" @click="handleSendUploadStatus(true)">
          <div><font-awesome-icon icon="arrow-up-from-bracket" /></div>
          <span>Upload File</span>
        </div>
        <div class="room-board-sidebar-tab" @click="handleSendCreateStatus(true)">
          <div><font-awesome-icon icon="gear" /></div>
          <span>Room Setup</span>
        </div>
      </div>
    </div>

    <div class="room-board-content">
      <pre>佈告欄 / 房間</pre>

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
          <div v-if="sidebarStatus">
            <button>下載</button>
            <button class="room-board-delete" @click="handleSendDeleteStatus(true)">刪除</button>
            <button @click="selectAllRooms()">全選</button>
            <button @click="toggleSidebarStatus()">取消</button>
          </div>
        </div>

        <div class="room-board-file">

          <div class="room-board-main-room" v-for="(room, index) in roomTestNumber" :key="index">
            <p class="room-board-main-room-check" v-if="sidebarStatus">
              <label :for="'checkbox' + index">
                <input type="checkbox" :id="'checkbox' + index" :checked="roomChecked[index]" @change="handleRoomCheckboxToggle(index)" />
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
.room-board-container {
  display: flex;


  .room-board-sidebar {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 70px);

    .room-board-sidebar-search {
      padding: 2.5rem 2rem 1rem 2rem;
      border-bottom: 5px solid #f8f8f8;

      p {
        font-size: 16px;
        font-weight: bold;
        color: #615f5f;
      }
    }

    .room-board-sidebar-input {
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
    .room-board-sidebar-room-mode {
      padding: 1.5rem 0 0 0.8rem;

      >p {
        font-size: 16px;
        font-weight: bold;
        color: #615f5f;
        margin-left: 1.3rem;
      }

      .room-board-sidebar-tab {
        display: flex;
        align-items: center;
        position: relative;
        height: 40px;
        width: 230px;
        color: #615f5f;
        font-size: 20px;
        background-color: #f5f6f7;
        // background-color: #FFFFE9;
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

      }

      .room-board-sidebar-status {
        background-color: #e9f2ff;

        p {
          position: absolute;
          width: 5px;
          height: 17px;
          background-color: #84b6ff;
          left: 0;
        }
      }
    }
  }

  .room-board-content {
    // padding: 0 0 0 2rem;
    border-left: 5px solid #f8f8f8;

    >pre {
      font-size: 28px;
      font-weight: bolder;
      color: #615f5f;
      margin: 2rem 0 1.5rem 2.5rem;
      user-select: none;
    }

    .room-board-data {
      display: flex;
      justify-content: space-evenly;
      // align-items: center;
      padding-bottom: 2rem;
      border-bottom: 5px solid #f8f8f8;
      ;

      .room-board-data-img {
        border: 3px solid #D9D9D9;
        border-radius: 12px;
        width: 200px;
        height: 210px;

        img {
          width: 100%;
          height: 100%;
        }
      }

      .room-board-data-text {
        width: 60%;
        position: relative;

        h1 {
          font-size: 36px;
          font-weight: bold;
          color: #1E3050;
        }

        h2 {
          font-size: 22px;
          font-weight: bold;
          color: #1E3050;
          margin: 2rem 0;
        }

        .room-board-data-date {
          display: flex;
          align-items: end;

          p {
            font-size: 18px;
            font-weight: bold;
            color: #1E3050;
            margin-right: 1.5rem;
          }
        }

        >p {
          position: absolute;
          top: 1rem;
          right: 1rem;
          font-size: 18px;
          font-weight: bold;
          color: #1E3050;
        }
      }
    }

    .room-board-fileList {

      .room-board-fileTitle {
        display: flex;
        align-items: center;
        margin: 2rem 0 1.5rem 2.5rem;

        p {
          font-size: 28px;
          font-weight: bold;
          color: #615f5f;
          user-select: none;
        }

        div {
          button {
            font-size: 18px;
            font-weight: bold;
            color: #FFFFFF;
            margin-left: 1rem;
            padding: 5px 28px;
            background-color: #808080;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }

          button:first-child {
            background-color: #3497DE;
            margin-left: 2rem;
          }

          .room-board-delete {
            background-color: #F24646;
          }
        }
      }



      .room-board-file {
        display: flex;
        flex-wrap: wrap;
        gap: 35px 24px;
        width: 1520px;
        margin-left: 2rem;

        >div {
          height: 180px;
          width: 350px;
          background-color: #f5f6f7;
          border-radius: 8px;
        }

        .room-board-main-room {
          position: relative;
          display: flex;
          justify-content: space-between;
          flex-direction: column;
          padding: 16px 1rem 8px;

          .room-board-main-room-check {
            position: absolute;
            top: 10px;
            right: 16px;
            font-size: 22px;
            color: #767676;

            label {
              cursor: pointer;
            }

            input[type="checkbox"] {
              display: none;
            }
          }

          .room-board-main-room-number {
            display: flex;

            span {
              font-size: 32px;
              color: #626f86;
            }

            >div {
              margin-left: 10px;

              p:first-child {
                font-size: 16px;
                font-weight: bold;
                color: #1E3050;
                margin-bottom: 4px;
              }

              p {
                font-size: 12px;
                color: #8B8B8B;
                user-select: none;
              }
            }
          }

          .room-board-main-room-description {
            font-size: 16px;
            font-weight: bold;
            color: #373737;
          }

          .room-board-main-room-date {
            font-size: 14px;
            font-weight: bold;
            color: #8b8b8b;
            margin: 6px 0;
          }
        }
      }
    }


  }
}
</style>