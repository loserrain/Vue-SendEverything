import "./assets/styles/base/_main.scss";

import { createApp } from "vue";
import { createPinia } from "pinia";
import { FontAwesomeIcon } from "./plugins/font-awesome";
import { library } from "@fortawesome/fontawesome-svg-core";
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
} from "@fortawesome/free-solid-svg-icons";

import App from "./App.vue";
import router from "./router";

import VueCountdown from '@chenfengyuan/vue-countdown';

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
  faCloudArrowUp
);

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.component(VueCountdown.name, VueCountdown);
app.component("font-awesome-icon", FontAwesomeIcon);

app.mount("#app");
