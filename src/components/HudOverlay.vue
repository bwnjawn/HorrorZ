<template>
  <div class="hud-container">
    <div class="hud-top-left">
      <div class="health-bar-container">
        <div class="health-bg"></div>
        <div class="health-fill" :style="{ width: healthPercentage + '%' }"></div>
        <div class="health-pulse-pattern"></div>
      </div>
    </div>

    <div class="hud-top-right">
      <div class="timer">
        <img src="../assets/ui/clock.png" alt="Reloj" class="icon" />
        <span class="blood-text">{{ formattedTime }}</span>
      </div>
      <div class="horde-counter">
        <img src="../assets/ui/craneo.png" alt="Calavera" class="icon" />
        <span class="blood-text">{{ store.zombieCount }} / {{ store.civilianCount }}</span>
      </div>
    </div>

    <div class="hud-bottom-right">
      <div class="skill-indicator" :class="{ active: store.isRegrouping, cooldown: store.regroupCooldown > 0 }">
        <span class="blood-text">
          {{ skillStatusText }}
        </span>
      </div>
    </div>
  </div>

  <div v-if="store.isGameOver" class="game-over-screen">
    <h1>HAS MUERTO</h1>
    <button @click="store.resetGame">Reiniciar</button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useGameStore } from '../stores/gameStore';

const store = useGameStore();

// Cálculo del porcentaje para achicar la barra roja de vida
const healthPercentage = computed(() => {
  return (store.playerHealth / store.playerMaxHealth) * 100;
});

// Formateo del tiempo
const formattedTime = computed(() => {
  const minutes = Math.floor(store.timeAlive / 60);
  const seconds = store.timeAlive % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Lógica para mostrar el texto adecuado de la habilidad
const skillStatusText = computed(() => {
  if (store.isRegrouping) return '¡REAGRUPANDO!';
  if (store.regroupCooldown > 0) return `ESPERA: ${store.regroupCooldown}s`;
  return 'ESPACIO: Reagrupar';
});
</script>

<style scoped>
.hud-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 10;
  font-family: 'Courier New', Courier, monospace;
  user-select: none;
}

/* --- POSICIONES DE LAS ESQUINAS --- */
.hud-top-left {
  position: absolute;
  top: 25px;
  left: 25px;
}

.hud-top-right {
  position: absolute;
  top: 25px;
  right: 25px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 15px;
}

.hud-bottom-right {
  position: absolute;
  bottom: 25px;
  right: 25px;
}

/* --- ESTILOS DE LA BARRA DE VIDA --- */
.health-bar-container {
  width: 250px;
  height: 30px;
  background-color: #333;
  border: 1px solid #111;
  position: relative;
  overflow: hidden;
  display: block;
}

.health-fill {
  height: 100%;
  background-color: #8b0000;
  transition: width 0.3s ease-out;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}

.health-pulse-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;

  background-image: url('../assets/ui/pulsos.png');
  background-repeat: repeat-x;
  background-size: contain;

  filter: brightness(0) invert(1);
  opacity: 0.5;
}

/* --- TEXTOS E ICONOS --- */
.blood-text {
  color: #f2f2f2;
  font-size: 1.6rem;
  font-weight: bold;
  margin-left: 12px;
}
.horde-counter,
.timer {
  display: flex;
  align-items: center;
}
.icon {
  width: 45px;
  height: 45px;
  filter: drop-shadow(1px 12px 12px rgba(0, 0, 0, 0.445));
}

.game-over-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  pointer-events: auto;
}

.game-over-screen h1 {
  color: #8b0000;
  font-family: 'Impact', sans-serif;
  font-size: 5rem;
  margin-bottom: 20px;
}

.game-over-screen button {
  padding: 15px 30px;
  background: #333;
  color: white;
  border: 2px solid #8b0000;
  font-size: 1.5rem;
  cursor: pointer;
}
</style>
