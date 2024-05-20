<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import CreateBoard from "./CreateBoard.vue";
import UploadBoard from "./UploadBoard.vue";
import DeleteBoard from "./DeleteBoard.vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth.module";
import BoardUploadService from "../boardUploadService/BoardRoom.js";
import chatService from "../../services/chatService";
import API_URL from "../../services/API_URL";
import webstomp from "webstomp-client";
import socketURL from "../../services/webSocket_URL";
import {
  generateSharedSecretKey,
  digestMessage,
  aesGcmEncrypt,
  aesGcmDecrypt,
} from "../cryptoUtils/DH-Crypto";

const contentRef = ref(null);

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

const deleteStatus = ref(false);
function handleSendDeleteStatus(newStatus) {
  if (roomDownloadCode.value.length === 0) {
    return;
  } else {
    deleteStatus.value = newStatus;
  }
}

watch([uploadStatus, deleteStatus], ([newUploadStatus, newDeleteStatus]) => {
  if (!newUploadStatus || !newDeleteStatus) {
    showRoomContent(roomCode);
  }
});

// check檔案下載
const roomChecked = ref([]);

const roomDownloadCode = computed(() => {
  const downloadCodes = [];
  roomChecked.value.forEach((checked, index) => {
    if (checked) {
      downloadCodes.push(roomData.value.dbRoomFiles[index].verificationCode);
    }
  });
  return downloadCodes;
});

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

