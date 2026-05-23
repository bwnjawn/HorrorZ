import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Civilian } from '../entities/Civilian';
import { Soldier } from '../entities/Soldier';
import { Medic } from '../entities/Medic';
import { useGameStore } from '../../stores/gameStore';
import { ENEMY_TYPES } from '../config/StatsConfig';

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
    // Instanciamos gameStore para HUD
    this.store = useGameStore();
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        // Envia la orden a Pinia de sumar 1 segundo
        this.store.incrementTime();
      },
      loop: true,
    });

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

    this.lights.enable();
    this.lights.setAmbientColor(0x131329);

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

    capaSuelo.setLighting(true);
    _capaDetalles.setLighting(true);
    _capaCasas.setLighting(true);
    // Dimensiones del mapa
    const anchoMapa = map.widthInPixels;
    const altoMapa = map.heightInPixels;

    // Centrar mapa
    capaSuelo.setPosition(0, 0);

    // 3. Crear Jugador
    let spawnX = Phaser.Math.Between(10, anchoMapa - 10);
    let spawnY = Phaser.Math.Between(10, altoMapa - 10);

    this.player = new Player(this, spawnX, spawnY);
    this.playerLight = this.lights.addLight(spawnX, spawnY, 500, 0xffffff, 0.3);

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

    this.time.addEvent({
      delay: 2000,
      callback: () => {
        this.ejecutarSpawnDinamico();
      },
      loop: true,
    });

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
        zombieObj.ejecutarAtaque();
        civilObj.isDying = true;
        civilObj.setVelocity(0, 0);

        this.time.delayedCall(600, () => {
          civilObj.infectar();
          this.civiliansGroup.remove(civilObj);
          this.hordeGroup.add(civilObj);
          this.store.infectCivilian();
          if (this.player.curar) this.player.curar(15);
          this.store.healPlayer(15);
        });
      }
    });
    this.physics.add.overlap(this.player, this.civiliansGroup, (playerObj, civilObj) => {
      // Solo infecta si el jugador ataca y el civil no está infectado
      if (this.player.isAttacking && !civilObj.isInfected) {
        civilObj.infectar();
        this.civiliansGroup.remove(civilObj);
        this.hordeGroup.add(civilObj);
        this.store.infectCivilian();

        if (playerObj.curar) playerObj.curar(15);
        this.store.healPlayer(15);
      }
    });
    this.physics.add.collider(this.bulletsGroup, this.obstaculos, (bala, _obstaculo) => {
      bala.destroy();
    });

    this.physics.add.overlap(this.bulletsGroup, this.hordeGroup, (bala, zombie) => {
      bala.destroy();
      if (zombie.recibirDaño) zombie.recibirDaño(15);
    });

    this.physics.add.overlap(this.player, this.bulletsGroup, (jugador, bala) => {
      bala.destroy();
      if (jugador.recibirDaño) jugador.recibirDaño(10);
      this.store.takeDamage(10);
    });
    this.physics.add.overlap(this.player, this.enemiesGroup, (jugador, enemigo) => {
      if (jugador.isAttacking && !enemigo.isDead) {
        enemigo.recibirDaño(100);
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

      if (data.healReward) {
        if (this.player.curar) this.player.curar(data.healReward);
        this.store.healPlayer(data.healReward);
      }
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
    this.events.on('explosion-kamikaze', (data) => {
      let distAlPlayer = Phaser.Math.Distance.Between(data.x, data.y, this.player.x, this.player.y);

      if (distAlPlayer < 80) {
        this.player.recibirDaño(data.daño);
        this.store.takeDamage(data.daño);
      }

      this.hordeGroup.getChildren().forEach((zombi) => {
        let distAlZombi = Phaser.Math.Distance.Between(data.x, data.y, zombi.x, zombi.y);

        if (distAlZombi < 80 && zombi.recibirDaño) {
          zombi.recibirDaño(data.daño);
        }
      });
    });
  }

  update(time, delta) {
    if (this.playerLight && this.player) {
      this.playerLight.x = this.player.x;
      this.playerLight.y = this.player.y;
    }
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

  obtenerPosicionAnillo() {
    const cam = this.cameras.main;
    const anchoVisible = cam.width / cam.zoom;
    const altoVisible = cam.height / cam.zoom;

    // Siempre spawnean fuera de la vision del player
    const radioMinimo = Math.max(anchoVisible, altoVisible) / 2 + 50;
    const radioMaximo = radioMinimo + 300; // El grosor del anillo donde pueden nacer

    let posicionValida = false;
    let spawnX = 0;
    let spawnY = 0;
    let intentos = 0;

    while (!posicionValida && intentos < 10) {
      // Geometría circular: Elegir un ángulo y una distancia aleatoria
      const angulo = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const radio = Phaser.Math.FloatBetween(radioMinimo, radioMaximo);

      // Calcular X e Y respecto al centro de la cámara
      spawnX = cam.midPoint.x + Math.cos(angulo) * radio;
      spawnY = cam.midPoint.y + Math.sin(angulo) * radio;

      if (spawnX > 50 && spawnX < this.physics.world.bounds.width - 50 && spawnY > 50 && spawnY < this.physics.world.bounds.height - 50) {
        posicionValida = true;
      }
      intentos++;
    }

    return posicionValida ? { x: spawnX, y: spawnY } : null;
  }

  ejecutarSpawnDinamico() {
    const posicion = this.obtenerPosicionAnillo();

    if (!posicion) return;

    const director = this.obtenerPesosDelDirector();
    const dado = Phaser.Math.Between(1, 100);

    //Modificar probabilidad.
    if (dado <= director.probabilidadCivil) {
      let civilReciclado = this.civiliansGroup.getFirstDead(false);

      if (civilReciclado) {
        civilReciclado.respawn(posicion.x, posicion.y);
      } else {
        let civil = new Civilian(this, posicion.x, posicion.y);

        this.civiliansGroup.add(civil);
        this.allCivilians.push(civil);
      }

      return;
    }
    const tipoElegido = Phaser.Utils.Array.GetRandom(director.poolMilitares);

    const enemigosMuertos = this.enemiesGroup.getChildren().filter((e) => !e.active);

    let enemigoReciclado = enemigosMuertos.find((enemigo) => {
      if (tipoElegido.type === 'MEDIC') {
        return enemigo.constructor.name === 'Medic'; // Si la ficha es Medic, busca un Medic
      } else {
        return enemigo.constructor.name === 'Soldier'; // Si la ficha es militar, busca un Soldier
      }
    });

    if (enemigoReciclado) {
      if (tipoElegido.type === 'MEDIC') {
        enemigoReciclado.respawnBase(posicion.x, posicion.y, tipoElegido);
      } else {
        enemigoReciclado.respawn(posicion.x, posicion.y, tipoElegido);
      }
    } else {
      if (tipoElegido.type === 'MEDIC') {
        let nuevoMedic = new Medic(this, posicion.x, posicion.y, tipoElegido);

        this.enemiesGroup.add(nuevoMedic);
      } else {
        let nuevoSoldado = new Soldier(this, posicion.x, posicion.y, tipoElegido);

        this.enemiesGroup.add(nuevoSoldado);
      }
    }
  }

  obtenerPesosDelDirector() {
    const minutosJugados = this.time.now / 60000;

    // Variables que el Director va a modificar
    let probabilidadCivil;
    let poolMilitares;

    if (minutosJugados < 1) {
      probabilidadCivil = 80;
      poolMilitares = [ENEMY_TYPES.NORMAL];
    } else if (minutosJugados < 3) {
      probabilidadCivil = 60;
      poolMilitares = [ENEMY_TYPES.NORMAL, ENEMY_TYPES.NORMAL, ENEMY_TYPES.MELEE, ENEMY_TYPES.MEDIC];
    } else if (minutosJugados < 5) {
      probabilidadCivil = 40;
      poolMilitares = [ENEMY_TYPES.NORMAL, ENEMY_TYPES.MILITAR, ENEMY_TYPES.MILITAR, ENEMY_TYPES.SNIPER, ENEMY_TYPES.MELEE, ENEMY_TYPES.MEDIC];
    } else {
      probabilidadCivil = 15;
      poolMilitares = [ENEMY_TYPES.MILITAR, ENEMY_TYPES.SNIPER, ENEMY_TYPES.KAMIKAZE, ENEMY_TYPES.KAMIKAZE, ENEMY_TYPES.TANK, ENEMY_TYPES.MEDIC];
    }

    return { probabilidadCivil, poolMilitares };
  }
}
