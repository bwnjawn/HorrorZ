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
      debug: false,
    },
  },
  audio: {
    noAudio: true,
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

// 3. Funciones del ciclo de vida de Phaser (Placeholders)
function preload() {
  // Aquí cargarás tus sprites y mapas más adelante
  console.log('Phaser: Preload');
  this.load.spritesheet('zombie-walk', 'src/assets/sprites/zombie-walking.png', {
    frameWidth: 313, // El ancho de UN solo cuadro
    frameHeight: 374, // El alto de UN solo cuadro
  });

  this.load.spritesheet('zombie-attack', 'src/assets/sprites/zombie-attacking.png', {
    frameWidth: 313, // El ancho de UN solo cuadro
    frameHeight: 374, // El alto de UN solo cuadro
  });
  this.load.spritesheet('civil-walking', 'src/assets/sprites/civil-walking.png', {
    frameWidth: 313, // El ancho de UN solo cuadro
    frameHeight: 374, // El alto de UN solo cuadro
  });
  this.load.image('fondo-ciudad', 'src/assets/tilesets/FondoTemporal.jpg');
}

function create() {
  // 1. ANIMACIONES (Deben definirse antes de usarse en cualquier sprite)
  // Animación de caminata del Zombie Líder
  this.anims.create({
    key: 'zombie-walk-anim',
    frames: this.anims.generateFrameNumbers('zombie-walk', { start: 0, end: 10 }),
    frameRate: 12,
    repeat: -1,
  });

  // Animación de ataque del Zombie Líder
  this.anims.create({
    key: 'zombie-attack-anim',
    frames: this.anims.generateFrameNumbers('zombie-attack', { start: 0, end: 16 }),
    frameRate: 12,
    repeat: 0,
  });

  // Animación de caminata de los Civiles
  this.anims.create({
    key: 'civil-walk-anim',
    frames: this.anims.generateFrameNumbers('civil-walking', { start: 0, end: 10 }),
    frameRate: 12,
    repeat: -1,
  });

  // 2. FONDO Y CAPAS
  let bg = this.add.image(400, 300, 'fondo-ciudad');
  bg.setDisplaySize(800, 600);
  bg.setDepth(-1); // Asegura que el fondo esté detrás de todo

  // 3. CREACIÓN DE ENTIDADES Y GRUPOS (Instanciar antes de usar en física)
  // Crear al Zombie Líder
  this.player = this.physics.add.sprite(400, 300, 'zombie-walk');
  this.player.setScale(0.3);
  this.player.setCollideWorldBounds(true);
  this.player.play('zombie-walk-anim');

  // Crear los grupos físicos para civiles y la horda
  this.civilians = this.physics.add.group();
  this.horde = this.physics.add.group();

  // 4. POBLAR EL MAPA CON CIVILES
  for (let i = 0; i < 5; i++) {
    let x = Phaser.Math.Between(50, 750);
    let y = Phaser.Math.Between(50, 550);

    let civil = this.civilians.create(x, y, 'civil-walking');
    civil.setScale(0.25);
    civil.setCollideWorldBounds(true);
    civil.setBounce(1, 1); // Permite que reboten ligeramente en los bordes
    civil.play('civil-walk-anim');
  }

  // 5. LÓGICA DE INFECCIÓN (Definir la función antes de configurarla en el overlap)
  this.infectar = (player, civil) => {
    // Solo infectar si el jugador está atacando (según el diseño de mecánicas)
    if (!this.isAttacking) return;

    // Evitar infectar zombies que ya están en la horda
    if (this.horde.contains(civil)) return;

    console.log('¡Civil convertido!');
    civil.setTint(0x00ff00); // Cambio visual temporal a verde zombie

    // Mover de grupo: sale de civiles y entra a la horda
    this.civilians.remove(civil);
    this.horde.add(civil);
  };

  // 6. CONFIGURAR INTERACCIONES FÍSICAS (Overlap)
  // Ahora que player y civilians existen, podemos conectarlos
  this.physics.add.overlap(this.player, this.civilians, this.infectar, null, this);

  // 7. CONTROLES Y VARIABLES DE ESTADO
  this.cursors = this.input.keyboard.createCursorKeys();
  this.speed = 400;
  this.isAttacking = false;
  this.lastVelocity = { x: this.speed, y: 0 }; // Para recordar dirección tras atacar

  // Movimiento inicial perpetuo
  this.player.setVelocityX(this.speed);

  // 8. CONFIGURAR EL GATILLO DE ATAQUE
  this.ejecutarAtaque = () => {
    if (!this.isAttacking) {
      this.isAttacking = true;
      this.player.setVelocity(0, 0); // Se detiene para atacar
      this.player.play('zombie-attack-anim', true);
    }
  };

  // Escuchar clic izquierdo
  this.input.on('pointerdown', (pointer) => {
    if (pointer.leftButtonDown()) {
      this.ejecutarAtaque();
    }
  });

  // Retornar a caminar cuando el ataque termine
  this.player.on('animationcomplete-zombie-attack-anim', () => {
    this.isAttacking = false;
    // Recupera la velocidad que tenía antes del ataque
    this.player.setVelocity(this.lastVelocity.x, this.lastVelocity.y);
    this.player.play('zombie-walk-anim', true);
  });
}

function update() {
  // 1. Control de dirección (cambia la velocidad pero no la detiene)
  if (!this.isAttacking) {
    if (this.cursors.left.isDown) {
      this.lastVelocity = { x: -this.speed, y: 0 };
      this.player.setVelocityX(this.lastVelocity.x);
      this.player.setVelocityY(0);
      this.player.setRotation(Phaser.Math.DegToRad(270));
    } else if (this.cursors.right.isDown) {
      this.lastVelocity = { x: this.speed, y: 0 };
      this.player.setVelocityX(this.lastVelocity.x);
      this.player.setVelocityY(0);
      this.player.setRotation(Phaser.Math.DegToRad(90));
    } else if (this.cursors.up.isDown) {
      this.lastVelocity = { x: 0, y: -this.speed };
      this.player.setVelocityX(0);
      this.player.setVelocityY(this.lastVelocity.y);
      this.player.setRotation(Phaser.Math.DegToRad(0));
    } else if (this.cursors.down.isDown) {
      this.lastVelocity = { x: 0, y: this.speed };
      this.player.setVelocityX(0);
      this.player.setVelocityY(this.lastVelocity.y);
      this.player.setRotation(Phaser.Math.DegToRad(180));
    }
  }
  // 2. Asegurar que siempre esté reproduciendo la animación de caminar
  // si no está en medio de un ataque
  if (this.player.anims.currentAnim.key !== 'zombie-attack-anim') {
    this.player.play('zombie-walk-anim', true);
  }
  //Logica de escape de los civilesS
  const panicDistance = 250;
  const escapeSpeed = 350;
  const wanderSpeed = 100;
  this.civilians.getChildren().forEach((civil) => {
    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, civil.x, civil.y);
    const isBlocked = !civil.body.blocked.none;
    if (distance < panicDistance) {
      let angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, civil.x, civil.y);
      if (isBlocked) {
        // Añadimos un margen aleatorio (45 grados aprox) para que intente "deslizarse" por el muro
        angle += Phaser.Math.FloatBetween(-Math.PI / 4, Math.PI / 4);
      }
      this.physics.velocityFromRotation(angle, escapeSpeed, civil.body.velocity);
      civil.setRotation(angle + Math.PI / 2);
      civil.play('civil-walk-anim', true);
    } else {
      if (civil.body.velocity.length() === 0) {
        const startAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        this.physics.velocityFromRotation(startAngle, wanderSpeed, civil.body.velocity);
        civil.setRotation(startAngle + Math.PI / 2); // Agregamos rotación inicial
        civil.play('civil-walk-anim', true);
      }
      if (isBlocked || Math.random() < 0.01) {
        const randomAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        this.physics.velocityFromRotation(randomAngle, wanderSpeed, civil.body.velocity);
        civil.setRotation(randomAngle + Math.PI / 2);
      }
    }
  });

  this.horde.getChildren().forEach((zombie) => {
    // Calcular ángulo hacia el jugador
    const angle = Phaser.Math.Angle.Between(zombie.x, zombie.y, this.player.x, this.player.y);

    // Mover al zombie hacia el líder con una velocidad ligeramente menor para que parezca que lo siguen
    this.physics.velocityFromRotation(angle, 150, zombie.body.velocity);
    zombie.setRotation(angle + Math.PI / 2);

    // Asegurar que la animación de caminar se mantenga
    zombie.play('civil-walk-anim', true);
  });
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