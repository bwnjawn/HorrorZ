<template>
  <div class="pause-overlay">
    <div class="pause-container">
      <h1 class="pause-title">JUEGO EN PAUSA</h1>

      <div class="menu-options">
        <button class="btn-pause" @click="resumeGame">REANUDAR</button>
        <button class="btn-pause btn-quit" @click="quitMenu">SALIR AL MENÚ</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGameStore } from '../stores/gameStore';

const store = useGameStore();

function resumeGame() {
  store.togglePause();
  // Emitimos un evento global para que Phaser se entere si le diste clic al botón de Vue
  window.dispatchEvent(new CustomEvent('vue-resume-game'));
}

function quitMenu() {
  store.resetGame();
}
</script>

<style scoped>
.pause-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000; /* Por encima de todo */
  font-family: 'Share Tech Mono', monospace;
}

.pause-container {
  text-align: center;
  border: 2px solid #5a0000;
  padding: 40px 60px;
  background: #0a0a0a;
  box-shadow: 0 0 30px rgba(139, 0, 0, 0.4);
}

.pause-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 3.5rem;
  color: #8b0000;
  letter-spacing: 4px;
  margin-bottom: 30px;
  text-shadow: 0 0 10px rgba(255, 0, 0, 0.6);
  animation: pulse 2s infinite ease-in-out;
}

.menu-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.btn-pause {
  background: transparent;
  border: 1px solid #8b0000;
  color: #fff;
  padding: 12px 30px;
  font-size: 1.2rem;
  cursor: pointer;
  letter-spacing: 2px;
  transition: all 0.3s ease;
}

.btn-pause:hover {
  background: #8b0000;
  box-shadow: 0 0 15px rgba(255, 0, 0, 0.8);
  transform: scale(1.05);
}

.btn-quit:hover {
  background: #333;
  border-color: #555;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.9;
  }
  50% {
    opacity: 0.6;
  }
}
</style>
