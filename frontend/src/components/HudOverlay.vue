<template>
  <div class="hud-container">
    <div class="hud-top-left">
      <div class="bar-container health-bar">
        <div class="bar-bg"></div>
        <div class="bar-fill health-fill" :style="{ width: healthPercentage + '%' }"></div>
        <div class="pulse-pattern"></div>
      </div>

      <div class="bar-container stamina-bar">
        <div class="bar-bg"></div>
        <div class="bar-fill stamina-fill" :style="{ width: staminaPercentage + '%' }"></div>
      </div>
    </div>

    <div class="hud-top-right tactical-panel">
      <div class="info-row">
        <img src="/assets/ui/clock.png" alt="Reloj" class="icon icon-inverted" />
        <span class="modern-text">{{ formattedTime }}</span>
      </div>
      <div class="info-row">
        <img src="/assets/ui/craneo.png" alt="Calavera" class="icon icon-inverted" />
        <span class="modern-text">{{ store.zombieCount }} / {{ store.civilianCount }}</span>
      </div>
    </div>

    <div class="hud-bottom-right">
      <div class="skill-indicator tactical-panel" :class="{ active: store.isRegrouping, cooldown: store.regroupCooldown > 0 }">
        <span class="modern-text">
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

// Porcentaje Vida
const healthPercentage = computed(() => {
  if (store.playerMaxHealth <= 0) return 0;

  return (store.playerHealth / store.playerMaxHealth) * 100;
});

// Porcentaje Estamina
const staminaPercentage = computed(() => {
  if (store.playerMaxStamina <= 0) return 0;

  return (store.playerStamina / store.playerMaxStamina) * 100;
});

// Formateo del tiempo
const formattedTime = computed(() => {
  const minutes = Math.floor(store.timeAlive / 60);
  const seconds = store.timeAlive % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Textos de habilidad
const skillStatusText = computed(() => {
  if (store.isRegrouping) return '¡REAGRUPANDO!';
  if (store.regroupCooldown > 0) return `ESPERA: ${store.regroupCooldown}s`;

  return 'ESPACIO: Reagrupar';
});
</script>

<style scoped>
/* --- TIPOGRAFÍA MODERNA --- */
.hud-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 10;
  /* Fuente limpia y sin serifas */
  font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  user-select: none;
}

/* --- POSICIONES --- */
.hud-top-left {
  position: absolute;
  top: 30px;
  left: 30px;
  display: flex;
  flex-direction: column;
  gap: 8px; /* Separación muy sutil entre las barras */
}

.hud-top-right {
  position: absolute;
  top: 30px;
  right: 30px;
}

.hud-bottom-right {
  position: absolute;
  bottom: 30px;
  right: 30px;
}

/* --- BARRAS FLAT --- */
.bar-container {
  background-color: rgba(0, 0, 0, 0.4); /* Fondo translúcido */
  border-radius: 4px; /* Bordes ligeramente redondeados */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  display: block;
}

.health-bar {
  width: 240px;
  height: 16px; /* Barra de vida elegante */
}

.stamina-bar {
  width: 180px; /* Un poco más corta para dar jerarquía visual */
  height: 10px; /* Muy delgada */
}

.bar-bg {
  position: absolute;
  width: 100%;
  height: 100%;
}

.bar-fill {
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1; /* El fondo de la vida está detrás del pulso */
}

/* Colores planos pero vibrantes */
.health-fill {
  background-color: #a50000; /* Color sangre */
  transition: width 0.2s ease-out;
  z-index: 2;
}

.pulse-pattern {
  position: absolute;
  top: 0;
  left: 0%;
  width: 100%;
  height: 100%;
  z-index: 1;
  background-image: url('/assets/ui/pulsos.png');
  background-repeat: repeat-x;
  /* LA CORRECCIÓN: 'auto' mantiene la proporción original, '100%' lo ajusta al alto de la barra */
  background-size: auto 400%;
  background-position: center;
  filter: brightness(0) invert(1);
  opacity: 0.6; /* Ajustado para que sea legible pero integrado */
  animation: ekg-scroll 5s linear infinite; /* Velocidad suavizada */
}

/* Animación ajustada */
@keyframes ekg-scroll {
  0% {
    background-position-x: 0;
  }
  100% {
    background-position-x: 100px;
  } /* Ajusta este valor según el ancho real de tu imagen pulsos.png para un loop perfecto */
}

.stamina-fill {
  background-color: #00ccff;
  transition: width 0.01s linear;
}

/* --- PANEL MODERNO (DERECHA Y ABAJO) --- */
.tactical-panel {
  background-color: rgba(10, 10, 10, 0.6); /* Fondo semitransparente más limpio */
  backdrop-filter: blur(5px); /* Efecto de vidrio moderno */
  border-radius: 8px;
  padding: 12px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.icon {
  width: 28px;
  height: 28px;
}

.icon-inverted {
  filter: invert(1) opacity(0.9); /* Blanco limpio */
}

.modern-text {
  color: #ffffff;
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: 1px;
  margin-left: 10px;
}

/* Indicador de habilidad inferior */
.skill-indicator.active .modern-text {
  color: #ffaa00;
}
.skill-indicator.cooldown .modern-text {
  color: #888888;
}

/* --- GAME OVER --- */
.game-over-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  pointer-events: auto;
}

.game-over-screen h1 {
  color: #ff3333;
  font-family: 'Inter', sans-serif;
  font-weight: 900;
  font-size: 4rem;
  letter-spacing: 4px;
  margin-bottom: 30px;
  text-transform: uppercase;
}

.game-over-screen button {
  padding: 12px 36px;
  background: transparent;
  color: white;
  border: 2px solid #ff3333;
  border-radius: 4px;
  font-family: 'Inter', sans-serif;
  font-weight: bold;
  font-size: 1.2rem;
  cursor: pointer;
  letter-spacing: 2px;
  transition: all 0.2s ease;
}

.game-over-screen button:hover {
  background: #ff3333;
  color: #000;
  transform: scale(1.05);
}
</style>
