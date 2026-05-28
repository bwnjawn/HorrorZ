import Phaser from 'phaser';
import { useGameStore } from '../../stores/gameStore';
import { GLOBAL_PLAYER_MECHANICS } from '../config/PlayerStatsConfig';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, config) {
    super(scene, x, y, config?.spriteKey || 'zombie-walk');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(0.3);
    this.body.setOffset(
    this.width * 0.35,
    this.height * 0.35
    );
    this.setCollideWorldBounds(true);
    this.setLighting(true);

    this._hitboxRadio   = config?.hitboxRadio   ?? 20;
    this._hitboxOffsetX = config?.hitboxOffsetX ?? 6;
    this._hitboxOffsetY = config?.hitboxOffsetY ?? 6;
    this.body.setCircle(this._hitboxRadio, this._hitboxOffsetX, this._hitboxOffsetY);

    // ESTADÍSTICAS BASE
    this.baseSpeed      = config?.baseSpeed  || 300;
    this.maxHealth      = config?.baseHealth || 200;
    this.health         = this.maxHealth;
    this.baseDamage     = config?.baseDamage || 20;
    this.currentDamage  = this.baseDamage;

    // ESTAMINA
    this.maxStamina     = config?.maxStamina       || 150;
    this.stamina        = this.maxStamina;
    this.isFatigued     = false;
    this.abilityCooldown = config?.abilityCooldown || 5000;
    this.lastAbilityTime = 0;

    // ESTADOS
    this.isDead           = false;
    this.isAttacking      = false;
    this.isChargingAttack = false;
    this.chargeStartTime  = 0;

    this.animWalk   = config?.animWalk   || 'zombie-walk-anim';
    this.animAttack = config?.animAttack || 'zombie-attack-anim';

    // CONTROLES
    this.keys = scene.input.keyboard.addKeys({
      up:      Phaser.Input.Keyboard.KeyCodes.W,
      down:    Phaser.Input.Keyboard.KeyCodes.S,
      left:    Phaser.Input.Keyboard.KeyCodes.A,
      right:   Phaser.Input.Keyboard.KeyCodes.D,
      sprint:  Phaser.Input.Keyboard.KeyCodes.SHIFT,
      special: Phaser.Input.Keyboard.KeyCodes.Q,
    });

    scene.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown() && !this.isDead && !this.isAttacking) {
        this.isChargingAttack = true;
        this.chargeStartTime  = scene.time.now;
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
      this.isAttacking   = false;
      this.currentDamage = this.baseDamage;
    });
  }

  // -------------------------------------------------------
  // Cambia la hitbox circular y guarda los valores para
  // poder restaurarlos después de cada setTexture().
  // Úsalo en los constructores de las subclases después de setScale().
  // -------------------------------------------------------
  ajustarHitbox(radio, offsetX, offsetY) {
    this._hitboxRadio   = radio;
    this._hitboxOffsetX = offsetX;
    this._hitboxOffsetY = offsetY;
    this.body.setCircle(radio, offsetX, offsetY);
  }

  // -------------------------------------------------------
  // Usar SIEMPRE este método en lugar de setTexture() directamente.
  // En Phaser 3, setTexture() resetea el body al tamaño del nuevo
  // frame, rompiendo la hitbox personalizada. Este método la restaura.
  // -------------------------------------------------------
  resetearSprite(textureKey) {
    this.setTexture(textureKey);
    this.body.setCircle(this._hitboxRadio, this._hitboxOffsetX, this._hitboxOffsetY);
  }

  recibirDaño(cantidad) {
    if (this.isDead) return;
    this.health -= cantidad;
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
    if (this.isDead) return;
    this.health += cantidad;
    if (this.health > this.maxHealth) this.health = this.maxHealth;
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

    let isMoving    = false;
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
          this.stamina  = 0;
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

      if (this.keys.left.isDown)       moveX = -1;
      else if (this.keys.right.isDown) moveX =  1;
      if (this.keys.up.isDown)         moveY = -1;
      else if (this.keys.down.isDown)  moveY =  1;

      if (moveX !== 0 || moveY !== 0) {
        isMoving = true;
        const vec = new Phaser.Math.Vector2(moveX, moveY).normalize();
        this.setVelocityX(vec.x * speedToApply);
        this.setVelocityY(vec.y * speedToApply);
        this.setRotation(vec.angle());
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
  }
}
