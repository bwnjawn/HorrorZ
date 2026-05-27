<script setup>
import { useGameStore } from './stores/gameStore';
import TitleScreen from './components/TitleScreen.vue';
import MainMenu from './components/MainMenu.vue';
import ScoreScreen from './components/ScoreScreen.vue';
import HudOverlay from './components/HudOverlay.vue';
import { onMounted, onUnmounted, watch } from 'vue';
import Phaser from 'phaser';
import { gameConfig } from './game/config';

const store = useGameStore();
let gameInstance = null;

onMounted(() => {
  // Creamos Phaser al montar, pero la escena arranca pausada
  // (MainScene.configurarJugador() pausa hasta que el store diga isGameStarted)
  gameInstance = new Phaser.Game(gameConfig);
});

onUnmounted(() => {
  if (gameInstance) {
    gameInstance.destroy(true);
    gameInstance = null;
  }
});

// Cuando el jugador muere y luego reinicia, necesitamos reiniciar la escena de Phaser
// para que configurarJugador() vuelva a suscribirse al store correctamente.
watch(
  () => store.currentView,
  (newView, oldView) => {
    if (oldView === 'gameOver' && (newView === 'title' || newView === 'charSelect')) {
      if (gameInstance) {
        // Reiniciar la escena desde cero para volver a correr create()
        gameInstance.scene.stop('MainScene');
        gameInstance.scene.start('MainScene');
      }
    }
  }
);
</script>

<template>
  <div id="app">
    <!-- Pantalla de título inicial -->
    <TitleScreen v-if="store.currentView === 'title'" />

    <!-- Selección de clase -->
    <MainMenu v-if="store.currentView === 'charSelect'" />

    <!-- Canvas de Phaser (siempre montado, visible durante la partida) -->
    <div id="game-container"></div>

    <!-- HUD encima del canvas (solo durante la partida) -->
    <HudOverlay v-if="store.currentView === 'playing'" />

    <!-- Pantalla de puntuación al morir -->
    <ScoreScreen v-if="store.currentView === 'gameOver'" />
  </div>
</template>

<style>
html, body, #app, main {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #000;
}

#game-container {
  width: 100vw;
  height: 100vh;
  display: block;
}
</style>
