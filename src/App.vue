<script setup>
import { onMounted, onUnmounted } from 'vue';
import Phaser from 'phaser';
import { gameConfig } from './game/config';

let gameInstance = null;

onMounted(() => {
  // Inicializa el juego con la configuración importada
  gameInstance = new Phaser.Game(gameConfig);
});

onUnmounted(() => {
  if (gameInstance) {
    gameInstance.destroy(true);
    gameInstance = null;
  }
});
</script>
<template>
  <main>
    <div class="ui-overlay">
      <h1>HorrorZ</h1>
    </div>

    <div id="game-container"></div>
  </main>
</template>

<style>
/* Reset global para quitar márgenes del navegador */
html,
body,
#app,
main {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden; /* Evita scrolls accidentales */
  background-color: #000;
}

#game-container {
  width: 100vw; /* 100% del ancho del visor */
  height: 100vh; /* 100% del alto del visor */
  display: block;
}

/* El overlay debe ser absoluto para que no empuje el canvas hacia abajo */
.ui-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10; /* Asegura que esté por encima del canvas de Phaser */
  pointer-events: none; /* Permite hacer click "a través" de los textos al juego */
  text-align: center;
  color: white;
  padding: 10px;
}

.ui-overlay h1 {
  margin: 0;
  font-family: sans-serif;
  text-shadow: 2px 2px 4px #000;
}
</style>
