import { createApp } from 'vue'
import { createPinia } from 'pinia' // 1. Importante para el estado del juego
import App from './App.vue'
import router from './router'      // 2. Importante para las pantallas

const app = createApp(App)

// 3. Activación de herramientas
app.use(createPinia()) 
app.use(router)

// 4. Conexión final
app.mount('#app')