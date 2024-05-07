<script setup>
import { RouterLink } from "vue-router";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.module";
import { useUploadInfo } from "../stores/upload";
import { computed, onMounted } from "vue";

const uploadTab = useUploadInfo();

const authStore = useAuthStore();
const router = useRouter();

const currentUser = computed(() => {
  return authStore.dataStatus.user;
});

function logOut() {
  authStore.logout();
  router.push("/");
}

function setSelectedTab(tab) {
  uploadTab.setSelectedTab(tab);
}

function checkAuth() {
  authStore.checkAuth();
}

function alertLogin() {
  if (!currentUser.value) {
    alert("Please sign in first.");
    router.push("/signin");
  }
}

onMounted(() => {
  checkAuth();
});
</script>

<template>
  <nav class="nav">
    <div class="navbar-nav">
      <li class="nav-logo">
        <RouterLink to="/">
          <img class="nav-logo" src="../assets/image/logo4.png" alt="" />
        </RouterLink>
      </li>
      <RouterLink to="/home" class="nav-link">
        <li class="nav-item"><strong>Send</strong>Everything</li>
      </RouterLink>
    </div>

    <div class="navbar-nav">
      <div>
        <div class="navbar-login" v-if="!currentUser">
          <RouterLink :to="{ path: '/chatroom' }" class="nav-link" @click="alertLogin()">
            <li class="nav-item">
              <font-awesome-icon :icon="['far', 'comments']" /> 聊天室
            </li>
          </RouterLink>
          <RouterLink :to="{ path: '/BulletinBoard', query: { page: 1 } }" class="nav-link">
            <li class="nav-item">
              <font-awesome-icon icon="circle-arrow-up" /> 佈告欄
            </li>
          </RouterLink>
          <RouterLink :to="{ path: '/WorkBoard', query: { page: 1 } }" class="nav-link">
            <li class="nav-item">
              <font-awesome-icon icon="circle-arrow-up" /> 作業版
            </li>
          </RouterLink>
          <RouterLink to="/uploadfile" class="nav-link" @click="setSelectedTab('Send')">
            <li class="nav-item">
              <font-awesome-icon icon="circle-arrow-up" /> Upload
            </li>
          </RouterLink>
          <RouterLink to="/signin" class="nav-link">
            <li class="nav-item">
              <font-awesome-icon icon="sign-in-alt" /> Sign in
            </li>
          </RouterLink>
        </div>
      </div>

      <div v-if="currentUser">
        <RouterLink :to="{ path: '/chatroom' }" class="nav-link">
          <li class="nav-item">
            <font-awesome-icon :icon="['far', 'comments']" /> 聊天室
          </li>
        </RouterLink>
        <RouterLink :to="{ path: '/BulletinBoard', query: { page: 1 } }" class="nav-link">
          <li class="nav-item">
            <font-awesome-icon icon="circle-arrow-up" /> 佈告欄
          </li>
        </RouterLink>
        <RouterLink :to="{ path: '/WorkBoard', query: { page: 1 } }" class="nav-link">
          <li class="nav-item">
            <font-awesome-icon icon="circle-arrow-up" /> 作業版
          </li>
        </RouterLink>
        <RouterLink to="/uploadfile" class="nav-link" @click="setSelectedTab('Send')">
          <li class="nav-item">
            <font-awesome-icon icon="circle-arrow-up" /> Upload
          </li>
        </RouterLink>
        <li class="nav-user">
          <img :src="`data:image/png;base64,${currentUser.profileImage}`" alt="">
          {{ currentUser.username }}
        </li>
        <li class="nav-item" @click.prevent="logOut">
          <a class="nav-link">
            <font-awesome-icon icon="sign-in-alt" /> Sign out
          </a>
        </li>
      </div>
    </div>
  </nav>
</template>

<style scoped lang="scss">
@import "../assets/styles/app";

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  background: $primary-theme-pink;
  height: 70px;
  border-bottom: 2px solid #E3CCCD;
}

.navbar-nav a,
li {
  display: inline-block;
  margin-right: 5px;
  list-style-type: none;
  text-decoration: none;
  font-size: 22px;
  color: dimgrey;
  cursor: pointer;
}

.nav-user {
  position: relative;
  margin-right: 15px;
  margin-left: 3rem;
  cursor: default;

  img {
    position: absolute;
    top:-5px;
    left: -2.6rem;
    width: 35px;
    height: 35px;
    border-radius: 50%;
  }
}

.navbar-login {
  display: inline-block;
}

.nav-item {
  padding: 10px;
  transition: 0.3s;

  &:hover {
    background-color: rgba(114, 114, 118, 0.174);
    border-radius: 10px;
  }

  strong {
    font-weight: 650;
  }
}

.nav-logo {
  transform: translateY(11%);
  margin-right: -3px;

  img {
    width: 35px;
    height: 35px;
  }
}
</style>
