import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Civilian } from '../entities/Civilian';

export class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  preload() {
    this.load.spritesheet('zombie-walk', 'src/assets/sprites/zombie-walking.png', { frameWidth: 313, frameHeight: 374 });
    this.load.spritesheet('zombie-attack', 'src/assets/sprites/zombie-attacking.png', { frameWidth: 313, frameHeight: 374 });
    this.load.spritesheet('civil-walking', 'src/assets/sprites/civil-walking.png', { frameWidth: 313, frameHeight: 374 });
    this.load.image('fondo-ciudad', 'src/assets/tilesets/FondoTemporal.jpg');
  }

  create() {
    // 1. Crear animaciones
    this.anims.create({
      key: 'zombie-walk-anim',
      frames: this.anims.generateFrameNumbers('zombie-walk', { start: 0, end: 10 }),
      frameRate: 12,
      repeat: -1,
    });
    this.anims.create({
      key: 'zombie-attack-anim',
      frames: this.anims.generateFrameNumbers('zombie-attack', { start: 0, end: 16 }),
      frameRate: 12,
      repeat: 0,
    });
    this.anims.create({
      key: 'civil-walk-anim',
      frames: this.anims.generateFrameNumbers('civil-walking', { start: 0, end: 10 }),
      frameRate: 12,
      repeat: -1,
    });

    // 2. Fondo
    let bg = this.add.image(400, 300, 'fondo-ciudad');
    bg.setDisplaySize(800, 600);
    bg.setDepth(-1);

    // 3. Crear Jugador
    this.player = new Player(this, 400, 300);

    // 4. Crear Grupos y poblar mapa
    this.civiliansGroup = this.physics.add.group();
    this.hordeGroup = this.physics.add.group();
    this.allCivilians = []; // Arreglo para poder iterarlos en el update

    for (let i = 0; i < 5; i++) {
      let x = Phaser.Math.Between(50, 750);
      let y = Phaser.Math.Between(50, 550);

      let civil = new Civilian(this, x, y);
      this.civiliansGroup.add(civil);
      this.allCivilians.push(civil);
    }

    // 5. Configurar interacción de Infección
    this.physics.add.overlap(this.player, this.civiliansGroup, (playerObj, civilObj) => {
      // Solo infecta si el jugador ataca y el civil no está infectado
      if (this.player.isAttacking && !civilObj.isIpnfected) {
        civilObj.infectar();
        this.civiliansGroup.remove(civilObj);
        this.hordeGroup.add(civilObj);
      }
    });
  }

  update() {
    // Delegar la actualización a cada entidad
    this.player.update();

    this.allCivilians.forEach((civil) => {
      civil.update(this.player);
    });
  }
}
