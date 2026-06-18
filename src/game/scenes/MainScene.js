import Phaser from 'phaser';
import { Coloso } from '../entities/Coloso';
import { Invocador } from '../entities/Invocador';
import { Lamento } from '../entities/Lamento';
import { Atrofia } from '../entities/Atrofia';
import { Civilian } from '../entities/Civilians';
import { Soldier } from '../entities/Soldier';
import { Medic } from '../entities/Medic';
import { Kamikaze } from '../entities/Kamikaze';
import { useGameStore } from '../../stores/gameStore';
import { ENEMY_TYPES } from '../config/StatsConfig';
import { PLAYER_TYPES } from '../config/PlayerStatsConfig';

export class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  preload() {
    this.load.tilemapTiledJSON('Map_HorrorZ', 'assets/maps/Map_HorrorZ.json');
    this.load.image('Tileset_Fondo', 'assets/tilesets/Background_Dark-Green_TileSet.png');
    this.load.image('Tileset_Casa_Negra', 'assets/tilesets/Buildings_dark_TileSet.png');
    this.load.image('Tileset_Casa_Gris', 'assets/tilesets/Buildings_gray_TileSet.png');
    this.load.image('Tileset_Fondo_Casa_Blanca', 'assets/tilesets/Buildings_white_TileSet.png');

    this.load.image('kamikaze_standing', 'assets/sprites/kamikaze/Hacker_Standing.png');
    this.load.image('kamikaze_walk_1', 'assets/sprites/kamikaze/Hacker_Walking1.png');
    this.load.image('kamikaze_walk_2', 'assets/sprites/kamikaze/Hacker_Walking2.png');
    this.load.image('kamikaze_walk_3', 'assets/sprites/kamikaze/Hacker_Walking3.png');
    this.load.image('kamikaze_walk_4', 'assets/sprites/kamikaze/Hacker_Walking4.png');

    for (let i = 1; i <= 7; i++) {
      this.load.image(`explosion_${i}`, `assets/sprites/explosion/explosion${i}.png`);
    }

    for (let i = 0; i <= 16; i++) {
      let num = i.toString().padStart(4, '0');

      this.load.image(`zombie_death_${i}`, `assets/sprites/zombie_death/death01_${num}.png`);
    }

    for (let i = 0; i <= 16; i++) {
      this.load.image(`resurection_${i}`, `assets/sprites/resurection/resurection${i}.png`);
    }

    for (let i = 1; i <= 6; i++) {
      this.load.image(`civil_walk_${i}`, `assets/sprites/civilians/WalkCiv${i}.png`);
    }

    for (let i = 0; i <= 31; i++) {
      let num = i.toString().padStart(4, '0');

      this.load.image(`zombie_walk_${i}`, `assets/sprites/zombie_walk/walk${num}.png`);
    }

    for (let i = 1; i <= 10; i++) {
      this.load.image(`zombie_attack_${i}`, `assets/sprites/atrofia/atrofia_atack/atrofiaatack${i}.png`);
    }

    // COLOSO
    for (let i = 0; i <= 19; i++) {
      let num = i.toString().padStart(4, '0');

      this.load.image(`coloso_attack_${i}`, `assets/sprites/coloso/coloso_atack/attack02_${num}.png`);
    }

    for (let i = 0; i <= 2; i++) {
      let num = i.toString().padStart(4, '0');

      this.load.image(`coloso_dash_${i}`, `assets/sprites/coloso/coloso_embestida/dash${num}.png`);
    }

    // ATROFIA
    for (let i = 0; i <= 19; i++) {
      let num = i.toString().padStart(4, '0');

      this.load.image(`atrofia_jump_${i}`, `assets/sprites/atrofia/atrofia_jump/attack03_${num}.png`);
    }

    // LAMENTO
    for (let i = 0; i <= 19; i++) {
      let num = i.toString().padStart(4, '0');

      this.load.image(`lamento_spitt_${i}`, `assets/sprites/lamento/lamento_spitt/attack01_${num}.png`);
    }

    // INVOCADOR
    for (let i = 0; i <= 3; i++) {
      let num = i.toString().padStart(4, '0');

      this.load.image(`invocador_scream_${i}`, `assets/sprites/invocador/invocador_scream/death02_${num}.png`);
    }

