<script setup>
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import { useRouter } from "vue-router";
import { onMounted, ref } from "vue";
import authService from "../services/auth.service";

const router = useRouter();
const successful = ref(false);
const loading = ref(false);
const message = ref("");
const schema = yup.object().shape({
  username: yup
    .string()
    .required("Username is required!")
    .min(3, "Must be at least 3 characters!")
    .max(20, "Must be maximum 20 characters!"),
  email: yup
    .string()
    .required("Email is required!")
    .email("Email is invalid!")
    .max(50, "Must be maximum 50 characters!"),
  password: yup
    .string()
    .required("Password is required!")
    .min(6, "Must be at least 6 characters!")
    .max(40, "Must be maximum 40 characters!"),
});

const fileBlob = ref(undefined);

function handleRegister(user) {
  loading.value = true;
  message.value = "";
  successful.value = false;
  if(!defaultImageStatus.value) {
    fileBlob.value = file.value.files[0]
  }

  let formData = new FormData();
  formData.append("image", fileBlob.value);
  formData.append("username", user.username);
  formData.append("email", user.email);
  formData.append("password", user.password);
  console.log(user)

  authService
    .register(formData)
    .then((data) => {
      message.value = data.message;
      successful.value = true;
      loading.value = false;
      router.push("/signin");
    })
    .catch((error) => {
      loading.value = false;
      message.value =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      successful.value = false;
      loading.value = false;
    });
}

function back() {
  router.go(-1);
}

// 檔案預覽
const file = ref(undefined);
const previewImage = ref(null);
const previewStatus = ref(false);
const previewImageStatue = ref(false);

function selectFile() {
  previewImageStatue.value = false;
  defaultImageStatus.value = false;
  handlePreviewImg(file.value.files);
}
function handlePreviewImg(file) {
  const reader = new FileReader();
  const selectFileSize = file[0].size / 1024 / 1024;
  const isImage = /^image\//.test(file[0].type);

  if (selectFileSize < 5 && isImage) {
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

const getImageUrl = () => {
  return new URL(
    `../assets/image/User.png`,
    import.meta.url
  ).href;
};

const defaultImageStatus = ref(false);
function handlePreviewDefault() {
  // const reader = new FileReader();
  fetch(getImageUrl())
    .then((response) => response.blob()) // 將文件轉換為 Blob 對象
    .then((blob) => {
      defaultImageStatus.value = true;
      fileBlob.value = blob;
      console.log(blob)
    })
    .catch((error) => {
      console.error("Error fetching local image:", error);
    });
}

onMounted(() => {
  handlePreviewDefault();
});

</script>

<template>
  <div class="card-container">
    <div class="card-img">
      <img src="../assets/image/test.jpg" alt="" />
    </div>
    <div class="card-form">
      <div class="card-nav">
        <p class="card-nav-svg" @click="back()">
          <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24"
            width="24">
            <rect fill="none" height="24" width="24" />
            <g>
              <polygon points="17.77,3.77 16,2 6,12 16,22 17.77,20.23 9.54,12" />
            </g>
          </svg>
          <span>Back</span>
        </p>
        <div class="card-nav-p-set">
          <p>Personal Info.</p>
          <p class="card-nav-p-abs">STEP 01/03</p>
        </div>
      </div>

      <div class="card-context">
        <div>
          <p>Register Individual Account!</p>
          <p>
            For the purpose of industry regulation, your details are required.
          </p>
          <p class="card-line"></p>
          <!-- 用戶輸入的資料都會作為user參數傳遞給handleRegister方法 -->
          <Form @submit="handleRegister" :validation-schema="schema">
            <div v-if="!successful">
              <div class="card-select-img">
                <img v-if="previewStatus" :src="previewImage" alt="" />
                <img v-else :src="getImageUrl()" />
              </div>
              <div class="card-select-file">
                <label type="button" for="fileInput"> Select Picture </label>
                <input type="file" name="fileInput" id="fileInput" ref="file" @change="selectFile" />
              </div>

              <div class="card-field">
                <label for="username">Username*</label>
                <Field id="username" name="username" type="text" class="form-control" placeholder=" " />
                <ErrorMessage name="username" class="error-feedback" />
              </div>
              <div class="card-field">
                <label for="email">Email*</label>
                <Field id="email" name="email" type="email" class="form-control" placeholder=" " />
                <ErrorMessage name="email" class="error-feedback" />
              </div>
              <div class="card-field">
                <label for="password">Password*</label>
                <Field id="password" name="password" type="password" class="form-control" placeholder=" " />
                <ErrorMessage name="password" class="error-feedback" />
              </div>

              <div class="card-button-field">
                <button class="card-button" :disabled="loading">
                  <span v-show="loading" class="spinner-border spinner-border-sm"></span>
                  Register Account
                </button>
              </div>
            </div>
          </Form>

          <div v-if="message" class="alert" :class="successful ? 'alert-success' : 'alert-danger'">
            {{ message }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "../assets/styles/layout/card";

.error-feedback,
.alert {
  color: red;
  margin-top: 5px;
}
</style>
