import AuthService from "../services/auth.service";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const initialState = user
    ? { status: { loggedIn: true }, user }
    : { status: { loggedIn: false }, user: null };
  const dataStatus = ref(initialState);
  const errorRef = ref(null);

  async function oauth2() {
    try {
      const loggedInUser = await AuthService.oauth2();
      loginSuccess(loggedInUser);
      console.log('asdasdasd')
    } catch (error) {
      loginFailure();
      throw error;
    }
  }

  async function login(userInfo) {
    try {
      const loggedInUser = await AuthService.login(userInfo);
      loginSuccess(loggedInUser);
    } catch (error) {
      loginFailure();
      throw error;
    }
  }

  function logout() {
    AuthService.logout();
    logoutSuccess();
  }

  async function checkAuth() {
    try {
      await AuthService.checkAuth();
      errorRef.value = null;
    } catch (error) {
      handleAuthError(error);
    }
  }

  function handleAuthError(error) {
    if (error.response && error.response.status === 400) {
      console.log("Redirecting to login page...", error.response.data);
      errorRef.value = error.response.status;
      localStorage.removeItem("user");
      logoutSuccess();
    } else {
      console.error("An error occurred:", error.message);
      errorRef.value = { status: 500, message: error.response.data };
    }
  }

  async function register(user) {
    try {
      const response = await AuthService.register(user);
      registerSuccess();
      return response.data;
    } catch (error) {
      registerFailure();
      throw error;
    }
  }

  function loginSuccess(user) {
    dataStatus.value.status.loggedIn = true;
    dataStatus.value.user = user;
  }

  function loginFailure() {
    dataStatus.value.status.loggedIn = false;
    dataStatus.value.user = null;
  }

  function logoutSuccess() {
    dataStatus.value.status.loggedIn = false;
    dataStatus.value.user = null;
  }

  function registerSuccess() {
    dataStatus.value.status.loggedIn = false;
  }

  function registerFailure() {
    dataStatus.value.status.loggedIn = false;
  }

  return {
    dataStatus,
    login,
    logout,
    register,
    errorRef,
    checkAuth,
    oauth2
  };
});
