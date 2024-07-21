import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue";
import Login from "@/views/Login.vue";
import Register from "@/views/Register.vue";
import UploadFileViews from "../views/Upload.vue";
import CheckGoogle from "../views/CheckGoogle.vue";
import BulletinBoard from "../components/bulletinBoard/BulletinBoard.vue";
import RoomBoard from "../components/bulletinBoard/RoomBoard.vue";
import WorkBoard from "../components/workBoard/WorkBoard.vue";
import WorkRoomBoard from "../components/workBoard/WorkRoomBoard.vue";
import BulletinLogin from "../components/bulletinBoard/LoginBoard.vue";
import WorkLogin from "../components/workBoard/WorkLoginBoard.vue";
import chatRoom from "../components/chatRoom/chatRoom.vue";

import BoardUploadService from "../services/BoardService.js";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
    },
    {
      path: "/home",
      component: Home,
    },
    {
      path: "/signin",
      name: "signin",
      component: Login,
    },
    {
      path: "/register",
      name: "register",
      component: Register,
    },
    {
      path: "/uploadfile",
      name: "uploadfile",
      component: UploadFileViews,
    },
    {
      path: "/checkGoogle",
      name: "checkGoogle",
      component: CheckGoogle,
    },
    {
      path: "/BulletinBoard",
      name: "BulletinBoard",
      component: BulletinBoard,
    },
    {
      path: "/BulletinBoard/roomboard/:roomCode",
      name: "RoomBoard",
      component: RoomBoard,
      meta: { requiresAuth: true },
    },
    {
      path: "/WorkBoard",
      name: "WorkBoard",
      component: WorkBoard,
    },
    {
      path: "/WorkBoard/WorkRoomBoard/:roomCode",
      name: "WorkRoomBoard",
      component: WorkRoomBoard,
      meta: { requiresAuth: true },
    },
    {
      path: "/BulletinBoard/BulletinLogin",
      name: "BulletinLogin",
      component: BulletinLogin,
    },
    {
      path: "/WorkBoard/WorkLogin",
      name: "WorkLogin",
      component: WorkLogin,
    },
    {
      path: "/chatRoom",
      name: "chatRoom",
      component: chatRoom,
    },
  ],
});

router.beforeEach(async (to) => {
  if (to.meta.requiresAuth) {
    const roomCode = to.params.roomCode;
    try {
      await BoardUploadService.verifyCookie(roomCode)
    } catch (error) {
      if (error.response.status !== 200 && to.name !== "BulletinLogin") {
        console.log("error", error);
        return { name: "BulletinLogin" };
      }
    }
  }
});

export default router;
