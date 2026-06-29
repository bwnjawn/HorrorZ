<script setup>
import { useGameStore } from './stores/gameStore';
import TitleScreen from './components/TitleScreen.vue';
import MainMenu from './components/MainMenu.vue';
import ScoreScreen from './components/ScoreScreen.vue';
import HudOverlay from './components/HudOverlay.vue';
import PauseMenu from './components/PauseMenu.vue';
import AuthScreen from './components/AuthScreen.vue';
import LeaderboardScreen from './components/LeaderboardScreen.vue';
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

watch(
  () => store.currentView,
  (newView) => {
    if (gameInstance) {
      // Si estamos en menús, deshabilitamos el teclado de Phaser
      const isMenu = ['title', 'auth', 'leaderboard', 'charSelect', 'gameOver'].includes(newView);

      gameInstance.input.keyboard.enabled = !isMenu;

      // Lógica de control de escenas que ya tenías...
      if (newView === 'title' && gameInstance.scene.isActive('MainScene')) {
        gameInstance.scene.stop('MainScene');
      }
    }
  }
);
</script>

<template>
  <div id="app">
    <TitleScreen v-if="store.currentView === 'title'" />

    <MainMenu v-if="store.currentView === 'charSelect'" />

    <AuthScreen v-if="store.currentView === 'auth'" />

    <LeaderboardScreen v-if="store.currentView === 'leaderboard'" />

    <div id="game-container"></div>

    <HudOverlay v-if="store.currentView === 'playing'" />

    <PauseMenu v-if="store.currentView === 'paused'" />

    <ScoreScreen v-if="store.currentView === 'gameOver'" />
  </div>
</template>
<style>
/* 1. Resetear la página completa para evitar barras de scroll y bordes */
html,
body {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden; /* Esto mata cualquier barra de scroll */
  background-color: #080808; /* Un fondo oscuro por si acaso */
}

/* 2. El contenedor principal de Vue debe ocupar toda la pantalla */
#app {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

/* 3. El contenedor del juego debe estar pegado al fondo absoluto */
#game-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: block; /* Regla clave */
  z-index: 0; /* Lo mantenemos al fondo para que la UI se dibuje encima */
}

/* 4. ELIMINAR EL BUCLE INFINITO DEL CANVAS */
#game-container canvas {
  display: block; /* Transforma el canvas de 'inline' a 'block', eliminando el margen inferior fantasma */
  width: 100% !important;
  height: 100% !important;
}
</style>
