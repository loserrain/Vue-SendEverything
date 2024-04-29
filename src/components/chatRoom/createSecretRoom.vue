<script setup>
import { ref, computed, watch, onMounted } from "vue";
import chatService from "../../services/chatService";
import { Form, Field, ErrorMessage } from "vee-validate";
import { useAuthStore } from "../../stores/auth.module";
import * as yup from "yup";

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

function handleCreate(room) {
  const base64Content = currentUser.value.profileImageBase64;
  const blob = new Blob([atob(base64Content)], { type: "image/png" });
  const file = new File([blob], "userImage.png", { type: "image/png" });
  const chatData = {
    title: room.title,
    description: room.description,
    roomType: "SECRET",
    boardType: boardType.value,
    chatImage: file,
    pwd: "",
  };
  chatService.createSecretChat(chatData)
    .then((response) => {
        emits("sendCreateCode", response.data.roomCode);
    })
    .catch((error) => {
      console.log("Error: ", error);
    });
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
        <p class="chatRoom-secret-remind">The created number can invite users to enter.</p>

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
