<template>
  <div class="score-screen">

    <!-- Overlay oscuro animado -->
    <div class="bg-overlay"></div>

    <!-- Partículas de sangre -->
    <div class="splatter">
      <span v-for="n in 6" :key="n" class="splat" :style="splatStyle(n)"></span>
    </div>

    <div class="content">

      <!-- Título de muerte -->
      <div class="death-title-block">
        <p class="pre-label">— FIN DE LA INFECCIÓN —</p>
        <h1 class="death-title">HAS CAÍDO</h1>
        <p class="death-subtitle">La resistencia te detuvo. Por ahora.</p>
      </div>

      <!-- Clase jugada -->
      <div class="class-played">
        <span class="cl-label">CLASE</span>
        <span class="cl-name">{{ store.selectedZombieConfig?.name ?? '—' }}</span>
      </div>

      <!-- Panel de estadísticas -->
      <div class="stats-panel">
        <div class="stat-item">
          <div class="stat-icon">⏱</div>
          <div class="stat-data">
            <span class="stat-number">{{ store.formattedTime }}</span>
            <span class="stat-desc">Tiempo sobrevivido</span>
          </div>
        </div>

        <div class="stat-divider"></div>

        <div class="stat-item">
          <div class="stat-icon">☣</div>
          <div class="stat-data">
            <span class="stat-number">{{ store.totalInfected }}</span>
            <span class="stat-desc">Civiles infectados</span>
          </div>
        </div>

        <div class="stat-divider"></div>

        <div class="stat-item">
          <div class="stat-icon">💀</div>
          <div class="stat-data">
            <span class="stat-number">{{ store.maxHordeSize }}</span>
            <span class="stat-desc">Pico máximo de horda</span>
          </div>
        </div>

        <div class="stat-divider"></div>

        <div class="stat-item">
          <div class="stat-icon">🧟</div>
          <div class="stat-data">
            <span class="stat-number">{{ store.zombieCount }}</span>
            <span class="stat-desc">Zombis al morir</span>
          </div>
        </div>
      </div>

      <!-- Puntuación calculada -->
      <div class="final-score">
        <span class="score-label">PUNTUACIÓN FINAL</span>
        <span class="score-value">{{ finalScore.toLocaleString() }}</span>
      </div>

      <!-- Botones de acción -->
      <div class="action-buttons">
        <button class="btn btn-retry" @click="retryGame()">
          <span>↺</span> REINTENTAR
        </button>
        <button class="btn btn-menu" @click="goToMenu()">
          <span>⌂</span> MENÚ PRINCIPAL
        </button>
      </div>

      <!-- Fórmula de puntuación -->
      <p class="score-formula">
        Puntuación = infectados × 100 + segundos × 10 + pico_horda × 50
      </p>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useGameStore } from '../stores/gameStore';

const store = useGameStore();

const finalScore = computed(() => {
  return store.totalInfected * 100 + store.timeAlive * 10 + store.maxHordeSize * 50;
});

function retryGame() {
  const lastZombie = store.selectedZombie;
  store.resetGame();
  // Volver directamente a selección de personaje
  store.currentView = 'charSelect';
}

function goToMenu() {
  store.resetGame(); // resetGame ya setea currentView = 'title'
}

