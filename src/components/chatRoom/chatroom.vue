<script setup>
import { ref, onMounted, computed, nextTick, watch } from "vue";
import { useAuthStore } from "../../stores/auth.module";
import { useRouter } from "vue-router";
import webstomp from "webstomp-client";
import chatService from "../../services/chatService";
import BoardUploadService from "../boardUploadService/BoardRoom.js";
import createSecretRoom from "./createSecretRoom.vue";
import searchChatRoom from "./searchChatRoom.vue";
import API_URL from "../../services/API_URL";
import socketURL from "../../services/webSocket_URL";
import {
  aesGcmDecrypt,
  aesGcmEncrypt,
  digestMessage,
  generatePrivateKey,
  generatePublicKey,
  generateSharedSecretKey,
} from "../cryptoUtils/DH-Crypto.js";

const authStore = useAuthStore();
const router = useRouter();

// 取得使用者資料
const currentUser = computed(() => {
  return authStore.dataStatus.user;
});

// 取得使用者頭像
const currentUserImage = computed(() => {
  if (currentUser.value.profileImage == undefined) {
    return getDefaultImageUrl();
  } else {
    return `data:image/png;base64,${currentUser.value.profileImage}`;
  }
});

// 取得預設頭像
const getDefaultImageUrl = () => {
  return new URL(`../../assets/image/User.png`, import.meta.url).href;
};

const chatIconType = {
  COMMENTS: "COMMENTS",
  COMMENT: "COMMENT",
};

const activeTab = ref(chatIconType.COMMENTS);
const handleTabClick = (tab) => {
  activeTab.value = tab;
  chatGetMessageByUser();
};

async function getHistoryKey(roomCode) {
  await chatService
    .getChatMessageHistorySharedKey(roomCode)
    .then(async (response) => {
      const targetKey = roomUserKey.value.find(
        (key) => key.roomCode === roomCode
      );

      if (targetKey) {
        historyRoomPrivateKey.value = targetKey.userPrivateKey;
        historyInitVector.value = targetKey.userVector;
      }

      historyUserCurrentIndex.value = Object.keys(response.data);
      for (let i = 0; i < historyUserCurrentIndex.value.length; i++) {
        if (historyUserCurrentIndex.value[i] == 2) {
          historyRoomSharedKey.value =
            response.data[historyUserCurrentIndex.value[i]];
        } else {
          historyRoomSharedKey.value = generateSharedSecretKey(
            BigInt(response.data[historyUserCurrentIndex.value[i]]),
            historyRoomPrivateKey.value
          );
        }
        historyAesKey.value[historyUserCurrentIndex.value[i]] =
          await digestMessage(historyRoomSharedKey.value.toString());
      }
      console.log("historyAesKey", historyAesKey.value);
    });
}

async function decryptMessage2(encodedMessage, aesKey, iv) {
  const decodedData = atob(encodedMessage);
  const uint8Array = Uint8Array.from(decodedData, (c) => c.charCodeAt(0));
  return aesGcmDecrypt(uint8Array, aesKey, iv);
}

const messagesTimeStamps = ref([]);
const messagesStatus = ref(false);
const chatRoomInfoStatus = ref(false);
async function chatGetNewMessages(roomCode) {
  await chatService.getNewChatMessages(roomCode).then(async (response) => {

    response.data.reverse();
    messages.value = [];
    messageSenderStatus.value = [];
    messagesTimeStamps.value = [];
    messageSenderStatus.value = response.data.map(
      (message) => message.chatRoomMessage.sender === currentUser.value.username
    );

    for (let i = 0; i < response.data.length; i++) {
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
          historyRoomPrivateKey.value,
          historyRoomPrivateKey.value
        ).toString()
      );
      console.log("historyRoomPrivateKey", historyRoomPrivateKey.value);

      const messageAesKey = historyAesKey.value[key];
      messages.value[i].chatRoomMessage.content = await decryptMessage2(
        messages.value[i].chatRoomMessage.content,
        messageAesKey,
        historyInitVector.value
      );
    }

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
  const socket = new WebSocket(socketURL);
  stompClient = webstomp.over(socket);
  stompClient.connect({}, onConnected, onError);
  username.value = currentUser.value.username;
  scrollToBottom();
};

const onConnected = () => {
  stompClient.subscribe(`/topic/${chatRoomCode.value}`, onMessageReceived);
};
// joinMessage
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
      roomCode: chatRoomCode.value,
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
      `/app/chat.sendMessage/${chatRoomCode.value}`,
      JSON.stringify(chatMessage),
      {}
    );
    messageContent.value = "";
  }
};

