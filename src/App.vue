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
  this.load.spritesheet('zombie-walk', 'src/assets/sprites/zombie-walking.png', { 
          frameWidth: 313,  // El ancho de UN solo cuadro
          frameHeight: 374  // El alto de UN solo cuadro
      });

  this.load.spritesheet('zombie-attack', 'src/assets/sprites/zombie-attacking.png', { 
          frameWidth: 313,  // El ancho de UN solo cuadro
          frameHeight: 374  // El alto de UN solo cuadro
      });
}

function create() {
  // 1, Aninmacion de caminar zombie
  this.anims.create({
    key: "zombie-walk-anim",
    frames: this.anims.generateFrameNumbers("zombie-walk",{
      start: 0,
      end: 10
    }),
    frameRate:12,
    repeat: -1 //-1 lo hace infinito
  });
  // 2. Animacion de ataque zombie
  this.anims.create({
    key: "zombie-attack-anim",
    frames: this.anims.generateFrameNumbers("zombie-attack",{
      start: 0,
      end: 16
    }),
    frameRate:12,
    repeat: 0 //0 es para cuando se llama solamente
  });

  // 3. Crear el sprite físicamente en el mapa
  // Ubicado en el centro (400, 300) usando la textura inicial
  this.player = this.physics.add.sprite(400, 300, 'zombie-walk');
  this.player.setScale(0.3);

  // 4. Iniciar la animación de caminata por defecto
  this.player.play('zombie-walk-anim');
  
  // 5. Configurar el evento de fin de ataque UNA SOLA VEZ aquí, no en update
  this.player.on('animationcomplete-zombie-attack-anim', () => {
      this.player.play('zombie-walk-anim', true);
  });

  this.cursors = this.input.keyboard.createCursorKeys();
  this.speed = 400;
  this.player.setVelocityX(this.speed); //hace que apenas comience se esté moviendo a la derecha (es para el movimiento perpetuo pero si cambiamos la idea esto se va)
  this.player.setCollideWorldBounds(true);
}



function update() {
// 1. Control de dirección (cambia la velocidad pero no la detiene)
  if (this.cursors.left.isDown) {
    this.player.setVelocityX(-this.speed);
    this.player.setVelocityY(0);
    this.player.flipX = true; // Voltea el sprite a la izquierda
  } else if (this.cursors.right.isDown) {
    this.player.setVelocityX(this.speed);
    this.player.setVelocityY(0);
    this.player.flipX = false; // Voltea el sprite a la derecha
  } else if (this.cursors.up.isDown) {
    this.player.setVelocityX(0);
    this.player.setVelocityY(-this.speed);
  } else if (this.cursors.down.isDown) {
    this.player.setVelocityX(0);
    this.player.setVelocityY(this.speed);
    
  }
  // 2. Asegurar que siempre esté reproduciendo la animación de caminar
  // si no está en medio de un ataque
  if (this.player.anims.currentAnim.key !== 'zombie-attack-anim') {
    this.player.play('zombie-walk-anim', true);
  }
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