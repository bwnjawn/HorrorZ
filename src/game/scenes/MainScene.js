import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Civilian } from '../entities/Civilian';
import { Soldier } from '../entities/Soldier';

export class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  preload() {
    this.load.spritesheet('zombie-walk', 'src/assets/sprites/zombie-walking.png', { frameWidth: 313, frameHeight: 374 });
    this.load.spritesheet('zombie-attack', 'src/assets/sprites/zombie-attacking.png', { frameWidth: 313, frameHeight: 374 });
    this.load.spritesheet('civil-walking', 'src/assets/sprites/civil-walking.png', { frameWidth: 313, frameHeight: 374 });
    this.load.spritesheet('soldier-walking', 'src/assets/sprites/soldier-walking.png', { frameWidth: 313, frameHeight: 374 });
    this.load.spritesheet('soldier-shooting', 'src/assets/sprites/soldier-shooting.png', { frameWidth: 313, frameHeight: 374 });

    this.load.tilemapTiledJSON('Map_HorrorZ', 'src/assets/maps/Map_HorrorZ.json');
    this.load.image('Tileset_Fondo', 'src/assets/tilesets/Background_Dark-Green_TileSet.png');
    this.load.image('Tileset_Casa_Negra', 'src/assets/tilesets/Buildings_dark_TileSet.png');
    this.load.image('Tileset_Casa_Gris', 'src/assets/tilesets/Buildings_gray_TileSet.png');
    this.load.image('Tileset_Fondo_Casa_Blanca', 'src/assets/tilesets/Buildings_white_TileSet.png');
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
    this.anims.create({
      key: 'soldier-walk-anim',
      frames: this.anims.generateFrameNumbers('soldier-walking', { start: 0, end: 10 }),
      frameRate: 12,
      repeat: -1,
    });
    this.anims.create({
      key: 'soldier-shoot-anim',
      frames: this.anims.generateFrameNumbers('soldier-shooting', { start: 0, end: 16 }),
      frameRate: 12,
      repeat: 0,
    });

    // 2. Fondo
    const map = this.make.tilemap({ key: 'Map_HorrorZ' });

    const tsFondo = map.addTilesetImage('Background_Dark-Green_TileSet', 'Tileset_Fondo');
    const tsBlanco = map.addTilesetImage('Buildings_white_TileSet', 'Tileset_Fondo_Casa_Blanca');
    const tsOscuro = map.addTilesetImage('Buildings_dark_TileSet', 'Tileset_Casa_Negra');
    const tsGris = map.addTilesetImage('Buildings_gray_TileSet', 'Tileset_Casa_Gris');

    // Agrupamos todos en un array para no complicarnos con qué capa usa qué tileset
    const todosLosTilesets = [tsFondo, tsBlanco, tsOscuro, tsGris];

    // 3. Crear las capas usando los nombres exactos que pusiste en Tiled
    const capaSuelo = map.createLayer('Capa de patrones 1', todosLosTilesets, 0, 0);
    const _capaDetalles = map.createLayer('Capa de patrones 4', todosLosTilesets, 0, 0);
    const _capaCasas = map.createLayer('Casas', todosLosTilesets, 0, 0);

    // Dimensiones del mapa
    const anchoMapa = map.widthInPixels;
    const altoMapa = map.heightInPixels;

    // Centrar mapa
    capaSuelo.setPosition(0, 0);

