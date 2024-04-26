<script setup>
import { ref, onMounted, computed, nextTick } from "vue";
import CryptoJS from "crypto-js";
import { useAuthStore } from "../../stores/auth.module";
import webstomp from "webstomp-client";
import chatService from "../../services/chatService";

const authStore = useAuthStore();

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
  COMMENT: "COMMENT",
  GEAR: "GEAR",
};

const activeTab = ref(chatIconType.COMMENT);

const handleTabClick = (tab) => {
  activeTab.value = tab;
};

const messagesTimeStamps = ref([]);
const messagesStatus = ref(false);
async function chatGetNewMessages(roomCode) {
  await chatService.getNewMessages(roomCode).then((response) => {
    response.data.reverse();
    messages.value = [];
    for (let i = 0; i < response.data.length; i++) {
      if (
        response.data[i].chatRoomMessage.sender === currentUser.value.username
      ) {
        messageSenderStatus.value.push(true);
      } else {
        messageSenderStatus.value.push(false);
      }
      messages.value.push(response.data[i]);
      messagesTimeStamps.value[i] = new Date(
        messages.value[i].chatRoomMessage.timestamp
      ).toLocaleString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    messagesStatus.value = true;
    console.log("messages.value", messages.value);
  });
  scrollToBottom();
}

// 更新聊天室訊息，並將畫面滾動至最底部
const contentRef = ref(null);
const scrollToBottom = () => {
  nextTick(() => {
    const contentElement = contentRef.value;
    contentElement.scrollTop = contentElement.scrollHeight;
  });
};

const username = ref("");
const messageContent = ref("");
const messages = ref([]);
let stompClient = false;
const messageSenderStatus = ref([]);
const chatRoomCode = ref("");

const connect = () => {
  // const socket = new WebSocket('wss://imbig404.com/websocket');
  const socket = new WebSocket("ws://localhost:8088/websocket");
  stompClient = webstomp.over(socket);
  stompClient.connect({}, onConnected, onError);
  username.value = currentUser.value.username;
  scrollToBottom();
};

const onConnected = () => {
  stompClient.subscribe(`/topic/${chatRoomCode.value}`, onMessageReceived);
  // stompClient.subscribe(`/topic/GATADODI`, onMessageReceived);
  const jsonData = { sender: username.value, type: "JOIN" };
  const jsonString = JSON.stringify(jsonData);
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
  if (message.chatRoomMessage.sender === username.value) {
    messageSenderStatus.value.push(true);
  } else {
    messageSenderStatus.value.push(false);
  }
  messages.value.push(message);
  messagesTimeStamps.value.push(
    new Date(message.chatRoomMessage.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  );
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
        .getMessages(chatRoomMessage.value, sendMessageTime.value)
        .then((response) => {
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
            messagesTimeStamps.value.unshift(
              new Date(
                messages.value[0].chatRoomMessage.timestamp
              ).toLocaleString([], { hour: '2-digit', minute: '2-digit', hour12: false })
            );
          }
        });
      contentScroll.scrollTop =
        contentScroll.scrollHeight - oldContentScrollHeight;

      sendMessageStatus.value = false;
    }, 1000);
  }
}

function handleDisconnect() {
  roomChatStatus.value = false;
  stompClient.disconnect();
}

const activeChatRoomIndex = ref(-1);
function handleClickChatRoom(roomCode, roomDescription, index) {
  if(stompClient) {
    stompClient.disconnect();
  }
  chatRoomCode.value = roomCode;
  connect();
  chatGetNewMessages(roomCode);
  chatRoomTopInfo.value = {
    roomCode: roomCode,
    roomDescription: roomDescription,
  };
  activeChatRoomIndex.value = index;
}

const chatRoomInfo = ref({});
const chatRoomTime = ref({});
const chatRoomTopInfo = ref({});

onMounted(() => {
  chatService.getMessageByUser().then((response) => {
    chatRoomInfo.value = response.data;
    for (let i = 0; i < chatRoomInfo.value.length; i++) {
      chatRoomTime.value[i] = new Date(chatRoomInfo.value[i].chatRoomTime).toLocaleString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    }
  })
});

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

// function encryptMessage(message) {
//   const keyStr = "tdjyyxxytdjyyxxy";
//   const key = CryptoJS.enc.Utf8.parse(keyStr);
//   const srcs = CryptoJS.enc.Utf8.parse(message);
//   const encrypted = CryptoJS.AES.encrypt(srcs, key, {
//     mode: CryptoJS.mode.ECB,
//     padding: CryptoJS.pad.Pkcs7,
//   });
//   return encrypted.toString();
// }

