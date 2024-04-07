<script setup>
import { ref, onMounted, computed, watch, watchEffect } from "vue";
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
  if (searchWord) {
    return filteredRoomData.value.filter((room) => {
      return room.title.toLowerCase().includes(searchWord);
      // ||
      // room.roomCode.toLowerCase().includes(searchWord) ||
      // room.description.toLowerCase().includes(searchWord);
    });
  } else {
    return filteredRoomData.value;
  }
});

// 房間資料
const roomData = ref([]);
// 房間代碼
const roomCode = ref([]);
// 房間代碼編號
const roomCodeNumber = ref(0);

// 透過房間代碼編號，將房間代碼傳送至LoginBoard元件
async function sendRoomNumber(roomNumber) {
  console.log(roomDataPage.value);
  if (roomCurrentPage.value === 1) {
    roomCodeNumber.value = roomNumber;
  } else {
    roomCodeNumber.value = roomNumber + (roomCurrentPage.value - 1) * 12;
  }
  console.log(roomCodeNumber.value);
  const sendVerifyRoomCode = roomCode.value[roomCodeNumber.value];
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
  roomCode.value = [];
  filteredRoomData.value.sort((a, b) => {
    const dateA = new Date(a.createTime);
    const dateB = new Date(b.createTime);
    return dateB - dateA;
  });
  for (let i = 0; i < Data.length; i++) {
    roomCode.value.push(filteredSearchRoomData.value[i].roomCode);
    filteredSearchRoomData.value[i].createTime = new Date(
      filteredSearchRoomData.value[i].createTime
    ).toLocaleString();
  }
}

// 更新頁數
function updataPageNumber() {
  roomDataPage.value = Math.ceil(
    filteredSearchRoomData.value.length / roomNumber.value,
    0
  );
  for (let i = 0; i < roomNumber.value; i++) {
    roomDataPageLength.value[i] = i;
  }
}

// 獲取所有房間資料
onMounted(() => {
  BoardUploadService.getAllRooms().then((response) => {
    roomData.value = response.data;
    updataPageNumber();
  });
});

// 頁數房間號碼
const roomNumber = ref(12);
const roomActiveTab = ref(1);
const roomDataPage = ref(1);
const roomDataPageLength = ref([]);
const roomCurrentPage = ref(1);
const roomCurrentRouter = ref(router.currentRoute.value.query.page);

// 點擊頁數，重新更新房間資料，並轉換頁數
function clickPageNumber(page) {
  roomCurrentPage.value = page;
  const startIndex = (page - 1) * roomNumber.value;
  let endIndex = page * roomNumber.value - 1;
  endIndex = Math.min(endIndex, filteredSearchRoomData.value.length - 1);

  roomDataPageLength.value = [];
  for (let i = startIndex; i <= endIndex; i++) {
    roomDataPageLength.value.push(i);
  }
  roomActiveTab.value = page;
  router.push({ query: { page: page } });
}

// 監聽路由變化，並更新房間資料
watch(router.currentRoute, (newRoute) => {
  roomCurrentRouter.value = newRoute.query.page;
  clickPageNumber(Number(roomCurrentRouter.value));
});

// 監聽搜尋房間資料，並更新房間資料，並同時處理資料、更新頁數與轉換頁數
watch(filteredSearchRoomData, (newFilteredSearchRoomData) => {
  roomDataPageLength.value = [];
  if (newFilteredSearchRoomData.length < 13) {
    roomNumber.value = newFilteredSearchRoomData.length;
    roomDataPageLength.value = [];
    for (let i = 0; i < newFilteredSearchRoomData.length; i++) {
      roomDataPageLength.value.push(i);
    }
    processRoomData(newFilteredSearchRoomData);
    updataPageNumber();
    clickPageNumber(Number(router.currentRoute.value.query.page));
  } else {
    roomNumber.value = 12;
    processRoomData(newFilteredSearchRoomData);
    updataPageNumber();
    clickPageNumber(Number(router.currentRoute.value.query.page));
  }
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
          <input type="text" id="search" v-model="searchWordFilter" />
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
      <div class="board-main-title">
        <p>佈告欄 / 加入與設定</p>
        <div class="board-main-page" v-if="filteredSearchRoomData.length != 0">
          <p
            v-for="pageNumber in roomDataPage"
            @click="clickPageNumber(pageNumber)"
            :class="[{ 'board-main-page-now': roomActiveTab === pageNumber }]"
          >
            {{ pageNumber }}
          </p>
        </div>
      </div>
      <div class="board-main-content">
        <div
          class="board-main-room"
          v-for="(data, index) in roomDataPageLength"
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
            <p>{{ filteredSearchRoomData[data].title }}</p>
            <span>{{ filteredSearchRoomData[data].roomCode }}</span>
          </div>
          <p class="board-main-room-description">
            {{ filteredSearchRoomData[data].description }}
          </p>
          <p class="board-main-room-date">
            {{ filteredSearchRoomData[data].createTime }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "../../assets/styles/layout/board/board";
</style>
