<template>
  <div class="char-select">

    <!-- Header -->
    <div class="header">
      <button class="btn-back" @click="store.goToTitle()">◀ VOLVER</button>
      <div class="header-center">
        <p class="section-label">ELIGE TU LÍDER</p>
        <h2 class="screen-title">SELECCIÓN DE CLASE</h2>
      </div>
      <div class="header-spacer"></div>
    </div>

    <!-- Grid de personajes -->
    <div class="zombie-grid">
      <div
        v-for="zombie in zombies"
        :key="zombie.id"
        class="zombie-card"
        :class="{ selected: selectedId === zombie.id }"
        @click="selectedId = zombie.id"
      >
        <!-- Indicador de selección -->
        <div class="card-corner card-corner-tl"></div>
        <div class="card-corner card-corner-br"></div>

        <!-- Badge de clase -->
        <div class="class-badge">{{ zombie.id.toUpperCase() }}</div>

        <h2 class="char-name">{{ zombie.name }}</h2>
        <p class="char-desc">{{ zombie.description }}</p>

        <!-- Barras de stats -->
        <div class="stats-block">
          <div class="stat-row">
            <span class="stat-label">VIDA</span>
            <div class="stat-bar-bg">
              <div class="stat-bar stat-bar-health" :style="{ width: pct(zombie.baseHealth, 400) + '%' }"></div>
            </div>
            <span class="stat-val">{{ zombie.baseHealth }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">VEL</span>
            <div class="stat-bar-bg">
              <div class="stat-bar stat-bar-speed" :style="{ width: pct(zombie.baseSpeed, 400) + '%' }"></div>
            </div>
            <span class="stat-val">{{ zombie.baseSpeed }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">STA</span>
            <div class="stat-bar-bg">
              <div class="stat-bar stat-bar-stamina" :style="{ width: pct(zombie.maxStamina, 250) + '%' }"></div>
            </div>
            <span class="stat-val">{{ zombie.maxStamina }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">DMG</span>
            <div class="stat-bar-bg">
              <div class="stat-bar stat-bar-damage" :style="{ width: pct(zombie.baseDamage, 50) + '%' }"></div>
            </div>
            <span class="stat-val">{{ zombie.baseDamage }}</span>
          </div>
        </div>

        <!-- Habilidad pasiva -->
        <div class="passive-box">
          <span class="passive-icon">⚡</span>
          <p class="passive-text">{{ zombie.passiveDescription }}</p>
        </div>

        <!-- Cooldown de habilidad -->
        <div class="ability-cooldown">
          <span class="cd-label">CD habilidad:</span>
          <span class="cd-val">{{ (zombie.abilityCooldown / 1000).toFixed(1) }}s</span>
        </div>
      </div>
    </div>

    <!-- Panel de confirmación inferior -->
    <div class="confirm-bar">
      <template v-if="selectedId">
        <span class="confirm-hint">
          Jugando como <strong>{{ selectedName }}</strong>
        </span>
        <button class="btn-play" @click="seleccionarPersonaje()">
          <span>DESATAR LA HORDA</span>
          <span class="play-arrow">☣</span>
        </button>
      </template>
      <template v-else>
        <span class="confirm-hint muted">Selecciona un personaje para continuar</span>
      </template>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useGameStore } from '../stores/gameStore';
import { PLAYER_TYPES } from '../game/config/PlayerStatsConfig';

const store = useGameStore();
const zombies = Object.values(PLAYER_TYPES);
const selectedId = ref(null);

const selectedName = computed(() => {
  const z = zombies.find((z) => z.id === selectedId.value);
  return z ? z.name : '';
});

// Normaliza un valor a porcentaje para las barras
function pct(value, max) {
  return Math.min(100, Math.round((value / max) * 100));
}

function seleccionarPersonaje() {
  if (!selectedId.value) return;
  store.startGame(selectedId.value);
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Share+Tech+Mono&display=swap');

/* ── LAYOUT ─────────────────────────────────────────────────── */
.char-select {
  position: fixed;
  inset: 0;
  background: #080808;
  background-image:
    radial-gradient(ellipse 100% 50% at 50% 0%, #1a0000 0%, transparent 60%),
    repeating-linear-gradient(
      0deg, transparent, transparent 2px,
      rgba(255, 0, 0, 0.012) 2px, rgba(255, 0, 0, 0.012) 4px
    );
  color: #e0e0e0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  overflow-y: auto;
  z-index: 9999;
  font-family: 'Share Tech Mono', monospace;
}

/* ── HEADER ─────────────────────────────────────────────────── */
.header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 32px 16px;
  border-bottom: 1px solid #1e0000;
  flex-shrink: 0;
}
.header-center { text-align: center; }
.header-spacer { width: 100px; }

.section-label {
  font-size: 0.65rem;
  letter-spacing: 0.4em;
  color: #660000;
  margin: 0 0 2px;
}
.screen-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.8rem;
  letter-spacing: 0.12em;
  color: #cc3333;
  margin: 0;
}
.btn-back {
  background: transparent;
  border: 1px solid #2a0000;
  color: #663333;
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.75rem;
  padding: 8px 16px;
  cursor: pointer;
  letter-spacing: 0.1em;
  transition: all 0.2s;
}
.btn-back:hover {
  border-color: #8b0000;
  color: #cc4444;
}

/* ── GRID ───────────────────────────────────────────────────── */
.zombie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  padding: 28px 32px;
  width: 100%;
  max-width: 1200px;
  flex: 1;
}

/* ── CARD ───────────────────────────────────────────────────── */
.zombie-card {
  position: relative;
  background: #0e0e0e;
  border: 1px solid #1e1e1e;
  padding: 20px 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.zombie-card:hover {
  border-color: #550000;
  background: #111;
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(140, 0, 0, 0.2);
}
.zombie-card.selected {
  border-color: #cc0000;
  background: #130000;
  box-shadow: 0 0 0 1px #8b0000, 0 8px 32px rgba(200, 0, 0, 0.25);
}

/* Esquinas decorativas en la card */
.card-corner {
  position: absolute;
  width: 14px;
  height: 14px;
  opacity: 0;
  transition: opacity 0.2s;
}
.zombie-card.selected .card-corner,
.zombie-card:hover .card-corner { opacity: 1; }
.card-corner-tl { top: -1px; left: -1px; border-top: 2px solid #cc0000; border-left: 2px solid #cc0000; }
.card-corner-br { bottom: -1px; right: -1px; border-bottom: 2px solid #cc0000; border-right: 2px solid #cc0000; }

.class-badge {
  position: absolute;
  top: 10px;
  right: 12px;
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  color: #440000;
  border: 1px solid #2a0000;
  padding: 2px 6px;
}
.zombie-card.selected .class-badge { color: #cc4444; border-color: #660000; }

.char-name {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.6rem;
  letter-spacing: 0.05em;
  margin: 0;
  color: #e0e0e0;
}
.zombie-card.selected .char-name { color: #ff6666; }

.char-desc {
  font-size: 0.78rem;
  color: #666;
  margin: 0;
  line-height: 1.5;
  font-style: italic;
  min-height: 48px;
}

/* ── BARRAS DE STATS ────────────────────────────────────────── */
.stats-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: #080808;
  padding: 10px 10px;
  border: 1px solid #1a1a1a;
}
.stat-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.stat-label {
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  color: #555;
  width: 28px;
  flex-shrink: 0;
}
.stat-bar-bg {
  flex: 1;
  height: 5px;
  background: #1a1a1a;
  border-radius: 2px;
  overflow: hidden;
}
.stat-bar {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s ease;
}
.stat-bar-health  { background: linear-gradient(to right, #8b0000, #cc0000); }
.stat-bar-speed   { background: linear-gradient(to right, #004488, #0088ff); }
.stat-bar-stamina { background: linear-gradient(to right, #005500, #00cc44); }
.stat-bar-damage  { background: linear-gradient(to right, #884400, #ff8800); }
.stat-val {
  font-size: 0.65rem;
  color: #444;
  width: 28px;
  text-align: right;
}

/* ── PASIVA ─────────────────────────────────────────────────── */
.passive-box {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #0a0500;
  border-left: 2px solid #5c3a00;
  padding: 8px 10px;
}
.passive-icon { font-size: 0.9rem; flex-shrink: 0; }
.passive-text {
  font-size: 0.72rem;
  color: #cc8833;
  margin: 0;
  line-height: 1.4;
  min-height: 36px;
}

/* ── COOLDOWN ───────────────────────────────────────────────── */
.ability-cooldown {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  font-size: 0.65rem;
}
.cd-label { color: #444; }
.cd-val   { color: #777; }

/* ── BARRA INFERIOR ─────────────────────────────────────────── */
.confirm-bar {
  width: 100%;
  padding: 18px 32px;
  border-top: 1px solid #1e0000;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  flex-shrink: 0;
  background: #0a0000;
}
.confirm-hint {
  font-size: 0.85rem;
  color: #888;
}
.confirm-hint strong { color: #cc4444; }
.confirm-hint.muted  { color: #333; font-style: italic; }

.btn-play {
  background: #8b0000;
  border: 1px solid #cc0000;
  color: #fff;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.2rem;
  letter-spacing: 0.2em;
  padding: 12px 36px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
}
.btn-play:hover {
  background: #aa0000;
  box-shadow: 0 0 24px rgba(200, 0, 0, 0.5);
  transform: scale(1.03);
}
.play-arrow { font-size: 1.1rem; }
</style>
