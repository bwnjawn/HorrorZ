<script setup>
import { useGameStore } from './stores/gameStore';
import TitleScreen from './components/TitleScreen.vue';
import MainMenu from './components/MainMenu.vue';
import ScoreScreen from './components/ScoreScreen.vue';
import HudOverlay from './components/HudOverlay.vue';
import PauseMenu from './components/PauseMenu.vue'; // <-- 1. Importar el menú nuevo
import { onMounted, onUnmounted, watch } from 'vue';
import Phaser from 'phaser';
import { gameConfig } from './game/config';

const store = useGameStore();
let gameInstance = null;

// Manejador del teclado para capturar el ESC del navegador/canvas
const handleKeyDown = (event) => {
  if (event.key === 'Escape' || event.keyCode === 27) {
    if (store.currentView === 'playing' || store.currentView === 'paused') {
      store.togglePause();

      // Pausamos o reanudamos las escenas de Phaser
      if (gameInstance) {
        if (store.isPaused) {
          gameInstance.scene.pause('MainScene');
        } else {
          gameInstance.scene.resume('MainScene');
        }
      }
    }
  }
};

// Escuchar si se reanuda desde el botón del componente Vue
const handleVueResume = () => {
  if (gameInstance) {
    gameInstance.scene.resume('MainScene');
  }
};

onMounted(() => {
  gameInstance = new Phaser.Game(gameConfig);

  // Agregamos los listeners globales
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('vue-resume-game', handleVueResume);
});

onUnmounted(() => {
  if (gameInstance) {
    gameInstance.destroy(true);
    gameInstance = null;
  }
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('vue-resume-game', handleVueResume);
});

watch(
  // Si el usuario sale al menú principal desde la pausa, destruimos/reiniciamos la escena
  () => store.currentView,
  (newView, oldView) => {
    if (gameInstance) {
      if (oldView === 'paused' && newView === 'title') {
        gameInstance.scene.stop('MainScene');
      }
      if (oldView === 'gameOver' && (newView === 'title' || newView === 'charSelect')) {
        gameInstance.scene.stop('MainScene');
        gameInstance.scene.start('MainScene');
      }
    }
  }
);
</script>

<template>
  <div id="app">
    <TitleScreen v-if="store.currentView === 'title'" />
    <MainMenu v-if="store.currentView === 'charSelect'" />

    <div id="game-container"></div>

    <HudOverlay v-if="store.currentView === 'playing'" />

    <PauseMenu v-if="store.currentView === 'paused'" />

    <ScoreScreen v-if="store.currentView === 'gameOver'" />
  </div>
</template>
