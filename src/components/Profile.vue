<script setup>
import { useAuthStore } from "../stores/auth.module";
import { useRouter } from "vue-router";
import { computed, onMounted } from "vue";
import OauthService from "../services/auth.service";
const authService = useAuthStore();
const router = useRouter();
const currentUser = computed(() => {
  return authService.dataStatus.user;
});

const checkAuth = async () => {
  await authService.checkAuth();
  if (authService.errorRef == 400) {
    router.push("/login");
  }
};

// const oauth2 = async() => {
//   try {
//     const response = await OauthService.oauth2();
//     console.log("test oauth2", response.data);
//   } catch (error) {
//     console.log("error:", error)
//   }
// }

onMounted(() => {
  if (!currentUser.value) {
    router.push("/login");
  }
  authService.oauth2();
  checkAuth();
  // oauth2();
  OauthService.test();
});
</script>

<template>
  <div class="container">
    <div class="profile-framework">
      <header class="profile-header">
        <h3>{{ currentUser.username }} Profile</h3>
      </header>
      <p>
        <strong>Token:</strong>
        {{ currentUser.accessToken.substring(0, 20) }} ...
        {{
          currentUser.accessToken.substr(currentUser.accessToken.length - 20)
        }}
      </p>
      <p>
        <strong>Id:</strong>
        {{ currentUser.id }}
      </p>
      <p>
        <strong>Email:</strong>
        {{ currentUser.email }}
      </p>
      <p>Authorities:</p>
      <ul>
        <li v-for="role in currentUser.roles" :key="role">{{ role }}</li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "../assets/styles/app.scss";
.profile-framework {
  background-color: $primary-text-gray-30;
  border-radius: 10px;
  margin-top: 10px;
  padding: 10px 15px 10px;
  border: solid 4px #ffffff;

  h3 {
    font-size: 28px;
    font-weight: 700;
  }

  p,
  ul {
    font-size: 20px;
  }
}
</style>
