<script setup>
import { ref, onMounted, computed } from "vue";
import CreateBoard from "./CreateBoard.vue";
import LoginBoard from "./LoginBoard.vue";
import BoardUploadService from "../boardUploadService/BoardRoom.js";
import { useRouter } from "vue-router";

const router = useRouter();
const createStatus = ref(false);
const loginStatus = ref(false);

function handleSendCreateStatus(newStatus) {
  createStatus.value = newStatus;
}

function handleLoginStatus(newStatus) {
  loginStatus.value = newStatus;
}

const RoomType = {
  ALL: "ALL",
  PUBLIC: "PUBLIC",
  PRIVATE: "PRIVATE",
};

const activeTab = ref(RoomType.ALL);

const handleTabClick = (tab) => {
  activeTab.value = tab;
};

// 篩選房間類型
const filteredRoomData = computed(() => {
  if (activeTab.value === RoomType.ALL) {
    return roomData.value;
  } else {
    return roomData.value.filter((room) => room.roomType === activeTab.value);
  }
});

// 房間類型鎖定
const roomTypeLock = computed(() => {
  return filteredRoomData.value.map((room) => {
    return room.roomType === "PRIVATE" ? "lock" : "unlock";
  });
});

// 房間類型狀態
const roomTypeStatus = computed(() => {
  return filteredRoomData.value.map((room) => {
    return room.roomType === "PRIVATE";
  });
});

// 透過搜尋字串篩選房間
const searchWordFilter = ref("");

const filteredSearchRoomData = computed(() => {
  const searchWord = searchWordFilter.value.toLowerCase().trim();
  if (!searchWord) return filteredRoomData.value;
  return filteredRoomData.value.filter((room) => {
    return room.title.toLowerCase().includes(searchWord);
    // ||
    // room.roomCode.toLowerCase().includes(searchWord) ||
    // room.description.toLowerCase().includes(searchWord);
  });
});

// 透過綁定@input事件，當輸入框有輸入時，觸發filterRooms函式
function filterRooms() {
  searchWordFilter.value = evebn.target.value;
}

// 房間資料
const roomData = ref([]);
// 房間代碼
const roomCode = ref([]);
// 房間代碼編號
const roomCodeNumber = ref(0);

// 透過房間代碼編號，將房間代碼傳送至LoginBoard元件
async function sendRoomNumber(roomNumber) {
  roomCodeNumber.value = roomNumber;
  const sendVerifyRoomCode = roomCode.value[roomNumber];
  try {
    const response = await BoardUploadService.verifyCookie(sendVerifyRoomCode);
    if (response.status === 200) {
      router.push({
        name: "RoomBoard",
        params: { roomCode: sendVerifyRoomCode },
      });
    }
  } catch (error) {
    console.error(error);
    handleLoginStatus(true);
  }
}

// 處理房間資料
function processRoomData(Data) {
  for (let i = 0; i < Data.length; i++) {
    roomCode.value.push(roomData.value[i].roomCode);
    roomData.value[i].createTime = new Date(
      roomData.value[i].createTime
    ).toLocaleString();
  }
}

// 獲取所有房間資料
onMounted(() => {
  BoardUploadService.getAllRooms().then((response) => {
    roomData.value = response.data;
    processRoomData(roomData.value);
  });
});
</script>

<template>
  <div v-if="loginStatus">
    <LoginBoard
      @send-login-status="handleLoginStatus"
      :roomCode="roomCode[roomCodeNumber]"
    ></LoginBoard>
  </div>
  <div v-if="createStatus">
    <CreateBoard @send-create-status="handleSendCreateStatus"></CreateBoard>
  </div>
  <div class="board-container">
    <!--  -->
    <div class="board-sidebar">
      <div class="board-sidebar-search">
        <p>Search Title</p>
        <div class="board-sidebar-input">
          <label for="search"></label>
          <input
            type="text"
            id="search"
            v-model="searchWordFilter"
            @input="filterRooms"
          />
          <span>
            <font-awesome-icon icon="fa-solid fa-magnifying-glass" />
          </span>
        </div>
      </div>
      <div class="board-sidebar-room-mode">
        <p>Room Mode</p>
        <div
          class="board-sidebar-tab"
          :class="[{ 'board-sidebar-status': activeTab === 'ALL' }]"
          @click="handleTabClick('ALL')"
        >
          <p></p>
          <div><font-awesome-icon icon="globe" /></div>
          <span>All Room</span>
        </div>
        <div
          class="board-sidebar-tab"
          :class="[{ 'board-sidebar-status': activeTab === 'PUBLIC' }]"
          @click="handleTabClick('PUBLIC')"
        >
          <p></p>
          <div><font-awesome-icon icon="unlock" /></div>
          <span>Public</span>
        </div>
        <div
          class="board-sidebar-tab"
          :class="[{ 'board-sidebar-status': activeTab === 'PRIVATE' }]"
          @click="handleTabClick('PRIVATE')"
        >
          <p></p>
          <div><font-awesome-icon icon="lock" /></div>
          <span>Private</span>
        </div>
        <div
          class="board-sidebar-tab"
          :class="[{ 'board-sidebar-status': activeTab === 'Joined' }]"
          @click="handleTabClick('Joined')"
        >
          <p></p>
          <div><font-awesome-icon icon="lock-open" /></div>
          <span>Joined</span>
        </div>
        <div
          class="board-sidebar-tab"
          :class="[{ 'board-sidebar-status': activeTab === 'CREATED' }]"
          @click="handleTabClick('CREATED')"
        >
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
        <div
          class="board-main-room"
          v-for="(Data, index) in filteredSearchRoomData"
          :key="index"
          @click="sendRoomNumber(index)"
        >
          <p
            class="board-main-room-status"
            :class="roomTypeStatus[index] ? 'board-main-room-type-red' : ''"
          >
            <font-awesome-icon :icon="roomTypeLock[index]" />
          </p>
          <div class="board-main-room-number">
            <p>{{ Data.title }}</p>
            <span>{{ Data.roomCode }}</span>
          </div>
          <p class="board-main-room-description">
            {{ Data.description }}
          </p>
          <p class="board-main-room-date">{{ Data.createTime }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "../../assets/styles/layout/board/board";
</style>
