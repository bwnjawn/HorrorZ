import Phaser from 'phaser';
import { useGameStore } from '../../stores/gameStore';
import { GLOBAL_PLAYER_MECHANICS } from '../config/PlayerStatsConfig';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, config) {
    super(scene, x, y, config?.spriteKey || 'zombie_walk_0');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(0.3);
    this.body.setOffset(this.width * 0.35, this.height * 0.35);
    this.setCollideWorldBounds(true);
    this.setLighting(true);

    this._hitboxRadio = config?.hitboxRadio ?? 20;
    const centroX = this.width / 2;
    const centroY = this.height / 2;

    // Si la config no trae offset, lo calculamos para que el radio quede exactamente en el centro
    this._hitboxOffsetX = config?.hitboxOffsetX ?? centroX - this._hitboxRadio;
    this._hitboxOffsetY = config?.hitboxOffsetY ?? centroY - this._hitboxRadio;

    this.body.setCircle(this._hitboxRadio, this._hitboxOffsetX, this._hitboxOffsetY);

    // ESTADÍSTICAS BASE
    this.baseSpeed = config?.baseSpeed || 300;
    this.maxHealth = config?.baseHealth || 200;
    this.health = this.maxHealth;
    this.baseDamage = config?.baseDamage || 20;
    this.currentDamage = this.baseDamage;

    // ESTAMINA
    this.maxStamina = config?.maxStamina || 150;
    this.stamina = this.maxStamina;
    this.isFatigued = false;
    this.abilityCooldown = config?.abilityCooldown || 5000;
    this.lastAbilityTime = 0;

    // ESTADOS
    this.isDead = false;
    this.isAttacking = false;
    this.isChargingAttack = false;
    this.chargeStartTime = 0;

    this.animWalk = config?.animWalk || 'zombie-walk-anim';
    this.animAttack = config?.animAttack || 'zombie-attack-anim';

    const store = useGameStore();

    store.playerMaxHealth = this.maxHealth;
    store.setPlayerHealth(this.health);
    store.setPlayerMaxStamina(this.maxStamina);
    store.setPlayerStamina(this.stamina);

    // CONTROLES
    this.keys = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      sprint: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      special: Phaser.Input.Keyboard.KeyCodes.Q,
    });

    scene.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown() && !this.isDead && !this.isAttacking) {
        this.isChargingAttack = true;
        this.chargeStartTime = scene.time.now;
      } else if (pointer.rightButtonDown() && !this.isDead) {
        this.usarHabilidadEspecial();
      }
    });

    scene.input.on('pointerup', (pointer) => {
      if (pointer.leftButtonReleased() && this.isChargingAttack && !this.isDead) {
        this.isChargingAttack = false;
        const holdTime = scene.time.now - this.chargeStartTime;

        if (holdTime >= GLOBAL_PLAYER_MECHANICS.CHARGED_ATTACK.CHARGE_TIME_MS) {
          if (this.stamina >= GLOBAL_PLAYER_MECHANICS.CHARGED_ATTACK.STAMINA_COST) {
            this.stamina -= GLOBAL_PLAYER_MECHANICS.CHARGED_ATTACK.STAMINA_COST;
            this.ejecutarAtaque(true);
          } else {
            this.ejecutarAtaque(false);
          }
        } else {
          this.ejecutarAtaque(false);
        }
      }
    });

    scene.input.keyboard.on('keydown-Q', () => {
      if (!this.isDead) this.usarHabilidadEspecial();
    });

    this.on(`animationcomplete-${this.animAttack}`, () => {
      if (this.isDead) return;
      this.isAttacking = false;
      this.currentDamage = this.baseDamage;
    });
  }

  ajustarHitbox(radio, offsetX, offsetY) {
    this._hitboxRadio = radio;

    // Calculamos el centro de la textura actual
    const centroX = this.width / 2;
    const centroY = this.height / 2;

    // Aplicamos el offset centrado dinámicamente si no se proporciona uno manual
    this._hitboxOffsetX = offsetX ?? centroX - radio;
    this._hitboxOffsetY = offsetY ?? centroY - radio;

    this.body.setCircle(this._hitboxRadio, this._hitboxOffsetX, this._hitboxOffsetY);
  }

  resetearSprite(textureKey) {
    this.setTexture(textureKey);
    this.body.setCircle(this._hitboxRadio, this._hitboxOffsetX, this._hitboxOffsetY);
  }

  mostrarNumeroFlotante(cantidad, tipo = 'daño') {
    const isCura = tipo === 'cura';
    const colorTexto = isCura ? '#00ff00' : '#ff0000';
    const prefijo = isCura ? '+' : '-';

    const textoFlotante = this.scene.add
      .text(this.x, this.y - 30, `${prefijo}${cantidad}`, {
        fontSize: '22px', // Un poco más grande para el jugador
        color: colorTexto,
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(25);

    this.scene.tweens.add({
      targets: textoFlotante,
      y: this.y - 70,
      alpha: 0,
      duration: 1000,
      ease: 'Power1',
      onComplete: () => {
        textoFlotante.destroy();
      },
    });
  }

  recibirDaño(cantidad) {
    if (this.isDead) return;
    this.health -= cantidad;
    if (this.health < 0) this.health = 0;
    useGameStore().setPlayerHealth(this.health);
    this.mostrarNumeroFlotante(cantidad, 'daño');
    this.setTint(0xff0000);
    this.scene.time.delayedCall(150, () => {
      if (!this.isDead) this.clearTint();
    });
    if (this.health <= 0) this.morir();
  }

  onInfectarCivil() {}

  puedeUsarHabilidad() {
    const currentTime = this.scene.time.now;

    if (currentTime - this.lastAbilityTime >= this.abilityCooldown) {
      this.lastAbilityTime = currentTime;

      return true;
    }
    console.log(`Habilidad en enfriamiento. Faltan ${((this.abilityCooldown - (currentTime - this.lastAbilityTime)) / 1000).toFixed(1)}s`);

    return false;
  }

  curar(cantidad) {
    if (this.isDead || this.health >= this.maxHealth) return;

    const curacionReal = Math.min(cantidad, this.maxHealth - this.health);

    this.health += curacionReal;
    useGameStore().setPlayerHealth(this.health);
    this.mostrarNumeroFlotante(curacionReal, 'cura');

    this.setTint(0x00ff00);
    this.scene.time.delayedCall(200, () => {
      if (!this.isDead) this.clearTint();
    });
  }

  morir() {
    const store = useGameStore();

    this.isDead = true;
    this.health = 0;
    this.setVelocity(0, 0);
    this.setTint(0x333333);
    this.anims.stop();
    store.setGameOver();
    this.scene.scene.pause('MainScene');
  }

  ejecutarAtaque(esCargado) {
    if (!this.isAttacking && !this.isDead) {
      this.isAttacking = true;
      this.setVelocity(0, 0);

      if (esCargado) {
        this.setTint(0xffaa00);
        this.scene.time.delayedCall(200, () => this.clearTint());
        this.currentDamage = this.baseDamage * GLOBAL_PLAYER_MECHANICS.CHARGED_ATTACK.DAMAGE_MULTIPLIER;
      } else {
        this.currentDamage = this.baseDamage;
      }
      this.play(this.animAttack, true);
    }
  }

  usarHabilidadEspecial() {
    console.log('Este zombi no tiene habilidad especial definida o es el zombi base.');
  }

  update(time, delta) {
    if (this.isDead) return;

    if (this.body && this.body.isCircle) {
      const centroX = this.width / 2;
      const centroY = this.height / 2;

      this.body.setOffset(centroX - this._hitboxRadio, centroY - this._hitboxRadio);
    }

    let isMoving = false;
    let currentSpeed = this.baseSpeed;
    const sprintConfig = GLOBAL_PLAYER_MECHANICS.SPRINT;

    if (this.isFatigued) {
      currentSpeed = this.baseSpeed * sprintConfig.FATIGUE_PENALTY;
      if (this.stamina >= sprintConfig.FATIGUE_RECOVERY) this.isFatigued = false;
    } else if (this.keys.sprint.isDown && !this.isAttacking && !this.isChargingAttack) {
      if (this.keys.left.isDown || this.keys.right.isDown || this.keys.up.isDown || this.keys.down.isDown) {
        currentSpeed = this.baseSpeed * sprintConfig.MULTIPLIER;
        this.stamina -= sprintConfig.STAMINA_DRAIN_RATE * (delta / 1000);

        if (this.stamina <= 0) {
          this.stamina = 0;
          this.isFatigued = true;
        }
      }
    }

    if (!this.keys.sprint.isDown && !this.isAttacking && this.stamina < this.maxStamina) {
      this.stamina += sprintConfig.STAMINA_REGEN_RATE * (delta / 1000);
      if (this.stamina > this.maxStamina) this.stamina = this.maxStamina;
    }

    if (!this.isAttacking) {
      const speedToApply = this.isChargingAttack ? currentSpeed * 0.4 : currentSpeed;
      let moveX = 0;
      let moveY = 0;

      if (this.keys.left.isDown) moveX = -1;
      else if (this.keys.right.isDown) moveX = 1;
      if (this.keys.up.isDown) moveY = -1;
      else if (this.keys.down.isDown) moveY = 1;

      if (moveX !== 0 || moveY !== 0) {
        isMoving = true;
        const vec = new Phaser.Math.Vector2(moveX, moveY).normalize();

        this.setVelocityX(vec.x * speedToApply);
        this.setVelocityY(vec.y * speedToApply);
        this.setRotation(vec.angle());

        if (this.keys.sprint.isDown && !this.isFatigued) {
          const radioVision = this._hitboxRadio + 20; // Proyecta el cuerpo 20px hacia adelante
          const dirX = Math.cos(this.rotation);
          const dirY = Math.sin(this.rotation);
          const puntaX = this.x + dirX * radioVision;
          const puntaY = this.y + dirY * radioVision;

          let chocaFrente = false;

          if (this.scene.obstaculos) {
            const obstaculos = this.scene.obstaculos.getChildren();

            for (let i = 0; i < obstaculos.length; i++) {
              if (obstaculos[i].getBounds().contains(puntaX, puntaY)) {
                chocaFrente = true;
                break;
              }
            }
          }

          if (chocaFrente) {
            this.setVelocityX(this.body.velocity.x * 0.2);
            this.setVelocityY(this.body.velocity.y * 0.2);
          }
        }
      } else {
        this.setVelocity(0, 0);
      }
    }

    if (!this.isAttacking) {
      if (isMoving) {
        this.play(this.animWalk, true);
        this.anims.timeScale = this.keys.sprint.isDown && !this.isFatigued ? 1.5 : 1;
      } else {
        if (this.anims.currentAnim) this.anims.stop();
      }
    }
    useGameStore().setPlayerStamina(this.stamina);
  }
}
