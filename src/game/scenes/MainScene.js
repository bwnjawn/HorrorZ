import Phaser from 'phaser';
import { Coloso } from '../entities/Coloso';
import { Invocador } from '../entities/Invocador';
import { Lamento } from '../entities/Lamento';
import { Atrofia } from '../entities/Atrofia';
import { Civilian } from '../entities/Civilian';
import { Soldier } from '../entities/Soldier';
import { Medic } from '../entities/Medic';
import { useGameStore } from '../../stores/gameStore';
import { ENEMY_TYPES } from '../config/StatsConfig';
import { PLAYER_TYPES } from '../config/PlayerStatsConfig';

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

  // Ahora nuestro create es un índice limpio y ordenado
  create() {
    this.iniciarStore();
    this.crearAnimaciones();
    this.crearEntorno();
    this.crearGrupos();
    this.crearObstaculos();
    this.configurarColisionesGrupales();
    this.configurarEventos();

    this.configurarJugador();
  }

  // ==========================================
  // FUNCIONES DE INICIALIZACIÓN (REFACTOR)
  // ==========================================

  iniciarStore() {
    this.store = useGameStore();
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.store.incrementTime();
      },
      loop: true,
    });
  }

  crearAnimaciones() {
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
  }

  crearEntorno() {
    this.input.mouse.disableContextMenu();
    this.lights.enable();
    this.lights.setAmbientColor(0x131329);

    // Guardamos el mapa como propiedad de la clase
    this.map = this.make.tilemap({ key: 'Map_HorrorZ' });

    const tsFondo = this.map.addTilesetImage('Background_Dark-Green_TileSet', 'Tileset_Fondo');
    const tsBlanco = this.map.addTilesetImage('Buildings_white_TileSet', 'Tileset_Fondo_Casa_Blanca');
    const tsOscuro = this.map.addTilesetImage('Buildings_dark_TileSet', 'Tileset_Casa_Negra');
    const tsGris = this.map.addTilesetImage('Buildings_gray_TileSet', 'Tileset_Casa_Gris');

    const todosLosTilesets = [tsFondo, tsBlanco, tsOscuro, tsGris];

    const capaSuelo = this.map.createLayer('Capa de patrones 1', todosLosTilesets, 0, 0);
    const _capaDetalles = this.map.createLayer('Capa de patrones 4', todosLosTilesets, 0, 0);
    const _capaCasas = this.map.createLayer('Casas', todosLosTilesets, 0, 0);

    capaSuelo.setLighting(true);
    _capaDetalles.setLighting(true);
    _capaCasas.setLighting(true);
    capaSuelo.setPosition(0, 0);

    // Guardamos las dimensiones
    this.anchoMapa = this.map.widthInPixels;
    this.altoMapa = this.map.heightInPixels;

    this.cameras.main.setBounds(0, 0, this.anchoMapa, this.altoMapa);
    this.physics.world.setBounds(0, 0, this.anchoMapa, this.altoMapa);
    this.cameras.main.setZoom(2);
  }

  crearGrupos() {
    this.civiliansGroup = this.physics.add.group();
    this.hordeGroup = this.physics.add.group();
    this.enemiesGroup = this.physics.add.group();
    this.bulletsGroup = this.physics.add.group();
    this.allCivilians = [];

    // Timer de spawn dinámico
    this.time.addEvent({
      delay: 2000,
      callback: () => {
        this.ejecutarSpawnDinamico();
      },
      loop: true,
    });
  }

  crearObstaculos() {
    this.obstaculos = this.physics.add.staticGroup();

    // Usamos el mapa que guardamos en crearEntorno()
    const capaObjetos = this.map.getObjectLayer('Capa de Objetos 1');

    if (capaObjetos) {
      capaObjetos.objects.forEach((obj) => {
        const x = obj.x + obj.width / 2;
        const y = obj.y + obj.height / 2;
        const zona = this.add.zone(x, y, obj.width, obj.height);

        this.physics.add.existing(zona, true);
        this.obstaculos.add(zona);
      });
    }
  }

  configurarColisionesGrupales() {
    // Colisiones estáticas
    this.physics.add.collider(this.civiliansGroup, this.obstaculos);
    this.physics.add.collider(this.hordeGroup, this.obstaculos);
    this.physics.add.collider(this.enemiesGroup, this.obstaculos);
    this.physics.add.collider(this.bulletsGroup, this.obstaculos, (bala, _obstaculo) => bala.destroy());

    // Colisiones entre entidades de los mismos bandos
    this.physics.add.collider(this.civiliansGroup, this.civiliansGroup);
    this.physics.add.collider(this.hordeGroup, this.hordeGroup);
    this.physics.add.collider(this.enemiesGroup, this.enemiesGroup);

    // Interacciones (Overlaps)
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
          if (this.player && this.player.curar) this.player.curar(15);
          this.store.healPlayer(15);
        });
      }
    });

    this.physics.add.overlap(this.bulletsGroup, this.hordeGroup, (bala, zombie) => {
      bala.destroy();
      if (zombie.recibirDaño) zombie.recibirDaño(15);
    });

    this.physics.add.overlap(this.hordeGroup, this.enemiesGroup, (zombie, enemigo) => {
      if (!zombie.isDead && !enemigo.isDead && !zombie.isAttacking) {
        zombie.ejecutarAtaque();
        enemigo.recibirDaño(20);
      }
    });
  }

  configurarEventos() {
    this.input.keyboard.on('keydown-SPACE', () => this.events.emit('comandante-reagrupar'));
    this.input.keyboard.on('keyup-SPACE', () => this.events.emit('comandante-libre'));

    this.events.on('enemigo-muerto', (data) => {
      let nuevoZombie = new Civilian(this, data.x, data.y);

      nuevoZombie.infectar();
      this.hordeGroup.add(nuevoZombie);
      this.allCivilians.push(nuevoZombie);

      if (data.healReward) {
        if (this.player && this.player.curar) this.player.curar(data.healReward);
        this.store.healPlayer(data.healReward);
      }
    });

    this.events.on('disparo-enemigo', (data) => {
      let bala = this.add.circle(data.x, data.y, 4, 0xffaa00);

      this.physics.add.existing(bala);
      this.bulletsGroup.add(bala);
      this.physics.velocityFromRotation(data.angulo, 600, bala.body.velocity);

      this.time.delayedCall(1500, () => {
        if (bala.active) bala.destroy();
      });
    });

    this.events.on('explosion-kamikaze', (data) => {
      let distAlPlayer = Phaser.Math.Distance.Between(data.x, data.y, this.player.x, this.player.y);

      if (distAlPlayer < 80) {
        this.player.recibirDaño(data.daño, 'explosion');
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

  configurarJugador() {
    let spawnX = Phaser.Math.Between(10, this.anchoMapa - 10);
    let spawnY = Phaser.Math.Between(10, this.altoMapa - 10);

    this.scene.pause();

    const unsubscribe = this.store.$subscribe((mutation, state) => {
      if (state.isGameStarted && !this.player) {
        if (state.selectedZombie === PLAYER_TYPES.COLOSO.id) {
          this.player = new Coloso(this, spawnX, spawnY);
        } else if (state.selectedZombie === PLAYER_TYPES.ATROFIA.id) {
          this.player = new Atrofia(this, spawnX, spawnY, PLAYER_TYPES.ATROFIA);
        } else if (state.selectedZombie === PLAYER_TYPES.INVOCADOR.id) {
          this.player = new Invocador(this, spawnX, spawnY, PLAYER_TYPES.INVOCADOR);
        } else if (state.selectedZombie === PLAYER_TYPES.LAMENTO.id) {
          this.player = new Lamento(this, spawnX, spawnY, PLAYER_TYPES.LAMENTO);
        }

        this.playerLight = this.lights.addLight(spawnX, spawnY, 500, 0xffffff, 0.3);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Colisiones exclusivas del jugador
        this.physics.add.collider(this.player, this.obstaculos);

        this.physics.add.overlap(this.player, this.civiliansGroup, (playerObj, civilObj) => {
          if (this.player.isAttacking && !civilObj.isInfected) {
            civilObj.infectar();
            this.civiliansGroup.remove(civilObj);
            this.hordeGroup.add(civilObj);
            this.store.infectCivilian();
            if (playerObj.onInfectarCivil) playerObj.onInfectarCivil();
            if (playerObj.curar) playerObj.curar(15);
            this.store.healPlayer(15);
          } else if (this.player.isDashing && !civilObj.isInfected) {
            civilObj.recibirDaño(400);
          }
        });

        this.physics.add.overlap(this.player, this.bulletsGroup, (jugador, bala) => {
          bala.destroy();
          if (jugador.recibirDaño) jugador.recibirDaño(10, 'bala');
          this.store.takeDamage(10);
        });

        this.physics.add.overlap(this.player, this.enemiesGroup, (jugador, enemigo) => {
          if (jugador.isAttacking && !enemigo.isDead) {
            enemigo.recibirDaño(100);
          } else if (jugador.isDashing && !enemigo.isDead) {
            enemigo.recibirDaño(400);
          }
        });

        this.scene.resume();
        unsubscribe();
      }
    });
  }

  update(time, delta) {
    if (this.playerLight && this.player) {
      this.playerLight.x = this.player.x;
      this.playerLight.y = this.player.y;
    }

    if (this.player) {
      this.player.update(time, delta);
    }

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

    const radioMinimo = Math.max(anchoVisible, altoVisible) / 2 + 50;
    const radioMaximo = radioMinimo + 300;

    let posicionValida = false;
    let spawnX = 0;
    let spawnY = 0;
    let intentos = 0;

    while (!posicionValida && intentos < 10) {
      const angulo = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const radio = Phaser.Math.FloatBetween(radioMinimo, radioMaximo);

      spawnX = cam.midPoint.x + Math.cos(angulo) * radio;
      spawnY = cam.midPoint.y + Math.sin(angulo) * radio;

      // Usamos el anchoMapa y altoMapa guardados previamente
      if (spawnX > 50 && spawnX < this.anchoMapa - 50 && spawnY > 50 && spawnY < this.altoMapa - 50) {
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
        return enemigo.constructor.name === 'Medic';
      } else {
        return enemigo.constructor.name === 'Soldier';
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
