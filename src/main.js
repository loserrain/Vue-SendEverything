import "./assets/styles/base/_main.scss";

import { createApp } from "vue";
import { createPinia } from "pinia";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faEyeSlash,
  faSquarePlus,
  faEye,
  faSquareCheck,
  faSquare,
  faPenToSquare,
  faFolderOpen,
  faFile,
  faUser
} from "@fortawesome/free-regular-svg-icons";
import {
  faUsers,
  faFileArrowUp,
  faFileLines,
  faArrowUpFromBracket,
  faTrashCan,
  faCircleCheck,
  faPlus,
  faCircleArrowUp,
  faCircleArrowDown,
  faTriangleExclamation,
  faCloudArrowUp,
  faMagnifyingGlass,
  faGlobe,
  faLock,
  faLockOpen,
  faClockRotateLeft,
  faHouseUser,
  faChevronRight,
  faChevronLeft,
  faSignInAlt,
  faXmark,
  faGear,
  faWrench
} from "@fortawesome/free-solid-svg-icons";

import App from "./App.vue";
import router from "./router";

import VueCountdown from "@chenfengyuan/vue-countdown";

library.add(
  faUsers,
  faFileArrowUp,
  faFileLines,
  faArrowUpFromBracket,
  faTrashCan,
  faCircleCheck,
  faPlus,
  faCircleArrowUp,
  faCircleArrowDown,
  faTriangleExclamation,
  faCloudArrowUp,
  faSquarePlus,
  faMagnifyingGlass,
  faGlobe,
  faLock,
  faLockOpen,
  faClockRotateLeft,
  faHouseUser,
  faChevronRight,
  faChevronLeft,
  faSignInAlt,
  faEyeSlash,
  faEye,
  faXmark,
  faSquareCheck,
  faSquare,
  faPenToSquare,
  faGear,
  faFolderOpen,
  faFile,
  faUser,
  faWrench
);

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.component(VueCountdown.name, VueCountdown);
app.component("font-awesome-icon", FontAwesomeIcon);

app.mount("#app");
