<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import BoardUploadService from "../../services/BoardService.js";
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import {
  generatePrivateKey,
  generatePublicKey,
  rfc3526roomPrime,
} from "../../cryptoUtils/DH-Crypto.js";

const emits = defineEmits(["sendCreateStatus"]);
const router = useRouter();

function handleSendCreateStatus(newStatus) {
  emits("sendCreateStatus", newStatus);
}

const isPublicChecked = ref(true);
const isPrivateChecked = ref(false);

const selectedCheck = ref('PUBLIC');

const ckPublicIcon = computed(() => {
  return selectedCheck.value === 'PUBLIC' ? ["far", "square-check"] : ["far", "square"];
});

const ckPrivateIcon = computed(() => {
  return selectedCheck.value === 'PRIVATE' ? ["far", "square-check"] : ["far", "square"];
});

const selectPublic = () => {
  selectedCheck.value = 'PUBLIC';
}

const selectPrivate = () => {
  selectedCheck.value = 'PRIVATE';
}

// 檔案預覽
const file = ref(undefined);
const previewImage = ref(null);
const previewStatus = ref(false);
function selectFile() {
  previewImageStatue.value = false;
  handlePreviewImg(file.value.files);
}
function handlePreviewImg(file) {
  const reader = new FileReader();
  const selectFileSize = file[0].size / 1024 / 1024;
  const isImage = /^image\//.test(file[0].type);

  if (selectFileSize < 20 && isImage) {
    reader.readAsDataURL(file[0]);
    reader.onload = () => {
      previewImage.value = reader.result;
    };
    previewStatus.value = true;
  } else {
    file.value = "";
    previewStatus.value = false;
  }
}

const fileBlob = ref(undefined);
const previewImageStatue = ref(false);
function handlePreviewClick(index) {
  // 構建點擊的圖片路徑
  const reader = new FileReader();
  fetch(getImageUrl(index + 1))
    .then((response) => response.blob()) // 將文件轉換為 Blob 對象
    .then((blob) => {
      previewImageStatue.value = true;
      fileBlob.value = blob;
      // 當文件讀取成功時，設置 FileReader 的讀取操作
      reader.readAsDataURL(blob);
      reader.onload = () => {
        previewImage.value = reader.result;
      };
      previewStatus.value = true;
    })
    .catch((error) => {
      console.error("Error fetching local image:", error);
    });
}
// Create Room

const schema = yup.object().shape({
  description: yup.string().required("Description is required!"),
  title: yup.string().required("Title is required!"),
});

const roomNumber = ref("123");

const roomPrime = rfc3526roomPrime();
const roomPrivateKey = generatePrivateKey();
const roomPublicKey = generatePublicKey(roomPrivateKey);
const initVector = crypto.getRandomValues(new Uint8Array(12));
const base64FromInitVector = btoa(String.fromCharCode.apply(null, initVector));

function handleLoginData(password, roomCode, roomType) {
  BoardUploadService.accessRoom(password, roomCode, roomType, roomPublicKey, roomPrivateKey)
    .then(() => {
      router.push(`/workBoard/WorkRoomBoard/${roomCode}`);
    })
    .catch((error) => {
      console.log(error);
    });
}
const boardType = ref("ASSIGNMENT_BOARD");

function handleCreate(room) {
  if (formData.value.pwd === undefined && selectedCheck.value === "PRIVATE") {
    alert("Please enter the password.");
    return;
  }

  if (previewImageStatue.value !== true) {
    fileBlob.value = file.value.files[0];
  }
  const roomData = {
    title: room.title,
    description: room.description,
    pwd: room.pwd,
    roomType: selectedCheck.value,
    file: fileBlob.value,
    boardType: boardType.value,
    userPublicKey: roomPublicKey,
    userPrivateKey: roomPrivateKey,
    roomPrime: roomPrime,
    initVector: base64FromInitVector,
  };
  BoardUploadService.uploadMessageWithImage(roomData, fileBlob.value)
    .then((response) => {
      roomNumber.value = response.data.roomCode;
      handleLoginData(room.pwd, roomNumber.value, roomData.roomType);
    })
    .catch((error) => {
      console.log("Error: ", error);
    });
}

const formData = ref({
  title: "This is a title.",
  description: "This is a description.",
  pwd: "",
});

const getImageUrl = (fileIndex) => {
  return new URL(
    `../../assets/image/Default_picture${fileIndex}.jpg`,
    import.meta.url
  ).href;
};

// 當public被選取時，清空pwd
watch(selectedCheck === 'PUBLIC', (newValue) => {
  if (newValue) {
    formData.value.pwd = "";
  }
});

onMounted(() => {
  handlePreviewClick(0);
});
</script>

<template>
  <div class="create-board-mask">
    <div class="create-board" @click.stop>
      <p>ROOM SETUP</p>
      <div class="create-board-line"></div>
      <Form @submit="handleCreate" :validation-schema="schema">
        <div class="create-board-form">
          <div>
            <p>Title</p>
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

            <p>Room description</p>
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

            <p>Password setting</p>
            <div class="create-board-pwd-flex">
              <div class="create-board-pwd">
                <label for="pwd"></label>
                <Field
                  type="password"
                  name="pwd"
                  id="pwd"
                  v-model="formData.pwd"
                  :disabled="selectedCheck === 'PUBLIC'"
                />
                <ErrorMessage name="pwd" class="error-feedback" />
              </div>

              <div class="create-board-checkbox">
                <label for="public">
                  <Field
                    type="checkbox"
                    name="public"
                    id="public"
                    :checked="selectedCheck === 'PUBLIC'"
                    @input="selectPublic"
                  />
                  <span><font-awesome-icon :icon="ckPublicIcon" /></span>
                  Public
                </label>
                <label for="private">
                  <Field
                    type="checkbox"
                    name="private"
                    id="private"
                    :checked="selectedCheck === 'PRIVATE'"
                    @input="selectPrivate"
                  />
                  <span><font-awesome-icon :icon="ckPrivateIcon" /></span>
                  Private
                </label>
              </div>
            </div>
          </div>
          <!-- 檔案預覽 -->
          <div class="create-board-Select">
            <div class="create-boare-default">
              <img
                :src="getImageUrl(index + 1)"
                alt=""
                v-for="(amount, index) in 5"
                :key="index"
                @click="handlePreviewClick(index)"
              />
            </div>
            <div class="create-board-img">
              <img v-if="previewStatus" :src="previewImage" alt="" />
              <p v-else>Picture Preview</p>
            </div>
            <div class="create-board-file">
              <label type="button" for="fileInput"> Select Picture </label>
              <input
                type="file"
                name="fileInput"
                id="fileInput"
                ref="file"
                @change="selectFile"
              />
            </div>
          </div>
        </div>

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
</style>
