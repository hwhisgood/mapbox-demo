import {createApp} from "vue"
import App from "@/App.vue"
import router from "@/router/index"
import store from "@/store/index"

import "font-awesome/css/font-awesome.min.css"

import ElementPlus from "element-plus"
import "element-plus/lib/theme-chalk/index.css"

createApp(App).use(router).use(store).use(ElementPlus).mount("#app");
