import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/user'
import '@/styles/global.scss'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const userStore = useUserStore(pinia)

// httpBase emite este evento al recibir un 401: la sesión caducó.
window.addEventListener('auth:token-expired', () => {
  userStore.clear()
  if (router.currentRoute.value.meta.requiresAuth) {
    router.replace({ name: 'Login', query: { next: router.currentRoute.value.fullPath } })
  }
})

app.mount('#app')
