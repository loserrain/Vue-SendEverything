<script setup>
import { ref, computed } from "vue";
import BoardRoom from "../boardUploadService/BoardRoom";
import webstomp from "webstomp-client";
import socketURL from "../../services/webSocket_URL";
import { useAuthStore } from "../../stores/auth.module";
import {
  generatePrivateKey,
  generatePublicKey,
  digestMessage,
  aesGcmEncrypt,
  generateSharedSecretKey,
} from "../cryptoUtils/DH-Crypto.js";
import chatService from "../../services/chatService";

const emits = defineEmits(["sendSearchStatus", "sendSearchAccess"]);

function handleSendSearchStatus(newStatus) {
  emits("sendSearchStatus", newStatus);
}

function handleSendSearchAccess(newStatus) {
  emits("sendSearchAccess", newStatus);
}

const authStore = useAuthStore();
const currentUser = computed(() => {
  return authStore.dataStatus.user;
});

let stompClient = null;
const username = ref("");
const connect = async (roomCode) => {
  const socket = new WebSocket(socketURL);
  stompClient = webstomp.over(socket);
  stompClient.connect(
    {},
    () => {
      stompClient.subscribe(`/topic/${roomCode}`);
      joinMessage(roomCode);
    },
    onError
  );
};

// joinMessage
const onError = (error) => {
  console.error(
    "Could not connect to WebSocket server. Please refresh this page to try again!",
    error
  );
};

const joinMessage = async (roomCode) => {
  const chatMessage = {
    sender: username.value,
    content: username.value + " join the room",
    type: "JOIN",
    roomCode: roomCode,
  };

  stompClient.send(
    `/app/join.joinMessage/${roomCode}`,
    JSON.stringify(chatMessage),
    {}
  );
};

const sendMessage = async () => {
  sendMessageContent.value = btoa(
    String.fromCharCode.apply(
      null,
      await aesGcmEncrypt(
        `${username.value} join the room`,
        aesKey.value,
        sendMessageInitVector.value
      )
    )
  );
  const chatMessage = {
    sender: username.value,
    content: sendMessageContent.value,
    type: "CHAT",
    roomCode: chatRoomCode.value,
  };
  stompClient.send(
    `/app/chat.sendMessage/${chatRoomCode.value}`,
    JSON.stringify(chatMessage),
    {}
  );
};

const disconnect = () => {
  if (stompClient) {
    stompClient.disconnect();
  }
};

const chatRoomCode = ref("");
const chatRoomError = ref(false);
const roomPrivateKey = generatePrivateKey();
const roomPublicKey = generatePublicKey(roomPrivateKey);
const sendMessagePublicKey = ref("");
const sendMessagePrivateKey = ref("");
const sendMessageInitVector = ref("");
const sendMessageSharedKey = ref("");
const aesKey = ref("");
const sendMessageContent = ref("");

function handleAccessChat() {
  username.value = currentUser.value.username;
  connect(chatRoomCode.value);
  BoardRoom.accessRoom(
    "",
    chatRoomCode.value,
    "SECRET",
    roomPublicKey,
    roomPrivateKey
  )
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      chatRoomError.value = true;
    });
  setTimeout(() => {
    chatService.getChatMessageKeyAndIV(chatRoomCode.value).then(async (res) => {
      sendMessagePublicKey.value = BigInt(res.data.PublicKey);
      sendMessagePrivateKey.value = BigInt(res.data.PrivateKey);
      sendMessageInitVector.value = Uint8Array.from(
        atob(res.data.ChatRoomIV),
        (c) => c.charCodeAt(0)
      );
      sendMessageSharedKey.value = generateSharedSecretKey(
        sendMessagePublicKey.value,
        sendMessagePrivateKey.value
      );;
      aesKey.value = await digestMessage(sendMessageSharedKey.value.toString());

    });
  }, 300);
  setTimeout(() => {
    sendMessage();
    // 
    handleSendSearchAccess(true);
    handleSendSearchStatus(false);
  }, 500);
  setTimeout(() => {
    disconnect();
  }, 600);
}
</script>

<template>
  <div class="chatSearch-board-mask" @click="handleSendSearchStatus(false)">
    <div class="upload-receive-container" @click.stop>
      <div>
        <p class="upload-receive">ChatRoom Code</p>
        <p class="upload-receive-fileName">input code</p>
      </div>
      <div class="upload-code-box">
        <input
          type="text"
          placeholder="please input code"
          v-model="chatRoomCode"
          @keyup.enter="handleAccessChat()"
        />
        <div @click="handleAccessChat()">
          <font-awesome-icon icon="download" />
        </div>
      </div>

      <span
        class="chatSearch-room-xmark"
        @click="handleSendSearchStatus(false)"
      >
        <font-awesome-icon icon="xmark" />
      </span>
      <p class="chatSearch-room-error" v-if="chatRoomError">ChatCode error!</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "../../assets/styles/layout/uploadReceive";

.chatSearch-board-mask {
  position: fixed;
  left: 0px;
  top: 0px;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.65);
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chatSearch-room-xmark {
  position: absolute;
  top: 8px;
  right: 12px;
  font-size: 18px;
  color: #363737;
  cursor: pointer;
}

.upload-code-box {
  div {
    rotate: -90deg;
  }
}

.upload-receive-container {
  margin: 0px 30px 0;
  padding: 1rem 0rem 0 1.7rem;
  height: 130px;
  width: 300px;
}

.chatSearch-room-error {
  font-size: 14px;
  color: #f95252;
  margin-top: 4px;
}
</style>