const onMessageReceived = async (payload) => {
  const message = JSON.parse(payload.body);
  if (message.isJoinedResponse.encrypt) {
    message.chatRoomMessage.content = await decryptMessage2(
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
    const roomToUpdate = chatRoomInfo.value.find(
      (room) => room.chatRoomCode === chatRoomCode.value
    );
    if (roomToUpdate) {
      roomToUpdate.chatRoomMessage = message.chatRoomMessage.content;
      roomToUpdate.chatRoomTime = message.chatRoomMessage.timestamp;
      roomToUpdate.formattedTime = formatTime(
        message.chatRoomMessage.timestamp
      );
    }
    messagesTimeStamps.value.push(
      formatTime(message.chatRoomMessage.timestamp)
    );
    chatRoomInfoSort();
    scrollToBottom();
  } else {
    if (!message.isJoinedResponse.joined) {
      setTimeout(() => {
        getRoomKeyInfo(chatRoomCode.value);
      }, 200);
    }
  }
};

const joinMessage = async () => {
  const chatMessage = {
    sender: username.value,
    content: username.value + "join the room",
    type: "JOIN",
    roomCode: chatRoomCode.value,
  };

  stompClient.send(
    `/app/join.joinMessage/${chatRoomCode.value}`,
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
        .getMessages(chatRoomCode.value, sendMessageTime.value)
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
                historyRoomPrivateKey.value,
                historyRoomPrivateKey.value
              ).toString()
            );
            const messageAesKey = historyAesKey.value[key];
            messages.value[0].chatRoomMessage.content = await decryptMessage2(
              messages.value[0].chatRoomMessage.content,
              messageAesKey,
              roomInitVector.value
            );

            messagesTimeStamps.value.unshift(
              formatTime(messages.value[0].chatRoomMessage.timestamp)
            );
          }
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
async function chatRoomFileDownload(index) {
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

const activeChatRoomIndex = ref(undefined);
async function handleClickChatRoom(roomCode) {
  if (stompClient) {
    stompClient.disconnect();
  }
  chatRoomCode.value = roomCode;
  connect();
  await getHistoryKey(roomCode);
  await chatGetNewMessages(roomCode);
  getRoomKeyInfo(roomCode);
  ChatRoomGetFileInfo(roomCode);
  handleChatRoomTopInfo(roomCode);
  activeChatRoomIndex.value = roomCode;
  setTimeout(() => {
    joinMessage();
  }, 200);
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

// 取得佈告欄與作業版中的使用者聊天室訊息
async function getMessageByUser() {
  chatService.getMessageByUser().then(async (response) => {
    const keyMap = new Map(roomUserKey.value.map((key) => [key.roomCode, key]));

    const decryptMessages = response.data.map(async (message) => {
      const roomUserKeyObject = keyMap.get(message.chatRoomCode);
      // console.log("roomUserKeyObject", roomUserKeyObject);
      if (roomUserKeyObject) {
        message.chatRoomMessage = await decryptMessage(
          message.chatRoomMessage,
          roomUserKeyObject
        );
      }
      return {
        ...message,
        formattedTime: formatTime(message.chatRoomTime),
      };
    });
    chatRoomInfo.value = await Promise.all(decryptMessages);

    chatRoomInfoSort();
  });
}

// 取得私密聊天室中的使用者聊天室訊息
async function getSecretMessageByUser() {
  chatService.getSecretMessageByUser().then(async (response) => {
    const keyMap = new Map(roomUserKey.value.map((key) => [key.roomCode, key]));
    console.log("keyMap", keyMap);
    const decryptMessages = response.data.map(async (message) => {
      const roomUserKeyObject = keyMap.get(message.chatRoomCode);
      if (roomUserKeyObject) {
        message.chatRoomMessage = await decryptMessage(
          message.chatRoomMessage,
          roomUserKeyObject
        );
      }
      return {
        ...message,
        formattedTime: formatTime(message.chatRoomTime),
      };
    });
    chatRoomInfo.value = await Promise.all(decryptMessages);
    chatRoomInfoSort();
  });
}

// 當點擊側邊 bar 時，根據是否為私密或多人公開聊天室，來取得使用者的聊天室訊息
async function chatGetMessageByUser() {
  if (activeTab.value === chatIconType.COMMENTS) {
    await getSharedKeysByUser("PUBLIC");
    await getMessageByUser();
  } else {
    await getSharedKeysByUser("SECRET");
    await getSecretMessageByUser();
  }
}

// 將訊息解密
async function decryptMessage(encodedMessage, keyObject) {
  const decodedData = atob(encodedMessage);
  const uint8Array = Uint8Array.from(decodedData, (c) => c.charCodeAt(0));
  return aesGcmDecrypt(uint8Array, keyObject.userAesKey, keyObject.userVector);
}

// 根據房間類型取得使用者的共享金鑰
async function getSharedKeysByUser(roomType) {
  try {
    roomUserKey.value = [];
    const response = await chatService.getSharedKeysByUser(roomType);
    console.log("response", response);
    for (const key of response.data) {
      let roomSharedKey = "";

      roomSharedKey = generateSharedSecretKey(
        BigInt(key.userPublicKey),
        BigInt(key.userPrivateKey)
      ).toString();

      console.log("roomUserPublicKey", key.userPublicKey);
      console.log("roomUserPrivateKey", key.userPrivateKey);

      const roomUserKeyObject = {
        roomCode: key.roomCode,
        userPrivateKey: BigInt(key.userPrivateKey),
        userAesKey: await digestMessage(roomSharedKey),
        userVector: Uint8Array.from(atob(key.roomVector), (c) =>
          c.charCodeAt(0)
        ),
      };
      roomUserKey.value.push(roomUserKeyObject);
    }
    console.log("roomUserKey", roomUserKey.value);
  } catch (error) {
    console.error("Error in getSharedKeysByUser:", error);
  }
}

const aesKey = ref(undefined);
const historyAesKey = ref([]);
const historyUserCurrentIndex = ref([]);
const historyRoomPrivateKey = ref(undefined);
const historyRoomSharedKey = ref(undefined);
const historyInitVector = ref(undefined);
const roomPublicKey = ref(undefined);
const roomPrivateKey = ref(undefined);
const roomSharedKey = ref(undefined);
const roomInitVector = ref(undefined);
const roomUserKey = ref([]);

// 根據 roomCodd 取得房間的金鑰資訊
async function getRoomKeyInfo(roomCode) {
  chatService.getChatMessageKeyAndIV(roomCode).then(async (response) => {
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

onMounted(async () => {
  setTimeout(() => {
    chatGetMessageByUser();
  }, 1000);
});

// 進入聊天室的判斷
async function chatRoomAccessRoom() {
  const roomPrivateKey = generatePrivateKey();
  const roomPublicKey = generatePublicKey(roomPrivateKey);
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
        "PUBLIC",
        roomPublicKey,
        roomPrivateKey
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

const createStatus = ref(false);
function handleSendCreateStatus(newStatus) {
  if (currentUser.value !== null) {
    createStatus.value = newStatus;
  } else {
    return alert("Please login first.");
  }
}

async function handleSendCreateCode(chatKeyData) {
  chatRoomCode.value = chatKeyData.roomCode;
  await connect();

  aesKey.value = chatKeyData.aseKey;
  roomInitVector.value = chatKeyData.roomInitVector;

  messageContent.value = `${username.value} create a new secret room.`;
  await new Promise((resolve) => setTimeout(resolve, 300));
  sendMessage();
  activeTab.value = chatIconType.COMMENT;
  await getSharedKeysByUser("SECRET");
  chatGetMessageByUser();
  handleSendCreateStatus(false);
  // getRoomKeyInfo(chatRoomCode.value);
}

const searchChatRoomStatus = ref(false);
function handleSendSearchStatus(newStatus) {
  if (currentUser.value !== null) {
    searchChatRoomStatus.value = newStatus;
  } else {
    return alert("Please login first.");
  }
}

function handleSendSearchAccess(status) {
  if (status) {
    activeTab.value = chatIconType.COMMENT;
    chatGetMessageByUser();
  } else {
    return alert("Room code is incorrect.");
  }
}
</script>

<template>
  <div v-if="createStatus">
    <createSecretRoom
      @send-create-status="handleSendCreateStatus"
      @send-create-code="handleSendCreateCode"
    ></createSecretRoom>
  </div>
  <div v-if="searchChatRoomStatus">
    <searchChatRoom
      @send-search-status="handleSendSearchStatus"
      @send-search-access="handleSendSearchAccess"
    ></searchChatRoom>
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
      <span @click="handleSendSearchStatus(true)"
        ><font-awesome-icon icon="magnifying-glass"
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
            :src="
              chatRoomTopInfo.roomImage
                ? 'data:image/png;base64,' + chatRoomTopInfo.roomImage
                : ''
            "
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
          @click="chatRoomFileDownload(index)"
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
