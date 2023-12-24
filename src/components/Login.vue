<script setup>
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import { useAuthStore } from "../stores/auth.module";
import { useRouter } from "vue-router";
import { ref, computed, onMounted } from "vue";

const authStore = useAuthStore();
const router = useRouter();

const schema = yup.object().shape({
  username: yup.string().required("Username is required!"),
  password: yup.string().required("Password is required!"),
});
const loading = ref(false);
const message = ref("");

const loggedIn = computed(() => {
  return authStore.dataStatus.status.loggedIn;
});

onMounted(() => {
  if (loggedIn.value) {
    router.push("/profile");
  }
});

window.addEventListener('message', (event) => {
  if (event.data.isAuthenticated) {
    // 在這裡進行跳轉到首頁的操作
    router.push('/');
    setTimeout(() => {
      location.reload();
    })
  }
});

function loginWithGoogle() {
  // 導向到後端的 OAuth 2.0 授權端點
  window.location.href = "http://localhost:8080/oauth2/authorization/google";
}

function loginNewGoogle() {
  const authUrl = "http://localhost:8080/oauth2/authorization/google";
  window.open(authUrl, "_blank", "width=550,height=550");
}

function back() {
  router.go(-1);
}

function register() {
  router.push('/register');
}

function handleLogin(user) {
  loading.value = true;
  authStore
    .login(user)
    .then(() => {
      router.push("/profile");
    })
    .catch((error) => {
      loading.value = false;
      message.value =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
    });
}
</script>

<template>
  <div class="card-container">
    <div class="card-img">
      <!-- <img src="../assets/image/test.jpg" alt=""> -->
      <img src="../assets/image/103593601_p0.jpg" alt="" />
    </div>
    <div class="card-form">
      <div class="card-nav">
        <p class="card-nav-svg" @click="back()">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            enable-background="new 0 0 24 24"
            height="24"
            viewBox="0 0 24 24"
            width="24"
          >
            <rect fill="none" height="24" width="24" />
            <g>
              <polygon
                points="17.77,3.77 16,2 6,12 16,22 17.77,20.23 9.54,12"
              />
            </g>
          </svg>
          <span>Back</span>
        </p>
        <div class="card-nav-p-set">
          <p>Personal Info.</p>
          <p>STEP 01/03</p>
        </div>
      </div>
      <div class="card-context">
        <div>
          <p>Login Individual Account!</p>
          <p>
            For the purpose of industry regulation, your details are required.
          </p>
          <p class="card-line"></p>
          <Form @submit="handleLogin" :validation-schema="schema">
            <div class="card-field">
              <label for="username">Username</label>
              <Field name="username" type="text" class="form-control" />
              <ErrorMessage name="username" class="error-feedback" />
            </div>
            <div class="card-field">
              <label for="password">Password</label>
              <Field name="password" type="password" class="form-control" />
              <ErrorMessage name="password" class="error-feedback" />
            </div>

            <div class="card-button-field">
              <button class="card-button" :disabled="loading">
                <span
                  v-show="loading"
                  class="spinner-border spinner-border-sm"
                ></span>
                Login Account
              </button>
              <div class="card-line-or">
                <p class="card-line"></p>
                <span>or</span>
              </div>
            </div>

            <div class="">
              <div v-if="message" class="alert alert-danger" role="alert">
                {{ message }}
              </div>
            </div>
          </Form>

          <button
            class="card-button auth-button"
            :disabled="loading"
            @click="loginNewGoogle()"
          >
            <img src="../assets/image/search.png" alt="" />
            Login with Google
          </button>

          <p class="card-register" @click="register()">還沒有帳號嗎? <span>我要註冊！</span></p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "../assets/styles/layout/_card.scss";

.error-feedback {
  color: red;
}
</style>
