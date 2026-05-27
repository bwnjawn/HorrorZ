<template>
  <div class="title-screen">
    <!-- Fondo con partículas de niebla -->
    <div class="fog fog-1"></div>
    <div class="fog fog-2"></div>
    <div class="fog fog-3"></div>

    <!-- Gotas de sangre decorativas -->
    <div class="blood-drops">
      <span v-for="n in 8" :key="n" class="drop" :style="dropStyle(n)"></span>
    </div>

    <div class="content">
      <!-- Logo -->
      <div class="logo-wrapper">
        <p class="pre-title">— SOBREVIVE O CONTAGIA —</p>
        <h1 class="game-title">
          <span class="horror">HORROR</span><span class="z">Z</span>
        </h1>
        <div class="title-underline"></div>
      </div>

      <!-- Tagline -->
      <p class="tagline">
        Lidera la horda. Infecta la ciudad.<br />
        <span class="tagline-accent">No dejes que te detengan.</span>
      </p>

      <!-- Botón principal -->
      <button class="btn-start" @click="store.goToCharSelect()">
        <span class="btn-text">COMENZAR</span>
        <span class="btn-arrow">▶</span>
      </button>

      <!-- Controles rápidos -->
      <div class="controls-hint">
        <div class="hint-row">
          <kbd>WASD</kbd><span>Mover</span>
          <kbd>SHIFT</kbd><span>Correr</span>
          <kbd>CLIC IZQ</kbd><span>Atacar / Mantener: Ataque Cargado</span>
        </div>
        <div class="hint-row">
          <kbd>CLIC DER</kbd><span>Habilidad especial</span>
          <kbd>ESPACIO</kbd><span>Reagrupar horda</span>
        </div>
      </div>
    </div>

    <!-- Esquinas decorativas -->
    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>
  </div>
</template>

<script setup>
import { useGameStore } from '../stores/gameStore';

const store = useGameStore();

