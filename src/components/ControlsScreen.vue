<template>
  <div class="content">
    <div class="logo-wrapper">
      <p class="pre-title">— MANUAL DE INFECCIÓN —</p>
      <h2 class="game-title" style="font-size: 4rem">CONTROLES</h2>
      <div class="title-underline"></div>
    </div>

    <div class="controls-panel">
      <div class="control-row"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> <span>Mover Lider</span></div>
      <div class="control-row"><kbd>SHIFT</kbd> <span>Correr</span></div>
      <div class="control-row"><kbd>CLIC IZQ</kbd> <span>Ataque Básico</span></div>
      <div class="control-row"><kbd>MANTENER CLIC</kbd> <span>Ataque Cargado</span></div>
      <div class="control-row"><kbd>CLIC DER</kbd> <span>Habilidad Especial</span></div>
      <div class="control-row"><kbd>ESPACIO</kbd> <span>Reagrupar Horda</span></div>
    </div>

    <button class="btn-start btn-back" @click="$emit('back')">
      <span class="btn-text">VOLVER</span>
      <span class="btn-arrow">◀</span>
    </button>
  </div>
</template>

<script setup>
defineEmits(['back']);
</script>

<style scoped>
/* Hereda animaciones de contenido de la vista principal */
.content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

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
  line-height: 0.9;
  margin: 0;
  letter-spacing: -0.02em;
  filter: drop-shadow(0 0 40px rgba(200, 0, 0, 0.5));
  color: #e8e8e8;
}
.title-underline {
  width: 60%;
  height: 2px;
  background: linear-gradient(to right, transparent, #8b0000, #cc0000, #8b0000, transparent);
  margin-top: 4px;
}

.controls-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: rgba(10, 0, 0, 0.6);
  border: 1px solid #330000;
  padding: 32px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.8);
}

.control-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.control-row span {
  font-family: 'Share Tech Mono', monospace;
  font-size: 1rem;
  color: #ccc;
  margin-left: 10px;
}

kbd {
  background: #1a1a1a;
  border: 1px solid #333;
  border-bottom: 2px solid #555;
  color: #ff4444;
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.9rem;
  padding: 6px 12px;
  border-radius: 4px;
}

.btn-back {
  position: relative;
  background: transparent;
  border: 2px solid #555;
  color: #aaa;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.2rem;
  letter-spacing: 0.2em;
  padding: 10px 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
  overflow: hidden;
}

.btn-back::before {
  content: '';
  position: absolute;
  inset: 0;
  background: #333;
  transform: translateX(101%);
  transition: transform 0.25s ease;
  z-index: 0;
}
.btn-back:hover::before {
  transform: translateX(0);
}
.btn-back:hover {
  color: #fff;
  border-color: #888;
}
.btn-text,
.btn-arrow {
  position: relative;
  z-index: 1;
}
.btn-back:hover .btn-arrow {
  transform: translateX(-4px);
}
</style>
