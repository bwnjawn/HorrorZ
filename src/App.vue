<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import Phaser from 'phaser';

// 1. Referencia al contenedor del DOM
const gameContainer = ref(null);
let gameInstance = null;

// 2. Configuración básica de Phaser
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container', // Debe coincidir con el ID en el template
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // Vista top-down, no necesitamos gravedad
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 3. Funciones del ciclo de vida de Phaser (Placeholders)
function preload() {
  // Aquí cargarás tus sprites y mapas más adelante
  console.log('Phaser: Preload');
  this.load.image('leader', 'src/assets/sprites/');
  this.load.image('tiles', 'src/assets/tiles/');

}

function create() {
  // Aquí inicializarás al "Zombi Líder" y los civiles
  console.log('Phaser: Create');
  this.add.text(100, 100, 'HorrorZ: Motor Iniciado', { fill: '#0f0' });
}

function update() {
  // Aquí irá la lógica de movimiento perpetuo
}

// 4. Integración con el ciclo de vida de Vue
onMounted(() => {
  // Inicializa el juego solo cuando el componente de Vue está listo
  gameInstance = new Phaser.Game(config);
});

onUnmounted(() => {
  // Limpia la instancia del juego si el componente se destruye
  if (gameInstance) {
    gameInstance.destroy(true);
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