// Posiciones aleatorias pero deterministas para las gotas
function dropStyle(n) {
  const positions = [8, 17, 28, 41, 55, 68, 79, 91];
  const delays = [0, 0.8, 1.4, 0.3, 1.9, 0.6, 1.2, 2.1];
  const heights = [60, 45, 80, 55, 70, 40, 65, 50];

  return {
    left: `${positions[n - 1]}%`,
    animationDelay: `${delays[n - 1]}s`,
    height: `${heights[n - 1]}px`,
  };
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Share+Tech+Mono&display=swap');

/* ── FONDO Y LAYOUT ─────────────────────────────────────────── */
.title-screen {
  position: fixed;
  inset: 0;
  background: #080808;
  background-image:
    radial-gradient(ellipse 80% 60% at 50% 100%, #1a0000 0%, transparent 70%),
    radial-gradient(ellipse 50% 30% at 20% 50%, #0d0005 0%, transparent 60%),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(255, 0, 0, 0.015) 2px,
      rgba(255, 0, 0, 0.015) 4px
    );
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  font-family: 'Share Tech Mono', monospace;
}

/* ── NIEBLA ─────────────────────────────────────────────────── */
.fog {
  position: absolute;
  bottom: 0;
  left: -20%;
  width: 140%;
  border-radius: 50%;
  pointer-events: none;
  opacity: 0;
  animation: fogDrift 18s ease-in-out infinite;
}
.fog-1 {
  height: 35vh;
  background: radial-gradient(ellipse at center bottom, rgba(100, 0, 0, 0.18) 0%, transparent 70%);
  animation-duration: 20s;
  animation-delay: 0s;
}
.fog-2 {
  height: 25vh;
  left: -30%;
  background: radial-gradient(ellipse at center bottom, rgba(50, 0, 20, 0.14) 0%, transparent 70%);
  animation-duration: 25s;
  animation-delay: -8s;
}
.fog-3 {
  height: 20vh;
  left: 10%;
  background: radial-gradient(ellipse at center bottom, rgba(0, 0, 0, 0.3) 0%, transparent 70%);
  animation-duration: 15s;
  animation-delay: -4s;
}
@keyframes fogDrift {
  0%, 100% { opacity: 0; transform: translateX(0) scaleX(1); }
  30%       { opacity: 1; }
  50%       { opacity: 0.8; transform: translateX(5%) scaleX(1.05); }
  70%       { opacity: 1; }
}

/* ── GOTAS DE SANGRE ────────────────────────────────────────── */
.blood-drops {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  pointer-events: none;
}
.drop {
  position: absolute;
  top: 0;
  width: 3px;
  border-radius: 0 0 50% 50%;
  background: linear-gradient(to bottom, #8b0000, #cc0000, #ff000088);
  opacity: 0;
  animation: drip 4s ease-in infinite;
}
@keyframes drip {
  0%   { opacity: 0; transform: scaleY(0); transform-origin: top; }
  15%  { opacity: 1; transform: scaleY(1); }
  85%  { opacity: 1; }
  100% { opacity: 0; }
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
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── LOGO ───────────────────────────────────────────────────── */
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
  color: #cc0000;
  text-shadow:
    0 0 20px #ff0000,
    0 0 40px #cc0000,
    2px 2px 0 #4d0000;
}
@keyframes titleFlicker {
  0%, 95%, 100% { opacity: 1; }
  96%           { opacity: 0.85; }
  97%           { opacity: 1; }
  98%           { opacity: 0.7; }
  99%           { opacity: 1; }
}
.title-underline {
  width: 60%;
  height: 2px;
  background: linear-gradient(to right, transparent, #8b0000, #cc0000, #8b0000, transparent);
  margin-top: 4px;
}

/* ── TAGLINE ────────────────────────────────────────────────── */
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

/* ── BOTÓN ──────────────────────────────────────────────────── */
.btn-start {
  position: relative;
  background: transparent;
  border: 2px solid #8b0000;
  color: #ff4444;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.5rem;
  letter-spacing: 0.2em;
  padding: 14px 52px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
  overflow: hidden;
  animation: fadeIn 1.2s ease-out 0.7s both;
}
.btn-start::before {
  content: '';
  position: absolute;
  inset: 0;
  background: #8b0000;
  transform: translateX(-101%);
  transition: transform 0.25s ease;
  z-index: 0;
}
.btn-start:hover::before { transform: translateX(0); }
.btn-start:hover {
  color: #fff;
  border-color: #cc0000;
  box-shadow: 0 0 30px rgba(200, 0, 0, 0.4);
}
.btn-text, .btn-arrow {
  position: relative;
  z-index: 1;
}
.btn-arrow {
  font-size: 1rem;
  transition: transform 0.2s;
}
.btn-start:hover .btn-arrow { transform: translateX(4px); }

/* ── HINTS DE CONTROLES ─────────────────────────────────────── */
.controls-hint {
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: fadeIn 1.2s ease-out 1s both;
}
.hint-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}
kbd {
  background: #1a1a1a;
  border: 1px solid #333;
  border-bottom: 2px solid #444;
  color: #aaa;
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.7rem;
  padding: 3px 7px;
  border-radius: 3px;
}
.hint-row span {
  font-size: 0.72rem;
  color: #555;
  margin-right: 8px;
}

/* ── ESQUINAS DECORATIVAS ───────────────────────────────────── */
.corner {
  position: absolute;
  width: 40px;
  height: 40px;
  opacity: 0.4;
}
.corner-tl { top: 20px; left: 20px; border-top: 2px solid #8b0000; border-left: 2px solid #8b0000; }
.corner-tr { top: 20px; right: 20px; border-top: 2px solid #8b0000; border-right: 2px solid #8b0000; }
.corner-bl { bottom: 20px; left: 20px; border-bottom: 2px solid #8b0000; border-left: 2px solid #8b0000; }
.corner-br { bottom: 20px; right: 20px; border-bottom: 2px solid #8b0000; border-right: 2px solid #8b0000; }
</style>
