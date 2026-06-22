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

    <!-- Imagen de zombie/mano -->
    <div class="zombie-bg-container">
      <img src="/assets/ui/hand.png" alt="Zombie" class="zombie-bg" />
    </div>

    <!-- AQUÍ SE RENDERIZARÁ EL CONTENIDO DE CADA PANTALLA -->
    <slot></slot>

    <!-- Esquinas decorativas -->
    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>
  </div>
</template>

<script setup>
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
    repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 0, 0, 0.015) 2px, rgba(255, 0, 0, 0.015) 4px);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  font-family: 'Share Tech Mono', monospace;
}

/* ── ZOMBIE DE FONDO ────────────────────────────────────────── */
.zombie-bg-container {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}

.zombie-bg {
  height: 100vh;
  opacity: 0.2;
  mix-blend-mode: overlay;
  filter: drop-shadow(0 0 40px rgba(139, 0, 0, 0.6));
  animation: zombieDilate 5s ease-in-out infinite;
}

@keyframes zombieDilate {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
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
  0%,
  100% {
    opacity: 0;
    transform: translateX(0) scaleX(1);
  }
  30% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
    transform: translateX(5%) scaleX(1.05);
  }
  70% {
    opacity: 1;
  }
}

/* ── GOTAS DE SANGRE ────────────────────────────────────────── */
.blood-drops {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.drop {
  position: absolute;
  top: 0;
  width: 1px;
  background: linear-gradient(to bottom, transparent, #5a0000, #8b0000);
  opacity: 0.4;
  animation: dripViscous 4s ease-in infinite;
}

@keyframes dripViscous {
  0% {
    opacity: 0;
    transform: scaleY(0);
    transform-origin: top;
  }
  10% {
    opacity: 0.95;
    transform: scaleY(1);
    transform-origin: top;
  }
  75% {
    opacity: 0.95;
    transform: scaleY(1) translateY(0);
  }
  100% {
    opacity: 0;
    transform: scaleY(1) translateY(30px);
  }
}

/* ── ESQUINAS DECORATIVAS ───────────────────────────────────── */
.corner {
  position: absolute;
  width: 40px;
  height: 40px;
  opacity: 0.4;
}
.corner-tl {
  top: 20px;
  left: 20px;
  border-top: 2px solid #8b0000;
  border-left: 2px solid #8b0000;
}
.corner-tr {
  top: 20px;
  right: 20px;
  border-top: 2px solid #8b0000;
  border-right: 2px solid #8b0000;
}
.corner-bl {
  bottom: 20px;
  left: 20px;
  border-bottom: 2px solid #8b0000;
  border-left: 2px solid #8b0000;
}
.corner-br {
  bottom: 20px;
  right: 20px;
  border-bottom: 2px solid #8b0000;
  border-right: 2px solid #8b0000;
}
</style>