function handleRoomData(length) {
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
    roomDataFileSize.value.push(
      formatFileSize(roomData.value.dbRoomFiles[i].fileSize)
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

  return `${sizeValue} ${sizeUnit}`;
}

function showRoomContent(roomCode) {
  BoardUploadService.showRoomContent(roomCode).then((response) => {
    roomDataStatus.value = false;
    roomData.value = response.data;
    roomDataIsOwner.value = roomData.value.isRoomOwner;
    roomData.value.roomResponse.createTime = new Date(
      roomData.value.roomResponse.createTime
    ).toLocaleString();

    // 判斷是否有檔案
    if (roomData.value.dbRoomFiles.length > 0) {
      roomDataFileStatus.value = true;
      sidebarStatus.value = true;
      roomDataFileLength.value = roomData.value.dbRoomFiles.length;
      handleRoomData(roomDataFileLength.value);
      updataPageNumber();
      for (let i = 0; i < roomData.value.dbRoomFiles.length; i++) {
        roomChecked.value.push(false);
      }
    } else {
      roomDataFileStatus.value = false;
      sidebarStatus.value = false;
    }
  });
}
//
async function decryptMessage(encodedMessage, aesKey, iv) {
  const decodedData = atob(encodedMessage);
  const uint8Array = Uint8Array.from(decodedData, (c) => c.charCodeAt(0));
  return aesGcmDecrypt(uint8Array, aesKey, iv);
}
//
const messagesTimeStamps = ref([]);
async function chatGetNewMessages(roomCode) {
  await chatService.getNewMessages(roomCode).then(async (response) => {
    console.log(response.data);
    response.data.reverse();

    for (let i = 0; i < response.data.length; i++) {
      if (
        response.data[i].chatRoomMessage.sender === currentUser.value.username
      ) {
        messageSenderStatus.value.push(true);
      } else {
        messageSenderStatus.value.push(false);
      }
      messages.value.push(response.data[i]);
      let key = 0;
      const currentCount = messages.value[i].chatRoomMessage.userCurrentCount;
      if (historyAesKey.value.hasOwnProperty(currentCount)) {
        key = currentCount;
      } else {
        key = 1;
      }

      historyAesKey.value[1] = await digestMessage(
        generateSharedSecretKey(
          roomPrivateKey.value,
          roomPrivateKey.value
        ).toString()
      );
      const messageAesKey = historyAesKey.value[key];
      messages.value[i].chatRoomMessage.content = await decryptMessage(
        messages.value[i].chatRoomMessage.content,
        messageAesKey,
        roomInitVector.value
      );
      messagesTimeStamps.value[i] = new Date(
        messages.value[i].chatRoomMessage.timestamp
      ).toLocaleString();
    }
  });
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
const aesKey = ref(undefined);
const historyAesKey = ref([]);
const historyUserCurrentIndex = ref([]);
const historyRoomPrivateKey = ref(undefined);
const roomPublicKey = ref(undefined);
const roomPrivateKey = ref(undefined);
const roomSharedKey = ref(undefined);
const roomInitVector = ref(undefined);

function getHistoryKey() {
  BoardUploadService.getChatMessageHistorySharedKey(roomCode).then(
    async (response) => {
      historyUserCurrentIndex.value = Object.keys(response.data);
      console.log('response.data:', response.data);
      for (let i = 0; i < historyUserCurrentIndex.value.length; i++) {
        if (historyUserCurrentIndex.value[i] == 2) {
          historyRoomPrivateKey.value =
            response.data[historyUserCurrentIndex.value[i]];
        } else {
          historyRoomPrivateKey.value = generateSharedSecretKey(
            BigInt(response.data[historyUserCurrentIndex.value[i]]),
            roomPrivateKey.value
          );
        }
        historyAesKey.value[historyUserCurrentIndex.value[i]] =
          await digestMessage(historyRoomPrivateKey.value.toString());
      }
    }
  );
}

async function getRoomKeyInfo() {
  BoardUploadService.getChatMessageKeyAndIV(roomCode).then(async (response) => {
    roomPublicKey.value = BigInt(response.data.PublicKey);
    roomPrivateKey.value = BigInt(response.data.PrivateKey);
    roomInitVector.value = Uint8Array.from(
      atob(response.data.ChatRoomIV),
      (c) => c.charCodeAt(0)
    );
    roomSharedKey.value = generateSharedSecretKey(
      roomPublicKey.value,
      roomPrivateKey.value
    );
    aesKey.value = await digestMessage(roomSharedKey.value.toString());
  });
}

onMounted(() => {
  if (currentUser.value) {
    connect();
    setTimeout(() => {
      chatGetNewMessages(roomCode);
      joinMessage();
    }, 1000);
    getRoomKeyInfo();
    getHistoryKey();
  }
  setTimeout(() => {
    showRoomContent(roomCode);
    // chatGetNewMessages(roomCode);
    // joinMessage();
  }, 1000);
});

function handleDownloadFile() {
  for (let i = 0; i < roomDownloadCode.value.length; i++) {
    setTimeout(() => {
      downloadFile(roomDownloadCode.value[i]);
    }, 300 * (i + 1));
  }
}

async function downloadFile(code) {
  const url = API_URL + "/downloadRoomFileByCode/" + code;
  const a = document.createElement("a");
  a.href = url;
  a.download = "";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function updataPageNumber() {
  if (roomDataFileLength.value == 0) {
    roomDataPage.value = 1;
  } else {
    roomDataPage.value = Math.ceil(
      roomDataFileLength.value / roomDataNumber.value,
      0
    );
  }
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
    roomDataPageLength.value.push(i);
  }
  roomActiveTab.value = page;
}

// 更新聊天室訊息，並將畫面滾動至最底部
const scrollToBottom = () => {
  nextTick(() => {
    const contentElement = contentRef.value;
    contentElement.scrollTop = contentElement.scrollHeight;
  });
};

// chatRoom WebSocket
const roomChatStatus = ref(false);
function toggleRoomChatStatus(newStatus) {
  roomChatStatus.value = newStatus;
  scrollToBottom();
  // connect();
}
function handleDisconnect() {
  roomChatStatus.value = false;
  stompClient.disconnect();
}

const username = ref("");
const messageContent = ref("");
const messages = ref([]);
let stompClient = null;
const messageSenderStatus = ref([]);

const connect = () => {
  const socket = new WebSocket(socketURL);
  stompClient = webstomp.over(socket);
  stompClient.connect({}, onConnected, onError);
  username.value = currentUser.value.username;
  // scrollToBottom();
};

const onConnected = () => {
  stompClient.subscribe(`/topic/${roomCode}`, onMessageReceived);
};

const onError = (error) => {
  console.error(
    "Could not connect to WebSocket server. Please refresh this page to try again!",
    error
  );
};

const sendMessage = async () => {
  if (messageContent.value.trim() && stompClient) {
    const chatMessage = {
      sender: username.value,
      content: messageContent.value,
      type: "CHAT",
      roomCode: roomCode,
    };

    chatMessage.content = btoa(
      String.fromCharCode.apply(
        null,
        await aesGcmEncrypt(
          chatMessage.content,
          aesKey.value,
          roomInitVector.value
        )
      )
    );
    stompClient.send(
      `/app/chat.sendMessage/${roomCode}`,
      JSON.stringify(chatMessage),
      {}
    );
    messageContent.value = "";
  }
};

const onMessageReceived = async (payload) => {
  const message = JSON.parse(payload.body);
  if (message.isJoinedResponse.encrypt) {
    message.chatRoomMessage.content = await decryptMessage(
      message.chatRoomMessage.content,
      aesKey.value,
      roomInitVector.value
    );
    if (message.chatRoomMessage.sender === username.value) {
      messageSenderStatus.value.push(true);
    } else {
      messageSenderStatus.value.push(false);
    }
    messages.value.push(message);
    messagesTimeStamps.value.push(
      new Date(message.chatRoomMessage.timestamp).toLocaleString()
    );
    scrollToBottom();
  } else {
    if (!message.isJoinedResponse.joined) {
      setTimeout(() => {
        getRoomKeyInfo();
      }, 200);
    }
  }
};

const joinMessage = async () => {
  const chatMessage = {
    sender: username.value,
    content: username.value + "join the room",
    type: "JOIN",
    roomCode: roomCode,
  };

  stompClient.send(
    `/app/join.joinMessage/${roomCode}`,
    JSON.stringify(chatMessage),
    {}
  );
};

// 卷軸滾至最頂部時觸發
const sendMessageTime = ref("");
const sendMessageStatus = ref(false);
function handleScroll(e) {
  // 偵測卷軸是否在最頂部
  let contentScroll = e.srcElement;
  // 取得舊的卷軸高度
  let oldContentScrollHeight = contentScroll.scrollHeight;
  // 取得最舊的訊息時間
  sendMessageTime.value = messages.value[0].chatRoomMessage.timestamp;
  if (contentScroll.scrollTop === 0) {
    sendMessageStatus.value = true;
    setTimeout(async () => {
      await chatService
        .getMessages(roomCode, sendMessageTime.value)
        .then(async (response) => {
          for (let i = 0; i < response.data.length; i++) {
            if (
              response.data[i].chatRoomMessage.sender ===
              currentUser.value.username
            ) {
              messageSenderStatus.value.unshift(true);
            } else {
              messageSenderStatus.value.unshift(false);
            }
            messages.value.unshift(response.data[i]);

            let key = 0;
            const currentCount =
              messages.value[0].chatRoomMessage.userCurrentCount;
            if (historyAesKey.value.hasOwnProperty(currentCount)) {
              key = currentCount;
            } else {
              key = 1;
            }
            historyAesKey.value[1] = await digestMessage(
              generateSharedSecretKey(
                roomPrivateKey.value,
                roomPrivateKey.value
              ).toString()
            );
            const messageAesKey = historyAesKey.value[key];
            messages.value[0].chatRoomMessage.content = await decryptMessage(
              messages.value[0].chatRoomMessage.content,
              messageAesKey,
              roomInitVector.value
            );

            messagesTimeStamps.value.unshift(
              new Date(
                messages.value[0].chatRoomMessage.timestamp
              ).toLocaleString()
            );
          }
        });
      contentScroll.scrollTop =
        contentScroll.scrollHeight - oldContentScrollHeight;

      sendMessageStatus.value = false;
    }, 1000);
  }
}

// 加密測試
</script>

<template>
  <div v-if="createStatus">
    <CreateBoard @send-create-status="handleSendCreateStatus"></CreateBoard>
  </div>
  <div v-if="uploadStatus">
    <UploadBoard
      @send-upload-status="handleSendUploadStatus"
      :roomCode="roomCode"
    ></UploadBoard>
  </div>
  <div v-if="deleteStatus">
    <DeleteBoard
      @send-delete-status="handleSendDeleteStatus"
      :roomDownloadCode="roomDownloadCode"
    ></DeleteBoard>
  </div>

  <a class="downloadLink" ref="downloadLink"></a>

  <div class="room-board-container">
    <div
      class="room-board-chatRoom-message"
      @click="toggleRoomChatStatus(true)"
    >
      <img src="/src/assets/image/chatRoomLogo.png" alt="" />
    </div>
    <transition name="fade">
      <div class="room-board-chatRoom" v-if="roomChatStatus">
        <div class="room-board-chatRoom-top">
          <div class="room-board-chatRoom-title">
            <img
              :src="'data:image/png;base64,' + roomData.roomResponse.image"
              alt=""
            />
            <div>
              <h2>{{ roomData.roomResponse.title }}</h2>
              <h3>{{ roomData.roomResponse.description }}</h3>
            </div>
          </div>
          <div class="room-board-chatRoom-icon">
            <span @click="handleDisconnect()"
              ><font-awesome-icon icon="xmark"
            /></span>
          </div>
        </div>
        <div
          class="room-board-chatRoom-content"
          ref="contentRef"
          @scroll="handleScroll($event)"
        >
          <div class="loader" v-if="sendMessageStatus"></div>
          <div>
            <div
              v-for="(message, index) in messages"
              :key="index"
              :class="
                messageSenderStatus[index]
                  ? 'room-board-chatRoom-self'
                  : 'room-board-chatRoom-receive'
              "
            >
              <div v-if="!messageSenderStatus[index]">
                <img
                  :src="`data:image/png;base64,${message.senderImage}`"
                  alt=""
                />
                <div :data-timestamp="messagesTimeStamps[index]">
                  {{ message.chatRoomMessage.content }}
                  <p class="room-board-chatRoom-receive-ID">
                    {{ message.chatRoomMessage.sender }}
                  </p>
                </div>
              </div>
              <p v-else :data-timestamp="messagesTimeStamps[index]">
                {{ message.chatRoomMessage.content }}
              </p>
            </div>
          </div>
        </div>
        <div class="room-board-chatRoom-send">
          <span class="room-board-chatRoom-clip"
            ><font-awesome-icon icon="paperclip"
          /></span>
          <div class="room-board-chatRoom-input">
            <label for="message"></label>
            <input
              type="text"
              name="message"
              id="message"
              v-model="messageContent"
              @keyup.enter="sendMessage()"
              :disabled="!currentUser"
            />
            <div v-if="!currentUser">Ban messages.</div>
          </div>
          <span @click="sendMessage()" class="room-board-chatRoom-plane"
            ><font-awesome-icon :icon="['far', 'paper-plane']"
          /></span>
        </div>
      </div>
    </transition>

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
          <div><font-awesome-icon icon="circle-down" /></div>
          <span>Download File</span>
        </div>
        <div v-if="roomDataIsOwner">
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
    </div>

    <div class="room-board-content">
      <pre>佈告欄 / 房間</pre>

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
          <div v-if="sidebarStatus">
            <button @click="handleDownloadFile()">下載</button>
            <button
              class="room-board-delete"
              @click="handleSendDeleteStatus(true)"
              v-if="currentUser"
            >
              刪除
            </button>
            <button @click="selectAllRooms()">全選</button>
            <button @click="toggleSidebarStatus()">取消</button>
          </div>
        </div>

        <div class="room-board-file" v-if="roomDataStatus">
          <div
            class="room-board-main-room"
            v-for="(roomFile, index) in roomLoadingCode"
            :key="index"
          >
            <div class="room-board-main-room-number">
              <span><font-awesome-icon :icon="['far', 'file']" /></span>
              <div class="room-board-main-loading-text">
                <p><i class="flash-across"></i></p>
                <p><i class="flash-across"></i></p>
              </div>
            </div>
            <div
              class="room-board-main-room-description room-board-main-loading-description"
            >
              <p><i class="flash-across"></i></p>
              <p class="loading-text-210"><i class="flash-across"></i></p>
              <p class="loading-text-260"><i class="flash-across"></i></p>
            </div>
            <p class="room-board-main-room-date room-board-main-loading-date">
              <i class="flash-across"></i>
            </p>
          </div>
        </div>

        <!--  -->

        <div v-else>
          <div class="room-board-file" v-if="roomDataFileStatus">
            <div
              class="room-board-main-room"
              v-for="(roomFile, index) in roomDataPageLength"
              :key="index"
            >
              <p class="room-board-main-room-check" v-if="sidebarStatus">
                <label :for="'checkbox' + roomFile">
                  <input
                    type="checkbox"
                    :id="'checkbox' + roomFile"
                    :checked="roomChecked[roomFile]"
                    @change="handleRoomCheckboxToggle(roomFile)"
                  />
                  <span
                    ><font-awesome-icon :icon="ckRoomIcon[roomFile]"
                  /></span>
                </label>
              </p>
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
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "../../assets/styles/layout/board/roomBoard";

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

.downloadLink {
  display: none;
}

.room-board-main-room-check {
  position: absolute;
  top: 6px;
  right: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 22px;
  padding-top: 2px;
  color: #767676;
  cursor: pointer;

  span {
    padding: 3px 5px 2px;
    border-radius: 5px;
    transition: all 0.2s;

    &:hover {
      background-color: rgba(114, 114, 118, 0.174);
    }
  }

  label {
    cursor: pointer;
  }

  input[type="checkbox"] {
    display: none;
  }
}
</style>
