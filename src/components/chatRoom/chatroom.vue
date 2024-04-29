<script setup>
import { ref, onMounted, computed, nextTick, watch } from "vue";
import { useAuthStore } from "../../stores/auth.module";
import { useRouter } from "vue-router";
import webstomp from "webstomp-client";
import chatService from "../../services/chatService";
import BoardUploadService from "../boardUploadService/BoardRoom.js";
import createSecretRoom from "./createSecretRoom.vue";
import API_URL from "../../services/API_URL";
import { encryptMessage, decrypt } from "../cryptoUtils/CryptoUtils";

const authStore = useAuthStore();
const router = useRouter();

// 取得使用者資料
const currentUser = computed(() => {
  return authStore.dataStatus.user;
});

// 取得使用者頭像
const currentUserImage = computed(() => {
  if (currentUser.value.profileImageBase64 == undefined) {
    return getDefaultImageUrl();
  } else {
    return `data:image/png;base64,${currentUser.value.profileImageBase64}`;
  }
});

// 取得預設頭像
const getDefaultImageUrl = () => {
  return new URL(`../../assets/image/User.png`, import.meta.url).href;
};

const chatIconType = {
  COMMENTS: "COMMENTS",
  COMMENT: "COMMENT",
  GEAR: "GEAR",
};

const activeTab = ref(chatIconType.COMMENTS);
const handleTabClick = (tab) => {
  activeTab.value = tab;
  chatGetMessageByUser();
};

const messagesTimeStamps = ref([]);
const messagesStatus = ref(false);
const chatRoomInfoStatus = ref(false);
async function chatGetNewMessages(roomCode) {
  await chatService.getNewChatMessages(roomCode).then((response) => {
    response.data.reverse();
    messages.value = [];
    messageSenderStatus.value = [];
    messagesTimeStamps.value = [];
    messageSenderStatus.value = response.data.map(
      (message) => message.chatRoomMessage.sender === currentUser.value.username
    );
    messages.value = response.data.map((message) => ({
      ...message,
      chatRoomMessage: {
        ...message.chatRoomMessage,
        content: decrypt(message.chatRoomMessage.content),
      },
    }));
    messagesTimeStamps.value = response.data.map((message) =>
      formatTime(message.chatRoomMessage.timestamp)
    );
    messagesStatus.value = true;
    if (activeTab.value === chatIconType.COMMENTS) {
      chatRoomInfoStatus.value = true;
    } else {
      chatRoomInfoStatus.value = false;
    }
  });
  scrollToBottom();
}

// 更新聊天室訊息，並將畫面滾動至最底部
const contentRef = ref(null);
const scrollToBottom = () => {
  nextTick(() => {
    const contentElement = contentRef.value;
    if (contentElement) {
      contentElement.scrollTop = contentElement.scrollHeight;
    }
  });
};

const username = ref("");
const messageContent = ref("");
const messages = ref([]);
let stompClient = false;
const messageSenderStatus = ref([]);
const chatRoomCode = ref("");

const connect = async () => {
  // const socket = new WebSocket('wss://imbig404.com/websocket');
  const socket = new WebSocket("ws://localhost:8088/websocket");
  stompClient = webstomp.over(socket);
  stompClient.connect({}, onConnected, onError);
  username.value = currentUser.value.username;
  scrollToBottom();
};

const onConnected = () => {
  stompClient.subscribe(`/topic/${chatRoomCode.value}`, onMessageReceived);
};

const onError = (error) => {
  console.error(
    "Could not connect to WebSocket server. Please refresh this page to try again!",
    error
  );
};

const sendMessage = () => {
  if (messageContent.value.trim() && stompClient) {
    const chatMessage = {
      sender: username.value,
      content: messageContent.value,
      type: "CHAT",
      roomCode: chatRoomCode.value,
    };
    chatMessage.content = encryptMessage(chatMessage.content);
    stompClient.send(
      `/app/chat.sendMessage/${chatRoomCode.value}`,
      JSON.stringify(chatMessage),
      {}
    );
    messageContent.value = "";
  }
};