// function decrypt(word) {
//   const keyStr = "tdjyyxxytdjyyxxy";
//   const key = CryptoJS.enc.Utf8.parse(keyStr);
//   const decrypt = CryptoJS.AES.decrypt(word, key, {
//     mode: CryptoJS.mode.ECB,
//     padding: CryptoJS.pad.Pkcs7,
//   });
//   return CryptoJS.enc.Utf8.stringify(decrypt).toString();
// }
// console.log("Test: ", encryptMessage("Hello World!"));
// console.log(decrypt("+VNT0XaJEhtsdKbS8un/Yg=="));

// let par2 = {
//   name: "Dana Cora",
// };

// console.log(encryptMessage(JSON.stringify(par2)));
// console.log(decrypt("VOWeEfJbIFpvRPJwahVmyio3/SnI1zpSOJAGIqWb4pU="));

</script>

<template>
  <div class="chatroom-container">
    <div class="chatroom-sidebar">
      <span><font-awesome-icon icon="bars-staggered" /></span>
      <span :class="[{ 'chatroom-sidebar-click': activeTab === 'COMMENT' }]"
        @click="handleTabClick('COMMENT')"><font-awesome-icon icon="comment" /></span>
      <span :class="[{ 'chatroom-sidebar-click': activeTab === 'GEAR' }]"
        @click="handleTabClick('GEAR')"><font-awesome-icon icon="gear" /></span>
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
        <div class="chatroom-user-message" v-for="(chatRoom, index) in chatRoomInfo"
          @click="handleClickChatRoom(chatRoom.chatRoomCode, chatRoom.chatRoomDescription, index)"
          :class="{ 'active-chatroom': index === activeChatRoomIndex }">
          <div class="chatroom-user-message-text">
            <img :src="'data:image/png;base64,' + chatRoom.chatRoomImage" alt="" />
            <div>
              <h3>{{ chatRoom.chatRoomTitle }}</h3>
              <p>{{ chatRoom.chatRoomMessage }}</p>
            </div>
          </div>
          <div class="chatroom-user-message-date">
            <p>{{ chatRoomTime[index] }}</p>
          </div>
          <div class="chatroom-line"></div>
        </div>
      </div>
    </div>
    <div class="chatroom-message" v-if="messagesStatus">
      <div class="chatroom-message-search">
        <span><font-awesome-icon icon="fa-solid fa-magnifying-glass" /></span>
        <label for="search"></label>
        <input type="text" name="search" id="search" placeholder="Search" autocomplete="off" />
      </div>
      <h2>{{ chatRoomTopInfo.roomCode }}</h2>
      <h4>{{ chatRoomTopInfo.roomDescription }}</h4>
      <div class="chatroom-message-content" ref="contentRef" @scroll="handleScroll($event)">
        <div class="loader" v-if="sendMessageStatus"></div>
        <div v-for="(message, index) in messages" :key="index" :class="messageSenderStatus[index]
        ? 'chatroom-message-self'
        : 'chatroom-message-receive'
        ">
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
          <p v-else :data-timestamp="messagesTimeStamps[index]">{{ message.chatRoomMessage.content }}<span>
              {{ messagesTimeStamps[index] }}
            </span></p>
        </div>
      </div>

      <div class="chatroom-message-send">
        <span class="chatroom-message-send-clip"><font-awesome-icon icon="paperclip" /></span>
        <div class="chatroom-message-send-input">
          <label for="message"></label>
          <input type="text" name="message" id="message" autocomplete="off" @keyup.enter="sendMessage()"
            v-model="messageContent" />
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
    <div class="chatroom-group">
      <div class="chatroom-group-info">
        <div class="chatroom-group-image">
          <img src="@/assets/image/Default_picture5.jpg" alt="" />
        </div>
        <h2>Haurka51</h2>
        <p>之所以這麼努力，是因為我想要的都很貴。</p>
        <div class="chatroom-group-display">
          <div class="chatroom-group-room-link">
            <img src="@/assets/image/Default_picture3.jpg" alt="" />
            <p>Room</p>
          </div>
          <div class="chatroom-group-room-search">
            <img src="@/assets/image/Default_picture4.jpg" alt="" />
            <p>Search</p>
          </div>
        </div>
        <div class="chatroom-line"></div>
      </div>
      <div class="chatroom-group-shared">
        <h2>Shared Files</h2>

        <div class="chatroom-group-shared-file" v-for="index in 8">
          <div class="chatroom-group-file-info">
            <img src="@/assets/image/Default_picture2.jpg" alt="" />
            <div>
              <h3>forward statement item 2.txtTTTTS</h3>
              <p>2024-04-22</p>
            </div>
          </div>
          <p>1.9Mb</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/styles/layout/chatroom.scss";
</style>
