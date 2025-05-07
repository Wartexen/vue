import "./assets/main.css"

import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import authService from "./services/authService"

const app = createApp(App)

authService.setupAxiosInterceptors()

app.use(router)
app.mount("#app")
