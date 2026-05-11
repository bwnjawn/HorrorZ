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

<style scoped>
#game-container {
  width: 800px;
  height: 600px;
  margin: 0 auto;
  border: 2px solid #333;
}

.ui-overlay {
  text-align: center;
  color: white;
  background-color: #1a1a1a;
  padding: 10px;
}
</style>
