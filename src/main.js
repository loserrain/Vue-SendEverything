import "./assets/styles/base/_main.scss";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

import { FontAwesomeIcon } from './Fontawesome'
// import VueCountdown from "@chenfengyuan/vue-countdown";

const app = createApp(App);

app.use(createPinia());
app.use(router);
// app.component(VueCountdown.name, VueCountdown);
app.component("font-awesome-icon", FontAwesomeIcon);

app.mount("#app");
