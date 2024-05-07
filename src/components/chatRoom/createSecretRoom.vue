<script setup>
import { ref, computed } from "vue";
import chatService from "../../services/chatService";
import { Form, Field, ErrorMessage } from "vee-validate";
import { useAuthStore } from "../../stores/auth.module";
import * as yup from "yup";
import {
  digestMessage,
  generatePrivateKey,
  generatePublicKey,
  generateSharedSecretKey,
  rfc3526roomPrime,
} from "../cryptoUtils/DH-Crypto.js";

const emits = defineEmits(["sendCreateStatus", "sendCreateCode"]);

function handleSendCreateStatus(newStatus) {
  emits("sendCreateStatus", newStatus);
}

const authStore = useAuthStore();
const currentUser = computed(() => {
  return authStore.dataStatus.user;
});
// Create Room

const schema = yup.object().shape({
  description: yup.string().required("Description is required!"),
  title: yup.string().required("Title is required!"),
});

// Create Room
const boardType = ref("SECRET_BOARD");

async function handleCreate(room) {
  const base64Content = currentUser.value.profileImage;
  const blob = new Blob([atob(base64Content)], { type: "image/png" });
  const file = new File([blob], "userImage.png", { type: "image/png" });
  const roomPrime = rfc3526roomPrime();
  const roomPrivateKey = generatePrivateKey();
  const roomPublicKey = generatePublicKey(roomPrivateKey);
  const initVector = crypto.getRandomValues(new Uint8Array(12));
  const base64FromInitVector = btoa(
    String.fromCharCode.apply(null, initVector)
  );

  const chatData = {
    title: room.title,
    description: room.description,
    roomType: "SECRET",
    boardType: boardType.value,
    chatImage: file,
    pwd: "",
    userPublicKey: roomPublicKey,
    userPrivateKey: roomPrivateKey,
    roomPrime: roomPrime,
    initVector: base64FromInitVector,
  };
  // 第一位使用者的 shared key 利用自己的 private values 進行 shared key 的產生
  const roomSharedKey = generateSharedSecretKey(
    roomPrivateKey,
    roomPrivateKey,
  );
  console.log("roomSharedKey: ", roomSharedKey);
  const asekey = await digestMessage(roomSharedKey.toString());
  chatService
  .createSecretChat(chatData)
  .then((response) => {
      const chatKeyData = {
        aseKey: asekey,
        roomInitVector: initVector,
        roomCode: response.data.roomCode,
      }
      console.log("response: ", response.data.roomCode);
      handleSendCreateCode(chatKeyData);
    })
    .catch((error) => {
      console.log("Error: ", error);
    });
}

function handleSendCreateCode(chatKeyData) {
  emits("sendCreateCode", chatKeyData);
}

const formData = ref({
  title: "This is a title.",
  description: "This is a description.",
});
</script>

<template>
  <div class="create-board-mask">
    <div class="create-board" @click.stop>
      <p>SECRET CHAT SETUP</p>
      <div class="create-board-line"></div>
      <Form @submit="handleCreate" :validation-schema="schema">
        <div class="create-board-form">
          <div>
            <p>Chat Title</p>
            <div class="create-board-title">
              <label for="title"></label>
              <Field
                type="text"
                name="title"
                id="title"
                v-model="formData.title"
              />
              <ErrorMessage name="title" class="error-feedback" />
            </div>

            <p>Chat description</p>
            <div class="create-board-description">
              <label for="description"></label>
              <Field
                as="textarea"
                name="description"
                id="description"
                cols="41"
                rows="3"
                v-model="formData.description"
              ></Field>
              <ErrorMessage name="description" class="error-feedback" />
            </div>
          </div>
        </div>
        <p class="chatRoom-secret-remind">
          The created number can invite users to enter.
        </p>

        <div class="create-board-decide">
          <button
            class="create-board-cancel"
            @click="handleSendCreateStatus(false)"
          >
            Cancel
          </button>
          <button class="create-board-confirm">Confirm</button>
        </div>
      </Form>
      <!-- 檔案預覽 -->

      <span @click="handleSendCreateStatus(false)"
        ><font-awesome-icon icon="xmark"
      /></span>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "../../assets/styles/layout/board/createBoard";

.error-feedback {
  position: absolute;
  top: -1.4rem;
  left: 13rem;
  width: 200px;
  font-weight: bold;
  color: red;
}

.create-board {
  height: 360px;
  width: 500px;
}

.chatRoom-secret-remind {
  font-size: 14px;
  color: #bc0e0e;
}
</style>
