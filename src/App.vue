<script setup>
import { useGameStore } from './stores/gameStore';
import MainMenu from './components/MainMenu.vue';
import { onMounted, onUnmounted } from 'vue';
import Phaser from 'phaser';
import { gameConfig } from './game/config';
import HudOverlay from './components/HudOverlay.vue';

const store = useGameStore();
let gameInstance = null;

onMounted(() => {
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
  <div id="app">
    <MainMenu v-if="!store.isGameStarted" />

    <div id="game-container"></div>

    <HudOverlay v-if="store.isGameStarted" />
  </div>
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
</style>