const onMessageReceived = (payload) => {
  const message = JSON.parse(payload.body);
  message.chatRoomMessage.content = decrypt(message.chatRoomMessage.content);
  if (message.chatRoomMessage.sender === username.value) {
    messageSenderStatus.value.push(true);
  } else {
    messageSenderStatus.value.push(false);
  }
  messages.value.push(message);
  const roomToUpdate = chatRoomInfo.value.find(
    (room) => room.chatRoomCode === chatRoomCode.value
  );
  if (roomToUpdate) {
    roomToUpdate.chatRoomMessage = message.chatRoomMessage.content;
    roomToUpdate.chatRoomTime = message.chatRoomMessage.timestamp;
    roomToUpdate.formattedTime = formatTime(message.chatRoomMessage.timestamp);
  }
  messagesTimeStamps.value.push(formatTime(message.chatRoomMessage.timestamp));
  chatRoomInfoSort();
  scrollToBottom();
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
        .getMessages(chatRoomCode.value, sendMessageTime.value)
        .then((response) => {
          response.data.forEach((message) => {
            if (message.chatRoomMessage.sender === currentUser.value.username) {
              messageSenderStatus.value.unshift(true);
            } else {
              messageSenderStatus.value.unshift(false);
            }
            messages.value.unshift({
              ...message,
              chatRoomMessage: {
                ...message.chatRoomMessage,
                content: decrypt(message.chatRoomMessage.content),
              },
            });
            messagesTimeStamps.value.unshift(
              formatTime(message.chatRoomMessage.timestamp)
            );
          });
        });
      contentScroll.scrollTop =
        contentScroll.scrollHeight - oldContentScrollHeight;
      sendMessageStatus.value = false;
    }, 1000);
  }
}

