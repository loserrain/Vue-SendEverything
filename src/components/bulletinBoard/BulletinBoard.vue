<script setup>
import { ref, onMounted, computed, watch } from "vue";
import CreateBoard from "./CreateBoard.vue";
import LoginBoard from "./LoginBoard.vue";
import BoardUploadService from "../boardUploadService/BoardRoom.js";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth.module";

const authStore = useAuthStore();

const currentUser = computed(() => {
  return authStore.dataStatus.user;
});

const router = useRouter();
const createStatus = ref(false);
const loginStatus = ref(false);

function handleSendCreateStatus(newStatus) {
  if (currentUser.value !== null) {
    createStatus.value = newStatus;
  } else {
    return alert("Please login first.");
  }
}

function handleLoginStatus(newStatus) {
  loginStatus.value = newStatus;
}

const RoomType = {
  ALL: "ALL",
  PUBLIC: "PUBLIC",
  PRIVATE: "PRIVATE",
  JOINED: "JOINED",
  CREATED: "CREATED",
};

const activeTab = ref(RoomType.ALL);

const handleTabClick = (tab) => {
  activeTab.value = tab;
};

// 篩選房間類型，關鍵資料，一切資料都由這個變數控制
const filteredRoomData = computed(() => {
  if (activeTab.value === RoomType.ALL) {
    return roomData.value;
  } else if (activeTab.value === RoomType.PUBLIC) {
    // 只顯示公共房間
    return roomData.value.filter((room) => room.roomType === RoomType.PUBLIC);
  } else if (activeTab.value === RoomType.PRIVATE) {
    // 只顯示私人房間
    return roomData.value.filter((room) => room.roomType === RoomType.PRIVATE);
  } else if (activeTab.value === RoomType.CREATED) {
    // 只顯示由當前用戶創建的房間
    return roomData.value.filter((room) => room.isOwner === true);
  } else if (activeTab.value === RoomType.JOINED) {
    // 只顯示由當前用戶創建的房間
    return roomData.value.filter((room) => room.isMember === true);
  } else {
    return []; // 預設返回空數組
  }
});

// 房間類型鎖定
const roomTypeLock = computed(() => {
  return filteredSearchRoomData.value.map((room) => {
    return room.roomType === "PRIVATE" ? "lock" : "unlock";
  });
});

// 房間類型狀態
const roomTypeStatus = computed(() => {
  return filteredSearchRoomData.value.map((room) => {
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
// 房間類型
const roomType = ref([]);

// 透過房間代碼編號，將房間代碼傳送至LoginBoard元件
async function sendRoomNumber(roomNumber) {
  if (roomCurrentPage.value === 1) {
    roomCodeNumber.value = roomNumber;
  } else {
    roomCodeNumber.value = roomNumber + (roomCurrentPage.value - 1) * 12;
  }
  const sendVerifyRoomCode = roomCode.value[roomCodeNumber.value];
  const sendVerifyRoomType = roomType.value[roomCodeNumber.value];
  try {
    if (filteredSearchRoomData.value[roomNumber].roomType === "PRIVATE") {
      const response = await BoardUploadService.verifyCookie(
        sendVerifyRoomCode
      );
      if (response.status === 200) {
        router.push({
          name: "RoomBoard",
          params: { roomCode: sendVerifyRoomCode },
        });
      }
    } else {
      BoardUploadService.accessRoom("", sendVerifyRoomCode, sendVerifyRoomType)
        .then(() => {
          router.push(`/BulletinBoard/roomboard/${sendVerifyRoomCode}`);
        })
        .catch((error) => {
          console.log(error);
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
  roomType.value = [];
  Data.forEach((room) => {
    roomCode.value.push(room.roomCode);
    roomType.value.push(room.roomType);
  });
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

const boardType = ref("BULLETIN_BOARD");
// 獲取所有房間資料
onMounted(() => {
  BoardUploadService.getAllRooms(boardType.value)
    .then((response) => {
      roomData.value = response.data;
      console.log(roomData.value)
      roomData.value.sort((a, b) => {
        const dateA = new Date(a.createTime);
        const dateB = new Date(b.createTime);
        return dateB - dateA;
      });
      roomData.value.forEach((room) => {
        room.createTime = new Date(room.createTime).toLocaleString();
      });
      updataPageNumber();
    })
    .catch((error) => {
      console.error(error);
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
    updataPageNumber();
    clickPageNumber(Number(router.currentRoute.value.query.page));
    processRoomData(newFilteredSearchRoomData);
  } else {
    roomNumber.value = 12;
    updataPageNumber();
    clickPageNumber(Number(router.currentRoute.value.query.page));
    processRoomData(newFilteredSearchRoomData);
  }
});
</script>

<template>
  <div v-if="loginStatus">
    <LoginBoard
      @send-login-status="handleLoginStatus"
      :roomCode="roomCode[roomCodeNumber]"
      :roomType="roomType[roomCodeNumber]"
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
        <p class="board-sidebar-history">Room History</p>
        <div
          class="board-sidebar-tab"
          :class="[{ 'board-sidebar-status': activeTab === 'JOINED' }]"
          @click="handleTabClick('JOINED')"
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
      <div
        class="board-main-content"
      >
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
