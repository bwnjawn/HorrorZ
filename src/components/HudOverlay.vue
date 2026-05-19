<script setup>
import { useGameStore } from '../stores/gameStore';

// Conectamos el componente a Pinia
const store = useGameStore();
</script>

<template>
  <div class="hud-container">
    
    <div class="hud-corner top-left">
      <div class="health-bar-container">
        <div class="health-fill" :style="{ width: store.health + '%' }"></div>
        
        <svg class="ecg-line" viewBox="0 0 100 20" preserveAspectRatio="none">
          <polyline 
            points="0,10 15,10 20,2 25,18 30,8 35,12 40,10 100,10" 
            fill="none" 
            stroke="rgba(255, 255, 255, 0.8)" 
            stroke-width="1.5"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <span class="health-text">{{ store.health }}%</span>
    </div>

    <div class="hud-corner top-right">
      <div class="horde-counter">
        <svg class="brush-bg" viewBox="0 0 200 60" preserveAspectRatio="none">
          <path d="M5,10 Q50,0 100,5 T195,15 Q190,40 180,50 T100,55 Q20,60 5,45 Z" fill="#1a1a1a" opacity="0.8"/>
        </svg>
        
        <svg class="skull-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm-1.5 10.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-1.5 5.5v3h-2v-3h2z"/>
        </svg>
        
        <span class="horde-text">{{ store.hordeCount }}</span>
      </div>
    </div>

    <div class="hud-corner bottom-right">
      <div class="ability-indicator" :class="{ 'is-active': store.isRegrouping }">
        Reagrupar
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Contenedor invisible que cubre toda la pantalla */
.hud-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none; /* Crucial para poder clickear el juego */
  z-index: 100;
  padding: 20px;
  box-sizing: border-box;
}

.hud-corner {
  position: absolute;
}

.top-left { top: 20px; left: 20px; }
.top-right { top: 20px; right: 20px; }
.bottom-right { bottom: 20px; right: 20px; }

/* ESTILOS BARRA DE VIDA */
.health-bar-container {
  width: 250px;
  height: 30px;
  background-color: #333;
  border: 2px solid #111;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.5);
}

.health-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b0000, #ff2a2a);
  transition: width 0.3s ease-out; /* Animación suave al perder vida */
}

.ecg-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.health-text {
  color: white;
  font-family: monospace;
  font-size: 1.2rem;
  text-shadow: 1px 1px 2px black;
  display: block;
  margin-top: 5px;
}

/* ESTILOS CONTADOR HORDA */
.horde-counter {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 160px;
  height: 60px;
  color: #fff;
}

.brush-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.8));
}

.skull-icon {
  width: 30px;
  height: 30px;
  margin-right: 10px;
  color: #e0e0e0;
}

.horde-text {
  font-family: 'Impact', sans-serif;
  font-size: 2rem;
  letter-spacing: 2px;
}

/* ESTILOS HABILIDAD */
.ability-indicator {
  padding: 10px 20px;
  border: 2px solid #555;
  background-color: rgba(0,0,0,0.6);
  color: #888;
  font-family: monospace;
  font-weight: bold;
  text-transform: uppercase;
  transition: all 0.2s;
}

.ability-indicator.is-active {
  border-color: #ff2a2a;
  color: #fff;
  background-color: rgba(139, 0, 0, 0.4);
  box-shadow: 0 0 15px rgba(255, 42, 42, 0.5);
}
</style>