// 聊天室最新訊息更新
function handleChatRoomTopInfo(roomCode) {
  chatRoomInfo.value.forEach((room) => {
    if (room.chatRoomCode === roomCode) {
      chatRoomTopInfo.value = {
        roomCode: room.chatRoomCode,
        roomDescription: room.chatRoomDescription,
        roomImage: room.chatRoomImage,
        roomType: room.chatRoomType,
      };
    }
  });
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

// 聊天室檔案資訊
const chatRoomFilesInfo = ref([]);
async function ChatRoomGetFileInfo(roomCode) {
  await chatService.getFileInfoByRoomCode(roomCode).then(({ data }) => {
    const { fileNameResponse, boardType } = data;
    chatRoomFilesInfo.value = {
      boardType: boardType === "BULLETIN_BOARD" ? "RoomBoard" : "WorkRoomBoard",
      fileNameResponse: fileNameResponse.map((file) => ({
        ...file,
        fileSize: formatFileSize(file.fileSize),
        formattedTime: new Date(file.createdAt).toLocaleString(),
      })),
    };
    chatRoomFilesInfo.value.fileNameResponse.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  });
}

// 下載檔案
async function charRoomFileDownload(index) {
  const fileCode =
    chatRoomFilesInfo.value.fileNameResponse[index].verificationCode;
  const url = `${API_URL}/downloadRoomFileByCode/${fileCode}`;
  console.log(fileCode);
  const a = document.createElement("a");
  a.href = url;
  a.download = "";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// 舊款程式碼
// function ChatRoomGetFileInfo(roomCode) {
//   chatService.getFileInfoByRoomCode(roomCode).then((response) => {
//     chatRoomFilesInfo.value = response.data;
//     chatRoomFilesInfo.value.fileNameResponse.sort(
//       (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
//     );
//     chatRoomFilesInfo.value.fileNameResponse.forEach((file) => {
//       file.fileSize = formatFileSize(file.fileSize);
//       file.formattedTime = new Date(file.createdAt).toLocaleString();
//     });
//     chatRoomFilesInfo.value.boardType === "BulletinBoard"
//       ? (chatRoomFilesInfo.value.boardType = "BulletinBoard")
//       : (chatRoomFilesInfo.value.boardType = "WorkRoomBoard");
//   });
// }

const activeChatRoomIndex = ref(undefined);
async function handleClickChatRoom(roomCode) {
  if (stompClient) {
    stompClient.disconnect();
  }
  chatRoomCode.value = roomCode;
  connect();
  await chatGetNewMessages(roomCode);
  ChatRoomGetFileInfo(roomCode);
  handleChatRoomTopInfo(roomCode);
  activeChatRoomIndex.value = roomCode;
}

const chatRoomInfo = ref({});
const chatRoomTopInfo = ref({});

// 聊天室資訊排序
function chatRoomInfoSort() {
  chatRoomInfo.value.sort((a, b) => {
    return new Date(b.chatRoomTime) - new Date(a.chatRoomTime);
  });
}

function formatTime(time) {
  return new Date(time).toLocaleString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

async function chatGetMessageByUser() {
  if (activeTab.value === chatIconType.COMMENTS) {
    await chatService.getMessageByUser().then((response) => {
      chatRoomInfo.value = response.data.map((message) => ({
        ...message,
        chatRoomMessage: decrypt(message.chatRoomMessage),
        formattedTime: formatTime(message.chatRoomTime),
      }));
      chatRoomInfoSort();
    });
  } else {
    await chatService.getSecretMessageByUser().then((response) => {
      chatRoomInfo.value = response.data.map((message) => ({
        ...message,
        chatRoomMessage: decrypt(message.chatRoomMessage),
        formattedTime: formatTime(message.chatRoomTime),
      }));
      chatRoomInfoSort();
    });
  }
}

onMounted(() => {
  chatGetMessageByUser();
});

async function chatRoomAccessRoom() {
  try {
    if (chatRoomTopInfo.value.roomType === "PRIVATE") {
      const response = await BoardUploadService.verifyCookie(
        chatRoomTopInfo.value.roomCode
      );
      if (response.status === 200) {
        router.push({
          name: `${chatRoomFilesInfo.value.boardType}`,
          params: { roomCode: chatRoomTopInfo.value.roomCode },
        });
      }
    } else {
      await BoardUploadService.accessRoom(
        "",
        chatRoomTopInfo.value.roomCode,
        "PUBLIC"
      );
      router.push({
        name: `${chatRoomFilesInfo.value.boardType}`,
        params: { roomCode: chatRoomTopInfo.value.roomCode },
      });
    }
  } catch (error) {
    console.log(error);
    alert("Access denied");
  }
}

// ----------------------------------------測試-----------------------------------
// // 假設 DH 演算法生成的共享密鑰是一個數字
// const sharedKey = 123456;

// // 定義一個函數來將數字密鑰轉換為 AES 加密算法所需的字串密鑰
// function convertToAESKey(sharedKey) {
//   // 使用 SHA-256 哈希函數作為 KDF
//   const hash = CryptoJS.SHA256(sharedKey.toString());
//   // 將 SHA-256 哈希值轉換為字串形式作為 AES 密鑰
//   const aesKey = hash.toString(CryptoJS.enc.Hex).substring(0, 32); // AES 密鑰需要 256 位，即 32 字節
//   return aesKey;
// }

// // 將 DH 共享密鑰轉換為 AES 加密算法所需的字串密鑰
// const aesKey = convertToAESKey(sharedKey);

// // console.log("AES Key:", aesKey);

// function generateKey(num) {
//   let library =
//     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//   let key = "";
//   for (let i = 0; i < num; i++) {
//     let randomPoz = Math.floor(Math.random() * library.length);
//     key += library.substring(randomPoz, randomPoz + 1);
//   }
//   return key;
// }


// console.log("Test: ", encryptMessage("Hello World!"));
// console.log(decrypt("+VNT0XaJEhtsdKbS8un/Yg=="));

// console.log(encryptMessage(JSON.stringify(par2)));
// console.log(decrypt(encryptMessage(JSON.stringify(par2))));
// ----------------------------------------測試-----------------------------------

const createStatus = ref(false);
function handleSendCreateStatus(newStatus) {
  if (currentUser.value !== null) {
    createStatus.value = newStatus;
  } else {
    return alert("Please login first.");
  }
}

async function handleSendCreateCode(code) {
  chatRoomCode.value = code;
  await connect();
  messageContent.value = `${username.value} create a new secret room.`;
  await new Promise((resolve) => setTimeout(resolve, 300));
  sendMessage();
  activeTab.value = chatIconType.COMMENT;
  chatGetMessageByUser();
  handleSendCreateStatus(false);
}
</script>

<template>
  <div v-if="createStatus">
    <createSecretRoom
      @send-create-status="handleSendCreateStatus"
      @send-create-code="handleSendCreateCode"
    ></createSecretRoom>
  </div>
  <div class="chatroom-container">
    <div class="chatroom-sidebar">
      <span><font-awesome-icon icon="bars-staggered" /></span>
      <span
        :class="[{ 'chatroom-sidebar-click': activeTab === 'COMMENTS' }]"
        @click="handleTabClick('COMMENTS')"
        ><font-awesome-icon :icon="['far', 'comments']"
      /></span>
      <span
        :class="[{ 'chatroom-sidebar-click': activeTab === 'COMMENT' }]"
        @click="handleTabClick('COMMENT')"
        ><font-awesome-icon icon="comment"
      /></span>
      <span @click="handleSendCreateStatus(true)"
        ><font-awesome-icon icon="comment-medical"
      /></span>
      <span
        :class="[{ 'chatroom-sidebar-click': activeTab === 'GEAR' }]"
        @click="handleTabClick('GEAR')"
        ><font-awesome-icon icon="gear"
      /></span>
    </div>
    <div class="chatroom-user">
      <div class="chatroom-user-info">
        <div class="chatroom-user-image">
          <img :src="currentUserImage" alt="" />
        </div>
        <h2>{{ currentUser.username }}</h2>
        <p>小時候寫作文都是扶老人，現在想想，我當年膽子真大阿。</p>
        <div class="chatroom-line"></div>
      </div>
      <div class="chatroom-user-chats">
        <h2>Chats</h2>
        <div
          class="chatroom-user-message"
          v-for="(chatRoom, index) in chatRoomInfo"
          @click="handleClickChatRoom(chatRoom.chatRoomCode)"
          :class="{
            'active-chatroom': chatRoom.chatRoomCode === activeChatRoomIndex,
          }"
        >
          <div class="chatroom-user-message-text">
            <img
              :src="'data:image/png;base64,' + chatRoom.chatRoomImage"
              alt=""
            />
            <div>
              <h3>{{ chatRoom.chatRoomTitle }}</h3>
              <p>{{ chatRoom.chatRoomMessage }}</p>
            </div>
          </div>
          <div class="chatroom-user-message-date">
            <p>{{ chatRoom.formattedTime }}</p>
          </div>
          <div class="chatroom-line"></div>
        </div>
      </div>
    </div>
    <div></div>
    <div class="chatroom-message" v-if="messagesStatus">
      <div class="chatroom-message-search">
        <span><font-awesome-icon icon="fa-solid fa-magnifying-glass" /></span>
        <label for="search"></label>
        <input
          type="text"
          name="search"
          id="search"
          placeholder="Search"
          autocomplete="off"
        />
      </div>
      <h2>{{ chatRoomTopInfo.roomCode }}</h2>
      <h4>{{ chatRoomTopInfo.roomDescription }}</h4>
      <div
        class="chatroom-message-content"
        ref="contentRef"
        @scroll="handleScroll($event)"
      >
        <div class="loader" v-if="sendMessageStatus"></div>
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="
            messageSenderStatus[index]
              ? 'chatroom-message-self'
              : 'chatroom-message-receive'
          "
        >
          <div v-if="!messageSenderStatus[index]">
            <div class="chatroom-message-ID">
              {{ message.chatRoomMessage.sender }}
            </div>
            <p>
              {{ message.chatRoomMessage.content }}
              <span>
                {{ messagesTimeStamps[index] }}
              </span>
            </p>
          </div>
          <p v-else>
            {{ message.chatRoomMessage.content
            }}<span>
              {{ messagesTimeStamps[index] }}
            </span>
          </p>
        </div>
      </div>

      <div class="chatroom-message-send">
        <span class="chatroom-message-send-clip"
          ><font-awesome-icon icon="paperclip"
        /></span>
        <div class="chatroom-message-send-input">
          <label for="message"></label>
          <input
            type="text"
            name="message"
            id="message"
            autocomplete="off"
            @keyup.enter="sendMessage()"
            v-model="messageContent"
          />
        </div>
        <div class="chatroom-message-send-plane" @click="sendMessage()">
          <p>Send</p>
          <span><font-awesome-icon :icon="['far', 'paper-plane']" /></span>
        </div>
      </div>
    </div>
    <div class="chatroom-message" v-else>
      <div class="chatroom-message-wait">
        <span class="chatroom-message-wait-icon">
          <font-awesome-icon icon="message" />
        </span>
        <span>Message</span>
      </div>
    </div>
    <div class="chatroom-group" v-if="chatRoomInfoStatus">
      <div class="chatroom-group-info">
        <div class="chatroom-group-image">
          <img
          :src="chatRoomTopInfo.roomImage ? 'data:image/png;base64,' + chatRoomTopInfo.roomImage : ''"
            alt=""
          />
        </div>
        <h2>{{ chatRoomTopInfo.roomCode }}</h2>
        <p>{{ chatRoomTopInfo.roomDescription }}</p>
        <div class="chatroom-group-display">
          <div class="chatroom-group-room-link">
            <span @click="chatRoomAccessRoom()"
              ><font-awesome-icon icon="house"
            /></span>
            <p>Room</p>
          </div>
        </div>
        <div class="chatroom-line"></div>
      </div>
      <div class="chatroom-group-shared">
        <h2>Shared Files <span>(Click to download file.)</span></h2>

        <div
          class="chatroom-group-shared-file"
          v-for="(chatFile, index) in chatRoomFilesInfo.fileNameResponse"
          :key="index"
          @click="charRoomFileDownload(index)"
        >
          <div class="chatroom-group-file-info">
            <span>
              <font-awesome-icon :icon="['far', 'file']" />
            </span>
            <div>
              <h3>{{ chatFile.fileName }}</h3>
              <p>{{ chatFile.formattedTime }}</p>
            </div>
          </div>
          <p>{{ chatFile.fileSize }}</p>
          <div class="chatroom-file-line"></div>
        </div>
      </div>
    </div>
  </div>
  <a class="downloadLink" ref="downloadLink"></a>
</template>

<style scoped lang="scss">
@import "@/assets/styles/layout/chatroom.scss";
.downloadLink {
  display: none;
}
</style>
