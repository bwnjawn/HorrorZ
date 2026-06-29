<template>
  <TerrorLayout>
    <div class="auth-corner">
      <div v-if="!authStore.isAuthenticated">
        <button class="auth-btn" @click="store.goToAuth()"><span class="auth-icon"></span> INICIAR SESIÓN</button>
      </div>
      <div v-else class="user-profile">
        <span class="username">{{ authStore.user?.username }}</span>
        <button class="logout-btn" @click="authStore.logout()" title="Cerrar Sesión">SALIR</button>
      </div>
    </div>

    <div v-if="currentView === 'title'" class="content">
      <div class="logo-wrapper">
        <p class="pre-title">— SOBREVIVE O CONTAGIA —</p>
        <h1 class="game-title"><span class="horror">HORROR</span><span class="z">Z</span></h1>
        <div class="title-underline"></div>
      </div>

      <p class="tagline">
        Lidera la horda. Infecta la ciudad.<br />
        <span class="tagline-accent">No dejes que te detengan.</span>
      </p>

      <div class="button-group">
        <button class="btn-start" @click="store.goToCharSelect()">
          <span class="btn-text">COMENZAR</span>
          <span class="btn-arrow">▶</span>
        </button>

        <button class="btn-controls" @click="store.goToLeaderboard()">
          <span class="btn-text">RANKING GLOBAL</span>
        </button>

        <button class="btn-controls" @click="currentView = 'controls'">
          <span class="btn-text">CONTROLES</span>
          <span class="btn-arrow">⚙</span>
        </button>
      </div>
    </div>

    <ControlsScreen v-else-if="currentView === 'controls'" @back="currentView = 'title'" />
  </TerrorLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '../stores/gameStore';
import { useAuthStore } from '../stores/authStore';
import TerrorLayout from './TerrorLayout.vue';
import ControlsScreen from './ControlsScreen.vue';

const store = useGameStore();
const authStore = useAuthStore();
const currentView = ref('title');

const activarMusicaAmbiental = () => {
  store.playMenuMusic();
};

onMounted(() => {
  store.playMenuMusic();
  window.addEventListener('click', activarMusicaAmbiental, { once: true });
  window.addEventListener('keydown', activarMusicaAmbiental, { once: true });
});

onUnmounted(() => {
  window.removeEventListener('click', activarMusicaAmbiental);
  window.removeEventListener('keydown', activarMusicaAmbiental);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Share+Tech+Mono&display=swap');

/* ── ESQUINA DE USUARIO ──────────────────────────────────────── */
.auth-corner {
  position: absolute;
  top: 25px;
  right: 35px;
  z-index: 100;
  animation: fadeIn 1s ease-out;
}

.auth-btn {
  background: rgba(20, 0, 0, 0.8);
  border: 1px solid #8b0000;
  color: #ff4444;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.2rem;
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: 0.1em;
  transition: all 0.3s ease;
}

.auth-btn:hover {
  background: #8b0000;
  color: #fff;
  box-shadow: 0 0 15px rgba(200, 0, 0, 0.6);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(10, 0, 0, 0.8);
  border: 1px solid #440000;
  padding: 6px 12px;
}

.username {
  color: #ff4444;
  font-family: 'Share Tech Mono', monospace;
  font-size: 1rem;
  text-shadow: 0 0 5px rgba(255, 0, 0, 0.5);
}

.logout-btn {
  background: transparent;
  border: 1px solid #ff4444;
  color: #ff4444;
  font-family: 'Bebas Neue', sans-serif;
  padding: 4px 10px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: #ff4444;
  color: #000;
  box-shadow: 0 0 10px #ff4444;
}

/* ── CONTENIDO CENTRAL ──────────────────────────────────────── */
.content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  text-align: center;
  animation: fadeIn 1.2s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── LOGO & TAGLINE ─────────────────────────────────────────── */
.logo-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.pre-title {
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.35em;
  color: #660000;
  margin: 0;
  text-transform: uppercase;
}
.game-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(5rem, 14vw, 10rem);
  line-height: 0.9;
  margin: 0;
  letter-spacing: -0.02em;
  filter: drop-shadow(0 0 40px rgba(200, 0, 0, 0.5));
  animation: titleFlicker 6s steps(1) infinite;
}
.horror {
  color: #e8e8e8;
  text-shadow:
    2px 2px 0 #1a0000,
    4px 4px 0 #0d0000;
}
.z {
  color: #eb3131;
  text-shadow:
    0 0 20px #ff0000,
    0 0 40px #cc0000,
    2px 2px 0 #4d0000;
}
.title-underline {
  width: 60%;
  height: 2px;
  background: linear-gradient(to right, transparent, #8b0000, #cc0000, #8b0000, transparent);
  margin-top: 4px;
}

@keyframes titleFlicker {
  0%,
  95%,
  100% {
    opacity: 1;
  }
  96% {
    opacity: 0.85;
  }
  97% {
    opacity: 1;
  }
  98% {
    opacity: 0.7;
  }
  99% {
    opacity: 1;
  }
}

.tagline {
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.95rem;
  color: #888;
  line-height: 1.8;
  margin: 0;
  animation: fadeIn 1.2s ease-out 0.4s both;
}
.tagline-accent {
  color: #cc4444;
  font-size: 1rem;
}

/* ── BOTONES PRINCIPALES ────────────────────────────────────── */
.button-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 280px;
}

.btn-start,
.btn-controls {
  position: relative;
  background: rgba(10, 0, 0, 0.6);
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.6rem;
  letter-spacing: 0.2em;
  padding: 14px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.2s ease;
  overflow: hidden;
  animation: fadeIn 1.2s ease-out 0.7s both;
  width: 100%;
}

.btn-start {
  border: 2px solid #8b0000;
  color: #ff4444;
}

.btn-controls {
  border: 2px solid #444;
  color: #aaa;
  animation-delay: 0.9s;
}

.btn-start::before,
.btn-controls::before {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-101%);
  transition: transform 0.25s ease;
  z-index: 0;
}

.btn-start::before {
  background: #8b0000;
}
.btn-controls::before {
  background: #333;
}

.btn-start:hover::before,
.btn-controls:hover::before {
  transform: translateX(0);
}

.btn-start:hover {
  color: #fff;
  border-color: #cc0000;
  box-shadow: 0 0 30px rgba(200, 0, 0, 0.4);
}
.btn-controls:hover {
  color: #fff;
  border-color: #666;
}

.btn-text,
.btn-arrow {
  position: relative;
  z-index: 1;
}
.btn-arrow {
  font-size: 1rem;
  transition: transform 0.2s;
}
.btn-start:hover .btn-arrow,
.btn-controls:hover .btn-arrow {
  transform: translateX(4px);
}
</style>
