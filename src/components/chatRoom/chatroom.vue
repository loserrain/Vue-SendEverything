<script setup>
import { ref, onMounted, computed, watch } from "vue";
import CryptoJS from "crypto-js";

const charIconType = {
  COMMENT: "COMMENT",
  GEAR: "GEAR",
};

const activeTab = ref(charIconType.COMMENT);

const handleTabClick = (tab) => {
  activeTab.value = tab;
};

//
// 假設 DH 演算法生成的共享密鑰是一個數字
const sharedKey = 123456;

// 定義一個函數來將數字密鑰轉換為 AES 加密算法所需的字串密鑰
function convertToAESKey(sharedKey) {
  // 使用 SHA-256 哈希函數作為 KDF
  const hash = CryptoJS.SHA256(sharedKey.toString());
  // 將 SHA-256 哈希值轉換為字串形式作為 AES 密鑰
  const aesKey = hash.toString(CryptoJS.enc.Hex).substring(0, 32); // AES 密鑰需要 256 位，即 32 字節
  return aesKey;
}

// 將 DH 共享密鑰轉換為 AES 加密算法所需的字串密鑰
const aesKey = convertToAESKey(sharedKey);

// console.log("AES Key:", aesKey);

function generateKey(num) {
  let library =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "";
  for (let i = 0; i < num; i++) {
    let randomPoz = Math.floor(Math.random() * library.length);
    key += library.substring(randomPoz, randomPoz + 1);
  }
  return key;
}

function encryptMessage(message) {
  const keyStr = "tdjyyxxytdjyyxxy";
  const key = CryptoJS.enc.Utf8.parse(keyStr);
  const srcs = CryptoJS.enc.Utf8.parse(message);
  const encrypted = CryptoJS.AES.encrypt(srcs, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString();
}

function decrypt(word) {
  const keyStr = "tdjyyxxytdjyyxxy";
  const key = CryptoJS.enc.Utf8.parse(keyStr);
  const decrypt = CryptoJS.AES.decrypt(word, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return CryptoJS.enc.Utf8.stringify(decrypt).toString();
}
console.log("Test: ", encryptMessage("Hello World!"));
console.log(decrypt("+VNT0XaJEhtsdKbS8un/Yg=="));

let par2 = {
  name: "Dana Cora",
};

console.log(encryptMessage(JSON.stringify(par2)));
console.log(decrypt("VOWeEfJbIFpvRPJwahVmyio3/SnI1zpSOJAGIqWb4pU="));

const isHoveringUser = ref(false);
const isHoveringContent = ref(false);
const isHoveringGroup = ref(false);
</script>

<template>
  <div class="chatroom-container">
    <div class="chatroom-sidebar">
      <span><font-awesome-icon icon="bars-staggered" /></span>
      <span
        :class="[{ 'chatroom-sidebar-click': activeTab === 'COMMENT' }]"
        @click="handleTabClick('COMMENT')"
        ><font-awesome-icon icon="comment"
      /></span>
      <span
        :class="[{ 'chatroom-sidebar-click': activeTab === 'GEAR' }]"
        @click="handleTabClick('GEAR')"
        ><font-awesome-icon icon="gear"
      /></span>
    </div>
    <div
      class="chatroom-user"
      :class="{ 'show-scrollbar-user': isHoveringUser }"
      @mouseenter="isHoveringUser = true"
      @mouseleave="isHoveringUser = false"
    >
      <div class="chatroom-user-info">
        <div class="chatroom-user-image">
          <img src="@/assets/image/Default_picture1.jpg" alt="" />
        </div>
        <h2>Dana Cora</h2>
        <p>小時候寫作文都是扶老人，現在想想，我當年膽子真大阿。</p>
        <div class="chatroom-line"></div>
      </div>
      <div class="chatroom-user-chats">
        <h2>Chats</h2>
        <div class="chatroom-user-message" v-for="index in 8">
          <div class="chatroom-user-message-text">
            <img src="@/assets/image/Default_picture2.jpg" alt="" />
            <div>
              <h3>John</h3>
              <p>Yes! It will be there!Yes! It will be there!</p>
            </div>
          </div>
          <div class="chatroom-user-message-date">
            <p>13:25</p>
          </div>
          <div class="chatroom-line"></div>
        </div>
      </div>
    </div>
    <div class="chatroom-message">
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
      <h2>Dana Cora</h2>
      <h4>This is a room description.</h4>
      <div
        class="chatroom-message-content"
        :class="{ 'show-scrollbar-content': isHoveringContent }"
        @mouseenter="isHoveringContent = true"
        @mouseleave="isHoveringContent = false"
      >
        <div class="chatroom-message-receive">
          <p>
            I really missed youI really missed yoI really missed yoI really
            missed yoI really missed yoI really missed yo
          </p>
        </div>
        <div class="chatroom-message-self" v-for="index in 8">
          <p>Do you want to see me?Do you want to seeeeeee asasd asdasd</p>
        </div>
      </div>

      <div class="chatroom-message-send">
        <span class="chatroom-message-send-clip"
          ><font-awesome-icon icon="paperclip"
        /></span>
        <div class="chatroom-message-send-input">
          <label for="message"></label>
          <input type="text" name="message" id="message" autocomplete="off" />
        </div>
        <div class="chatroom-message-send-plane">
          <p>Send</p>
          <span><font-awesome-icon :icon="['far', 'paper-plane']" /></span>
        </div>
      </div>
    </div>
    <div
      class="chatroom-group"
      :class="{ 'show-scrollbar-group': isHoveringGroup }"
      @mouseenter="isHoveringGroup = true"
      @mouseleave="isHoveringGroup = false"
    >
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