    // SOLDIER
    for (let i = 0; i <= 1; i++) {
      this.load.image(`soldier_move_${i}`, `assets/sprites/soldier/soldiermove/survivor-move_rifle_${i}.png`);
    }

    for (let i = 0; i <= 2; i++) {
      this.load.image(`soldier_shoot_${i}`, `assets/sprites/soldier/soldiershoot/survivor-shoot_rifle_${i}.png`);
    }

    // MELEE
    for (let i = 0; i <= 19; i++) {
      this.load.image(`move_knife_${i}`, `assets/sprites/melee/meleemove/survivor-move_knife_${i}.png`);
    }

    for (let i = 0; i <= 14; i++) {
      this.load.image(`attack_knife_${i}`, `assets/sprites/melee/meleeattack/survivor-meleeattack_knife_${i}.png`);
    }
  }

  create() {
    this.player = null;
    this.iniciarStore();
    this.crearAnimaciones();
    this.crearEntorno();
    this.crearGrupos();
    this.crearObstaculos();
    this.configurarColisionesGrupales();
    this.configurarEventos();
    this.configurarJugador();
  }

  iniciarStore() {
    this.store = useGameStore();

    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.store.incrementTime();
      },
      loop: true,
    });

    const unsubscribe = this.store.$subscribe((mutation, state) => {
      // CASO 1: Reinicio desde la pantalla de Game Over (El jugador estaba muerto)
      if (!state.isGameOver && this.player && this.player.isDead) {
        unsubscribe();
        this.scene.resume();
        this.scene.restart();
      }

      // CASO 2: Reinicio desde el menú de Pausa (El jugador está vivo y salimos al menú principal)
      if (state.currentView === 'title' && !state.isGameStarted && this.player && !this.player.isDead) {
        unsubscribe();
        this.scene.resume(); // Quitamos la pausa forzada
        this.scene.restart(); // Reiniciamos el mapa para que quede limpio
      }
    });
  }

  crearAnimaciones() {
    if (this.anims.exists('melee-move')) return;
    const framesMoveKnife = [];

    for (let i = 0; i <= 19; i++) {
      framesMoveKnife.push({ key: `move_knife_${i}` });
    }
    this.anims.create({
      key: 'melee-move',
      frames: framesMoveKnife,
      frameRate: 20,
      repeat: -1,
    });

    const framesAttackKnife = [];

    for (let i = 0; i <= 14; i++) {
      framesAttackKnife.push({ key: `attack_knife_${i}` });
    }
    this.anims.create({
      key: 'melee-attack',
      frames: framesAttackKnife,
      frameRate: 24,
      repeat: 0,
    });

    const framesZombieWalk = [];

    for (let i = 0; i <= 31; i++) {
      framesZombieWalk.push({ key: `zombie_walk_${i}` });
    }
    this.anims.create({
      key: 'zombie-walk-anim',
      frames: framesZombieWalk,
      frameRate: 20,
      repeat: -1,
    });

    const framesZombieAttack = [];

    for (let i = 1; i <= 10; i++) {
      framesZombieAttack.push({ key: `zombie_attack_${i}` });
    }
    this.anims.create({
      key: 'zombie-attack-anim',
      frames: framesZombieAttack,
      frameRate: 15,
      repeat: 0,
    });

    const framesColosoAttack = [];

    for (let i = 0; i <= 19; i++) {
      framesColosoAttack.push({ key: `coloso_attack_${i}` });
    }
    this.anims.create({
      key: 'coloso-attack-special',
      frames: framesColosoAttack,
      frameRate: 20,
      repeat: 0,
    });

    const framesColosoDash = [];

    for (let i = 0; i <= 2; i++) {
      framesColosoDash.push({ key: `coloso_dash_${i}` });
    }
    this.anims.create({
      key: 'coloso-dash-anim',
      frames: framesColosoDash,
      frameRate: 10,
      repeat: 0,
    });

    const framesAtrofiaJump = [];

    for (let i = 0; i <= 19; i++) {
      framesAtrofiaJump.push({ key: `atrofia_jump_${i}` });
    }
    this.anims.create({
      key: 'atrofia-jump-anim',
      frames: framesAtrofiaJump,
      frameRate: 20,
      repeat: 0,
    });

    const framesLamentoSpitt = [];

    for (let i = 0; i <= 19; i++) {
      framesLamentoSpitt.push({ key: `lamento_spitt_${i}` });
    }
    this.anims.create({
      key: 'lamento-spitt-anim',
      frames: framesLamentoSpitt,
      frameRate: 24,
      repeat: 0,
    });

    const framesInvocadorScream = [];

    for (let i = 3; i >= 0; i--) {
      framesInvocadorScream.push({ key: `invocador_scream_${i}` });
    }
    this.anims.create({
      key: 'invocador-scream-anim',
      frames: framesInvocadorScream,
      frameRate: 10,
      repeat: 0,
    });

    const framesCivilWalk = [];

    for (let i = 1; i <= 6; i++) {
      framesCivilWalk.push({ key: `civil_walk_${i}` });
    }
    this.anims.create({
      key: 'civil-walk-anim',
      frames: framesCivilWalk,
      frameRate: 8,
      repeat: -1,
    });

    const framesSoldierMove = [];

    for (let i = 0; i <= 1; i++) {
      framesSoldierMove.push({ key: `soldier_move_${i}` });
    }
    this.anims.create({
      key: 'soldier-walk-anim',
      frames: framesSoldierMove,
      frameRate: 8,
      repeat: -1,
    });

    const framesSoldierShoot = [];

    for (let i = 0; i <= 2; i++) {
      framesSoldierShoot.push({ key: `soldier_shoot_${i}` });
    }
    this.anims.create({
      key: 'soldier-shoot-anim',
      frames: framesSoldierShoot,
      frameRate: 15,
      repeat: 0,
    });

    const framesKamikazeWalk = [];

    for (let i = 1; i <= 4; i++) {
      framesKamikazeWalk.push({ key: `kamikaze_walk_${i}` });
    }
    this.anims.create({
      key: 'kamikaze-walk-anim',
      frames: framesKamikazeWalk,
      frameRate: 10,
      repeat: -1,
    });

    const framesExplosion = [];

    for (let i = 1; i <= 7; i++) {
      framesExplosion.push({ key: `explosion_${i}` });
    }
    this.anims.create({
      key: 'kamikaze-explosion-anim',
      frames: framesExplosion,
      frameRate: 14,
      repeat: 0,
      hideOnComplete: true,
    });

    const framesResurection = [];

    for (let i = 0; i <= 16; i++) {
      framesResurection.push({ key: `resurection_${i}` });
    }
    this.anims.create({
      key: 'zombie-resurrection-anim',
      frames: framesResurection,
      frameRate: 14,
      repeat: 0,
    });

    const framesZombieDeath = [];

    for (let i = 0; i <= 16; i++) {
      framesZombieDeath.push({ key: `zombie_death_${i}` });
    }
    this.anims.create({
      key: 'zombie-death-anim',
      frames: framesZombieDeath,
      frameRate: 16,
      repeat: 0,
    });
  }

  crearEntorno() {
    this.input.mouse.disableContextMenu();
    this.lights.enable();
    this.lights.setAmbientColor(0x212020);

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

    this.programarProximoSpawn();
  }

  crearObstaculos() {
    this.obstaculos = this.physics.add.staticGroup();

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
    this.physics.add.collider(this.civiliansGroup, this.obstaculos);
    this.physics.add.collider(this.hordeGroup, this.obstaculos);
    this.physics.add.collider(this.enemiesGroup, this.obstaculos);
    this.physics.add.collider(this.bulletsGroup, this.obstaculos, (bala, _obstaculo) => bala.destroy());

    this.physics.add.collider(this.civiliansGroup, this.civiliansGroup);
    this.physics.add.collider(this.hordeGroup, this.hordeGroup);
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
          if (this.player && this.player.curar) this.player.curar(15);
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
      let radioExplosion = data.rango || 120;
      let distAlPlayer = Phaser.Math.Distance.Between(data.x, data.y, this.player.x, this.player.y);

      if (distAlPlayer < radioExplosion) {
        this.player.recibirDaño(data.daño, 'explosion');
      }

      this.hordeGroup.getChildren().forEach((zombi) => {
        let distAlZombi = Phaser.Math.Distance.Between(data.x, data.y, zombi.x, zombi.y);

        if (distAlZombi < radioExplosion && zombi.recibirDaño) {
          zombi.recibirDaño(data.daño);
        }
      });
    });

    this.events.on('visual-custom-explosion', (data) => {
      const efectoExplosion = this.add.sprite(data.x, data.y, 'explosion_1');

      efectoExplosion.setScale(data.scale || 1.5);
      efectoExplosion.setTint(data.colorTint || 0xffffff);
      efectoExplosion.setAlpha(data.alpha !== undefined ? data.alpha : 1);

      efectoExplosion.play('kamikaze-explosion-anim');

      efectoExplosion.once('animationcomplete', () => {
        efectoExplosion.destroy();
      });
    });
  }

  configurarJugador() {
    let spawnX = Phaser.Math.Between(10, this.anchoMapa - 10);
    let spawnY = Phaser.Math.Between(10, this.altoMapa - 10);

    const instanciarJugador = (zombieSeleccionado) => {
      if (zombieSeleccionado === PLAYER_TYPES.COLOSO.id) {
        this.player = new Coloso(this, spawnX, spawnY);
      } else if (zombieSeleccionado === PLAYER_TYPES.ATROFIA.id) {
        this.player = new Atrofia(this, spawnX, spawnY, PLAYER_TYPES.ATROFIA);
      } else if (zombieSeleccionado === PLAYER_TYPES.INVOCADOR.id) {
        this.player = new Invocador(this, spawnX, spawnY, PLAYER_TYPES.INVOCADOR);
      } else if (zombieSeleccionado === PLAYER_TYPES.LAMENTO.id) {
        this.player = new Lamento(this, spawnX, spawnY, PLAYER_TYPES.LAMENTO);
      }

      this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

      this.physics.add.collider(this.player, this.obstaculos);

      this.physics.add.overlap(this.player, this.civiliansGroup, (playerObj, civilObj) => {
        if (this.player.isDashing && !civilObj.isInfected) {
          civilObj.recibirDaño(400);
        }
      });

      this.physics.add.overlap(this.player, this.bulletsGroup, (jugador, bala) => {
        bala.destroy();
        if (jugador.recibirDaño) jugador.recibirDaño(10, 'bala');
      });

      this.physics.add.overlap(this.player, this.bulletsGroup, (jugador, bala) => {
        bala.destroy();
        if (jugador.recibirDaño) jugador.recibirDaño(10, 'bala');
      });
    };

    if (this.store.isGameStarted) {
      instanciarJugador(this.store.selectedZombie);
      this.scene.resume();
    } else {
      this.scene.pause();
      const unsubscribe = this.store.$subscribe((mutation, state) => {
        if (state.isGameStarted && !this.player) {
          instanciarJugador(state.selectedZombie);
          this.scene.resume();
          unsubscribe();
        }
      });
    }
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
    const mitadAncho = anchoVisible / 2;
    const mitadAlto = altoVisible / 2;

    const diagonalPantalla = Math.sqrt(mitadAncho * mitadAncho + mitadAlto * mitadAlto);

    const radioMinimo = diagonalPantalla + 50;
    const radioMaximo = radioMinimo + 200;

    let posicionValida = false;
    let spawnX = 0;
    let spawnY = 0;
    let intentos = 0;
    const MAX_INTENTOS = 50;

    while (!posicionValida && intentos < MAX_INTENTOS) {
      const angulo = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const radio = Phaser.Math.FloatBetween(radioMinimo, radioMaximo);

      spawnX = this.player.x + Math.cos(angulo) * radio;
      spawnY = this.player.y + Math.sin(angulo) * radio;

      // Validación A: Que NO se salga del mapa físico
      const dentroDelMapa = spawnX > 50 && spawnX < this.anchoMapa - 50 && spawnY > 50 && spawnY < this.altoMapa - 50;

      // Validación B: Que el punto NO esté dentro de la vista actual de la cámara
      const fueraDeCamara = !cam.worldView.contains(spawnX, spawnY);

      if (dentroDelMapa && fueraDeCamara) {
        posicionValida = true;
      }
      intentos++;
    }

    if (!posicionValida) {
      return null;
    }

    return { x: spawnX, y: spawnY };
  }

  programarProximoSpawn() {
    const minutosJugados = this.store.timeAlive / 60;

    let delayDinamico = 3500;

    if (minutosJugados > 1) delayDinamico = 3000;
    if (minutosJugados > 3) delayDinamico = 2500;
    if (minutosJugados > 5) delayDinamico = 2000;
    if (minutosJugados > 8) delayDinamico = 1500;

    const porcentajeVida = this.store.playerHealth / this.store.playerMaxHealth;
    const hordaActiva = this.hordeGroup.getChildren().length;

    if (hordaActiva > 40) {
      delayDinamico *= 1.5;
    } else if (hordaActiva < 10) {
      delayDinamico *= 0.8;
    }

    // El respiro si estás a punto de morir se mantiene, pero un poco más suave
    if (porcentajeVida < 0.3) {
      delayDinamico *= 1.3;
    }

    // Evitamos que bajo ninguna circunstancia matemática el delay baje de 1 segundo
    delayDinamico = Math.max(delayDinamico, 1000);

    this.time.addEvent({
      delay: delayDinamico,
      callback: () => {
        this.ejecutarSpawnDinamico();

        if (!this.store.isGameOver) {
          this.programarProximoSpawn();
        }
      },
      loop: false,
    });
  }

  ejecutarSpawnDinamico() {
    const civilesVivos = this.civiliansGroup.countActive(true);
    const enemigosVivos = this.enemiesGroup.countActive(true);
    const hordaViva = this.hordeGroup.countActive(true);

    const totalEntidades = civilesVivos + enemigosVivos + hordaViva;
    const MAX_ENTIDADES_EN_PANTALLA = 60;

    if (totalEntidades >= MAX_ENTIDADES_EN_PANTALLA) {
      return;
    }

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
      } else if (tipoElegido.type === 'KAMIKAZE') {
        return enemigo.constructor.name === 'Kamikaze';
      } else {
        return enemigo.constructor.name === 'Soldier';
      }
    });

    if (enemigoReciclado) {
      if (tipoElegido.type === 'MEDIC') {
        enemigoReciclado.respawnBase(posicion.x, posicion.y, tipoElegido);
      } else if (tipoElegido.type === 'KAMIKAZE') {
        enemigoReciclado.respawnBase(posicion.x, posicion.y, tipoElegido);
      } else {
        enemigoReciclado.respawn(posicion.x, posicion.y, tipoElegido);
      }
    } else {
      if (tipoElegido.type === 'MEDIC') {
        let nuevoMedic = new Medic(this, posicion.x, posicion.y, tipoElegido);

        this.enemiesGroup.add(nuevoMedic);
      } else if (tipoElegido.type === 'KAMIKAZE') {
        let nuevoKamikaze = new Kamikaze(this, posicion.x, posicion.y, tipoElegido);

        this.enemiesGroup.add(nuevoKamikaze);
      } else {
        let nuevoSoldado = new Soldier(this, posicion.x, posicion.y, tipoElegido);

        this.enemiesGroup.add(nuevoSoldado);
      }
    }
  }

  obtenerPesosDelDirector() {
    const minutosJugados = this.store.timeAlive / 60;
    const hordaActiva = this.hordeGroup.getChildren().length;

    let probabilidadCivil;
    let poolMilitares;
    let limiteHordaAceptable = 15;

    if (minutosJugados > 1) limiteHordaAceptable = 25;
    if (minutosJugados > 3) limiteHordaAceptable = 40;
    if (minutosJugados > 5) limiteHordaAceptable = 60;

    if (hordaActiva > limiteHordaAceptable) {
      probabilidadCivil = minutosJugados < 2 ? 20 : 5;
      poolMilitares = [ENEMY_TYPES.SNIPER, ENEMY_TYPES.KAMIKAZE, ENEMY_TYPES.TANK];

      return { probabilidadCivil, poolMilitares };
    }

    if (minutosJugados < 1) {
      probabilidadCivil = 85;
      poolMilitares = [ENEMY_TYPES.NORMAL];
    } else if (minutosJugados < 2.5) {
      probabilidadCivil = 55;
      poolMilitares = [ENEMY_TYPES.NORMAL, ENEMY_TYPES.NORMAL, ENEMY_TYPES.MELEE];
    } else if (minutosJugados < 5) {
      probabilidadCivil = 25;
      poolMilitares = [ENEMY_TYPES.MILITAR, ENEMY_TYPES.SNIPER, ENEMY_TYPES.MELEE, ENEMY_TYPES.MEDIC];
    } else {
      probabilidadCivil = 5;
      poolMilitares = [ENEMY_TYPES.MILITAR, ENEMY_TYPES.SNIPER, ENEMY_TYPES.KAMIKAZE, ENEMY_TYPES.TANK, ENEMY_TYPES.MEDIC];
    }

    return { probabilidadCivil, poolMilitares };
  }
}
