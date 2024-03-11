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

// 跨視窗傳遞訊息，Google登入用
window.addEventListener("message", (event) => {
  if (event.data.isAuthenticated) {
    router.push("/");
    setTimeout(() => {
      location.reload();
    });
  }
});

function loginNewGoogle() {
  // google登入畫面
  const authUrl = "http://localhost:8080/oauth2/authorization/google";
  window.open(authUrl, "_blank", "width=550,height=550");
}

function back() {
  router.go(-1);
}

function register() {
  router.push("/register");
}

function handleLogin(user) {
  loading.value = true;
  authStore
    .login(user)
    .then(() => {
      router.push("/uploadfile");
    })
    .catch((error) => {
      loading.value = false;
      console.log("Full error object:", error);
      console.log("Response data:", error.response);
      if (error.code) {
        const errorCode = error.code;
        console.log(errorCode);
        switch (errorCode) {
          case "ERR_BAD_REQUEST":
            message.value = "Incorrect username or password. Try again.";
            break;
          case "ERR_NETWORK":
            message.value = "Unable to connect to the server.";
            break;
          default:
            message.value = "An unexpected error occurred during login.";
        }
      } else {
        message.value = "An unexpected error occurred during login.";
      }
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

          <transition name="fade-up">
            <div
              v-if="message"
              class="login-alert"
              role="alert"
              :class="[{ active: message }]"
            >
              <font-awesome-icon icon="triangle-exclamation" />
              {{ message }}
            </div>
          
          </transition>

          <Form @submit="handleLogin" :validation-schema="schema">
            <div class="card-field">
              <label for="username">Username</label>
              <Field id="username" name="username" type="text" class="form-control" placeholder=" " />
              <ErrorMessage name="username" class="error-feedback" />
            </div>
            <div class="card-field">
              <label for="password">Password</label>
              <Field id="password" name="password" type="password" class="form-control" placeholder=" " />
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

            <!-- <div class="">
              <div v-if="message" class="login-alert" role="alert">
                {{ message }}
              </div>
            </div> -->
          </Form>

          <button
            class="card-button auth-button"
            :disabled="loading"
            @click="loginNewGoogle()"
          >
            <img src="../assets/image/search.png" alt="" />
            Login with Google
          </button>

          <p class="card-register" @click="register()">
            還沒有帳號嗎? <span>我要註冊！</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "../assets/styles/layout/_card.scss";

.error-feedback {
  color: red;
  margin-top: 5px;
}

.login-alert {
  display: flex;
  align-items: center;
  gap: 15px;
  background-color: #fad4d1;
  border-radius: 5px;
  color: #d42212;
  padding: 10px 0 10px 15px;
  margin: 20px 0 20px 0;
}

.fade-up-enter-active, .fade-up-leave-active {
  transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
}

.fade-up-enter-from, .fade-up-leave-to {
  opacity: 0;
  transform: translateY(15px);
}
</style>
