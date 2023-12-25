<script setup>
import { RouterLink, RouterView } from "vue-router";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.module";
import { computed } from "vue";

const authStore = useAuthStore();
const router = useRouter();

const currentUser = computed(() => {
  return authStore.dataStatus.user;
});

const showAdminBoard = computed(() => {
  if (currentUser.value && currentUser["roles"]) {
    return currentUser.value["roles"].includes("ROLE_ADMIN");
  }
  return false;
});

const showModeratorBoard = computed(() => {
  if (currentUser.value && currentUser["roles"]) {
    return currentUser.value["roles"].includes("ROLE_MODERATOR");
  }
  return false;
});

function logOut() {
  authStore.logout();
  router.push("/login");
}
</script>

<template>
  <nav class="nav">
    <div class="navbar-nav">
      <li class="nav-logo">
        <RouterLink to="/">
          <img class="nav-logo" src="../assets/image/1.png" alt="" />
        </RouterLink>
      </li>
      <RouterLink to="/home" class="nav-link">
        <li class="nav-item"><strong>Send</strong>Everything</li>
      </RouterLink>
    </div>

    <div class="navbar-nav">
      <div>
        <RouterLink to="/uploadfile" class="nav-link">
          <li class="nav-item">
            <font-awesome-icon icon="arrow-up-from-bracket" /> Upload
          </li>
        </RouterLink>
        <div class="navbar-login" v-if="!currentUser">
          <RouterLink to="/login" class="nav-link">
            <li class="nav-item">
              <font-awesome-icon icon="sign-in-alt" /> Login
            </li>
          </RouterLink>
        </div>
      </div>

      <div v-if="currentUser" class="ml-auto">
        <RouterLink to="/profile" class="nav-link">
          <li class="nav-item">
            <font-awesome-icon icon="user" />
            {{ currentUser.username }}
          </li>
        </RouterLink>
        <li class="nav-item">
          <a class="nav-link" @click.prevent="logOut">
            <font-awesome-icon icon="sign-out-alt" /> LogOut
          </a>
        </li>
      </div>
    </div>
  </nav>
</template>

<style scoped lang="scss">
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  background: #9c080814;
  height: 70px;
  border-bottom: 2px solid #1f1b1b14;
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