// Posiciones decorativas para las manchas de sangre
function splatStyle(n) {
  const data = [
    { top: '5%',  left: '3%',  size: '80px',  rot: '20deg'  },
    { top: '2%',  left: '88%', size: '60px',  rot: '-15deg' },
    { top: '15%', left: '95%', size: '45px',  rot: '45deg'  },
    { top: '80%', left: '1%',  size: '70px',  rot: '-30deg' },
    { top: '88%', left: '90%', size: '55px',  rot: '10deg'  },
    { top: '70%', left: '96%', size: '40px',  rot: '60deg'  },
  ];
  const d = data[n - 1];
  return {
    top: d.top, left: d.left,
    width: d.size, height: d.size,
    transform: `rotate(${d.rot})`,
  };
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Share+Tech+Mono&display=swap');

/* ── BASE ───────────────────────────────────────────────────── */
.score-screen {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Share Tech Mono', monospace;
  overflow: hidden;
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background: #000;
  animation: overlayIn 0.6s ease-out forwards;
}
@keyframes overlayIn {
  from { opacity: 0; }
  to   { opacity: 0.94; }
}

/* ── MANCHAS DECORATIVAS ────────────────────────────────────── */
.splatter { position: absolute; inset: 0; pointer-events: none; }
.splat {
  position: absolute;
  border-radius: 50% 40% 55% 45%;
  background: radial-gradient(circle at 40% 40%, #8b0000, #4d0000 60%, transparent);
  opacity: 0;
  animation: splatIn 0.4s ease-out 0.5s forwards;
}
@keyframes splatIn {
  from { opacity: 0; transform: scale(0) rotate(var(--rot, 0deg)); }
  to   { opacity: 0.35; transform: scale(1) rotate(var(--rot, 0deg)); }
}

/* ── CONTENIDO ──────────────────────────────────────────────── */
.content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 32px 24px;
  width: 100%;
  max-width: 700px;
  animation: contentIn 0.6s ease-out 0.3s both;
}
@keyframes contentIn {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── TÍTULO ─────────────────────────────────────────────────── */
.death-title-block { text-align: center; }
.pre-label {
  font-size: 0.65rem;
  letter-spacing: 0.4em;
  color: #550000;
  margin: 0 0 4px;
  text-transform: uppercase;
}
.death-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(4rem, 12vw, 7rem);
  margin: 0;
  line-height: 1;
  color: #cc0000;
  text-shadow: 0 0 40px rgba(200, 0, 0, 0.6), 3px 3px 0 #2d0000;
  animation: titleShake 0.5s ease-out 0.4s both;
}
@keyframes titleShake {
  0%  { transform: translateX(-8px); }
  25% { transform: translateX(6px); }
  50% { transform: translateX(-4px); }
  75% { transform: translateX(2px); }
  100%{ transform: translateX(0); }
}
.death-subtitle {
  font-size: 0.8rem;
  color: #555;
  margin: 6px 0 0;
  font-style: italic;
}

/* ── CLASE ──────────────────────────────────────────────────── */
.class-played {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #2a0000;
  padding: 8px 20px;
  background: #0d0000;
}
.cl-label {
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  color: #440000;
}
.cl-name {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.2rem;
  color: #cc4444;
  letter-spacing: 0.1em;
}

/* ── PANEL DE STATS ─────────────────────────────────────────── */
.stats-panel {
  display: flex;
  align-items: stretch;
  gap: 0;
  border: 1px solid #1e1e1e;
  background: #0a0a0a;
  width: 100%;
}
.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 16px;
  text-align: center;
  transition: background 0.2s;
}
.stat-item:hover { background: #0f0000; }
.stat-icon  { font-size: 1.4rem; }
.stat-data  { display: flex; flex-direction: column; gap: 4px; }
.stat-number {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 2rem;
  color: #cc3333;
  line-height: 1;
}
.stat-desc  { font-size: 0.65rem; color: #555; letter-spacing: 0.05em; }
.stat-divider {
  width: 1px;
  background: #1e1e1e;
  align-self: stretch;
}

/* ── PUNTUACIÓN FINAL ───────────────────────────────────────── */
.final-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.score-label {
  font-size: 0.65rem;
  letter-spacing: 0.4em;
  color: #660000;
  text-transform: uppercase;
}
.score-value {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 3.5rem;
  color: #ff6633;
  text-shadow: 0 0 20px rgba(255, 100, 50, 0.4);
  letter-spacing: 0.05em;
  animation: scoreCount 1s ease-out 0.8s both;
}
@keyframes scoreCount {
  from { opacity: 0; transform: scale(0.5); }
  to   { opacity: 1; transform: scale(1); }
}

/* ── BOTONES ─────────────────────────────────────────────────── */
.action-buttons {
  display: flex;
  gap: 16px;
}
.btn {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.1rem;
  letter-spacing: 0.15em;
  padding: 12px 28px;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}
.btn-retry {
  background: #8b0000;
  color: #fff;
  border: 1px solid #cc0000;
}
.btn-retry:hover {
  background: #aa0000;
  box-shadow: 0 0 20px rgba(200, 0, 0, 0.4);
  transform: scale(1.04);
}
.btn-menu {
  background: transparent;
  color: #888;
  border: 1px solid #333;
}
.btn-menu:hover {
  border-color: #666;
  color: #bbb;
}

/* ── FÓRMULA ─────────────────────────────────────────────────── */
.score-formula {
  font-size: 0.6rem;
  color: #2a2a2a;
  margin: 0;
  text-align: center;
}
</style>