    // 3. Crear Jugador
    let spawnX = Phaser.Math.Between(10, anchoMapa - 10);
    let spawnY = Phaser.Math.Between(10, altoMapa - 10);
    this.player = new Player(this, spawnX, spawnY);

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, anchoMapa, altoMapa);
    this.physics.world.setBounds(0, 0, anchoMapa, altoMapa);
    this.cameras.main.setZoom(2);

    // 4. Crear Grupos y poblar mapa
    this.civiliansGroup = this.physics.add.group();
    this.hordeGroup = this.physics.add.group();
    this.enemiesGroup = this.physics.add.group();
    this.bulletsGroup = this.physics.add.group();
    this.allCivilians = []; // Arreglo para poder iterarlos en el update


    for (let i = 0; i < 50; i++) {
      let x = Phaser.Math.Between(100, anchoMapa - 100);
      let y = Phaser.Math.Between(100, altoMapa - 100);

      let civil = new Civilian(this, x, y);
      this.civiliansGroup.add(civil);
      this.allCivilians.push(civil);
    }
    // Spawn de prueba de soldados
    for (let i = 0; i < 10; i++) {
      let soldado = new Soldier(this, 300 + (i * 200), 300);
      this.enemiesGroup.add(soldado);
    }

    // 5. Configurar interacción de Infección

    this.input.keyboard.on('keydown-SPACE', () => {
      this.events.emit('comandante-reagrupar');
    });

    this.input.keyboard.on('keyup-SPACE', () => {
      this.events.emit('comandante-libre');
    });

    // 6. Crear grupo estático para obstáculos
    this.obstaculos = this.physics.add.staticGroup();

    const capaObjetos = map.getObjectLayer('Capa de Objetos 1');

    if (capaObjetos) {
      capaObjetos.objects.forEach((obj) => {
        // Centro del rectángulo de Tiled
        const x = obj.x + obj.width / 2;
        const y = obj.y + obj.height / 2;

        // Crear zona con el tamaño exacto
        const zona = this.add.zone(x, y, obj.width, obj.height);

        // Agregar física estática
        this.physics.add.existing(zona, true);

        // Agregar al grupo de obstáculos
        this.obstaculos.add(zona);
      });
    }

    // 7.   Colisiones generales
    this.physics.add.collider(this.player, this.obstaculos);
    this.physics.add.collider(this.civiliansGroup, this.obstaculos);
    this.physics.add.collider(this.hordeGroup, this.obstaculos);
    this.physics.add.collider(this.civiliansGroup, this.civiliansGroup);
    this.physics.add.collider(this.hordeGroup, this.hordeGroup);
    this.physics.add.collider(this.enemiesGroup, this.obstaculos);
    this.physics.add.collider(this.enemiesGroup, this.enemiesGroup);
    this.physics.add.overlap(this.hordeGroup, this.civiliansGroup, (zombieObj, civilObj) => {
      const dist = Phaser.Math.Distance.Between(zombieObj.x, zombieObj.y, civilObj.x, civilObj.y);

      if (dist < 50 && !civilObj.isInfected && !civilObj.isDying && !zombieObj.isAttacking) {
        // 1. El zombie ejecuta su animación de ataque
        zombieObj.ejecutarAtaque();

        // 2. Marcamos al civil para que otros zombies no lo intenten morder también
        civilObj.isDying = true;
        civilObj.setVelocity(0, 0); // El civil se paraliza de terror/dolor

        // 3. Esperamos 600ms (lo que tarda la animación) antes de convertirlo
        this.time.delayedCall(600, () => {
          civilObj.infectar();
          this.civiliansGroup.remove(civilObj);
          this.hordeGroup.add(civilObj);
          if (this.player.curar) this.player.curar(15);
        });
      }
    });
    this.physics.add.overlap(this.player, this.civiliansGroup, (playerObj, civilObj) => {
      // Solo infecta si el jugador ataca y el civil no está infectado
      if (this.player.isAttacking && !civilObj.isInfected) {
        civilObj.infectar();
        this.civiliansGroup.remove(civilObj);
        this.hordeGroup.add(civilObj);

        if (playerObj.curar) playerObj.curar(15);
      }
    });
    this.physics.add.collider(this.bulletsGroup, this.obstaculos, (bala, obstaculo) => {
      bala.destroy();
    });

    this.physics.add.overlap(this.bulletsGroup, this.hordeGroup, (bala, zombie) => {
      bala.destroy();
      if (zombie.recibirDaño) zombie.recibirDaño(15); 
    });

    this.physics.add.overlap(this.player, this.bulletsGroup, (jugador, bala) => {
      bala.destroy(); 
      if (jugador.recibirDaño) jugador.recibirDaño(10);
    });
    this.physics.add.overlap(this.player, this.enemiesGroup, (jugador, enemigo) => {
      if (jugador.isAttacking && !enemigo.isDead) {
        enemigo.recibirDaño(100); 
        
        if (jugador.curar) jugador.curar(25); 
      }
    });
    this.physics.add.overlap(this.hordeGroup, this.enemiesGroup, (zombie, enemigo) => {
      if (!zombie.isDead && !enemigo.isDead && !zombie.isAttacking) {
        zombie.ejecutarAtaque();
        enemigo.recibirDaño(20); 
      }
    });

    //Evento de soldado disparando
    this.events.on('enemigo-muerto', (data) => {
      // Creamos un zombi exactamente en la coordenada donde murió el militar
      let nuevoZombie = new Civilian(this, data.x, data.y);
      nuevoZombie.infectar();
      this.hordeGroup.add(nuevoZombie);
      this.allCivilians.push(nuevoZombie);
    });

    this.events.on('disparo-enemigo', (data) => {
      let bala = this.add.circle(data.x, data.y, 4, 0xffaa00); //Porque todavia no hay sprite de la bala
      this.physics.add.existing(bala);
      this.bulletsGroup.add(bala);

      //Viaja en la direccion del soldado
      this.physics.velocityFromRotation(data.angulo, 600, bala.body.velocity);
      this.time.delayedCall(1500, () => {
        if (bala.active) bala.destroy();
      });
    });
  }

  update(time,delta) {
    // Delegar la actualización a cada entidad
    this.player.update();
    const hordaActual = this.hordeGroup.getChildren();
    const civilesActuales = this.civiliansGroup.getChildren();

    this.allCivilians.forEach((civil) => {
      if (civil.active) civil.update(this.player, hordaActual, civilesActuales);
    });

    this.enemiesGroup.getChildren().forEach((enemy) => {
      if (enemy.active) enemy.update(time, delta, this.player, hordaActual);
    });
  }
}
