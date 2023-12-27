import './assets/styles/base/_main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { FontAwesomeIcon } from './plugins/font-awesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faUsers, faFileArrowUp, faFileLines, faArrowUpFromBracket, faTrashCan, faCircleCheck, faFolder, faFolderPlus } from '@fortawesome/free-solid-svg-icons'

import App from './App.vue'
import router from './router'

library.add(faUsers, faFileArrowUp, faFileLines, faArrowUpFromBracket, faTrashCan, faCircleCheck, faFolderPlus)

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.component("font-awesome-icon", FontAwesomeIcon)

app.mount('#app')
