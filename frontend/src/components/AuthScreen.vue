<template>
  <TerrorLayout>
    <div class="content auth-container">
      <div class="death-title-block">
        <p class="pre-label">— {{ isLogin ? 'IDENTIFÍCATE' : 'ÚNETE A LA HORDA' }} —</p>
        <h1 class="death-title">{{ isLogin ? 'ACCESO' : 'REGISTRO' }}</h1>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div class="inputs-group">
          <input v-model="username" type="text" placeholder="Nombre de Usuario" class="terror-input" required />
          <input v-model="password" type="password" placeholder="Contraseña" class="terror-input" required />
        </div>

        <p v-if="authStore.error" class="error-msg">{{ authStore.error }}</p>

        <div class="main-actions">
          <button class="btn-action primary" type="submit" :disabled="isLoading">
            {{ isLoading ? 'PROCESANDO...' : isLogin ? 'INICIAR SESIÓN' : 'CREAR CUENTA' }}
          </button>

          <button class="toggle-mode-btn" type="button" @click="toggleMode">
            {{ isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión' }}
          </button>
        </div>

        <div class="divider"><span>O</span></div>

        <div class="secondary-actions">
          <div class="guest-wrapper">
            <button class="btn-action guest" type="button" @click="store.goToTitle()">CONTINUAR COMO INVITADO</button>
            <p class="warning-text">⚠️ Tu progreso y puntaje no se guardarán en el ranking global.</p>
          </div>

          <button class="btn-action back" type="button" @click="store.goToTitle()">VOLVER AL INICIO</button>
        </div>
      </form>
    </div>
  </TerrorLayout>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore';
import TerrorLayout from './TerrorLayout.vue';

const authStore = useAuthStore();
const store = useGameStore();

const isLogin = ref(true);
const username = ref('');
const password = ref('');
const isLoading = ref(false);

const toggleMode = () => {
  isLogin.value = !isLogin.value;
  authStore.error = null;
};

const handleSubmit = async () => {
  isLoading.value = true;
  let success;

  if (isLogin.value) {
    success = await authStore.login(username.value, password.value);
  } else {
    success = await authStore.register(username.value, password.value);
  }

  isLoading.value = false;

  if (success) {
    store.goToTitle();
  }
};
</script>

<style scoped>
*,
*::before,
*::after {
  box-sizing: border-box;
}

.auth-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  z-index: 10;
  position: relative;
  animation: fadeIn 0.8s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.death-title-block {
  text-align: center;
  margin-bottom: 2rem;
}

.pre-label {
  font-family: 'Courier New', Courier, monospace;
  color: #a00;
  letter-spacing: 0.3em;
  font-size: 0.9rem;
  margin-bottom: -15px;
}

.death-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 4.5rem;
  color: #ff3333;
  margin: 0;
  text-shadow: 0 0 15px rgba(200, 0, 0, 0.7);
  letter-spacing: 0.05em;
}

.auth-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 380px;
  background: rgba(10, 0, 0, 0.85);
  border: 2px solid #5a0000;
  padding: 2rem;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.9);
}

.inputs-group {
  width: 100%;
  margin-bottom: 15px;
}

.terror-input {
  width: 100%;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid #4a0000;
  color: #fff;
  font-family: 'Courier New', Courier, monospace;
  font-size: 1.1rem;
  padding: 14px;
  margin-bottom: 12px;
  text-align: center;
  outline: none;
  transition: all 0.3s;
}

.terror-input:focus {
  border-color: #ff3333;
  background: rgba(20, 0, 0, 0.9);
  box-shadow: inset 0 0 10px rgba(255, 0, 0, 0.2);
}

.error-msg {
  color: #ff4444;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9rem;
  text-align: center;
  text-shadow: 0 0 5px rgba(255, 0, 0, 0.5);
  margin-top: 0;
  margin-bottom: 15px;
}

.main-actions,
.secondary-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.btn-action {
  width: 100%;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.5rem;
  letter-spacing: 0.15em;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 10px;
}

.primary {
  background: transparent;
  border: 2px solid #8b0000;
  color: #ff4444;
}

.primary:hover:not(:disabled) {
  background: #8b0000;
  color: #fff;
  box-shadow: 0 0 15px #cc0000;
}

.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toggle-mode-btn {
  background: none;
  border: none;
  color: #aaa;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.85rem;
  text-decoration: underline;
  cursor: pointer;
  padding: 5px;
  margin-bottom: 5px;
}

.toggle-mode-btn:hover {
  color: #fff;
}

.divider {
  width: 100%;
  text-align: center;
  border-bottom: 1px solid #440000;
  line-height: 0.1em;
  margin: 25px 0;
}
.divider span {
  background: #0a0000;
  padding: 0 10px;
  color: #660000;
  font-family: 'Bebas Neue', sans-serif;
}

.guest-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.guest {
  border: 2px solid #5a5a00;
  color: #cccc00;
  background: rgba(20, 20, 0, 0.4);
}

.guest:hover {
  background: #5a5a00;
  color: #fff;
  box-shadow: 0 0 15px #cccc00;
}

.warning-text {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.75rem;
  color: #999;
  text-align: center;
  margin: 5px 0 12px 0;
}

.back {
  border: 2px solid #444;
  color: #aaa;
  background: transparent;
}

.back:hover {
  border-color: #777;
  color: #fff;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
}
</style>
