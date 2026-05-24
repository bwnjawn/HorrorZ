import Phaser from 'phaser';
import { useGameStore } from '../../stores/gameStore';
import { GLOBAL_PLAYER_MECHANICS } from '../config/PlayerStatsConfig';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, config) {
    super(scene, x, y, config?.spriteKey || 'zombie-walk');

    // Añadir al motor de renderizado y físicas de la escena
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(0.1);
    this.setCollideWorldBounds(true); //Hay q desactivar esto cuando agrandemos el mapa
    this.setLighting(true);

    // ASIGNAR ESTADÍSTICAS BASE
    this.baseSpeed = config?.baseSpeed || 300;
    this.maxHealth = config?.baseHealth || 200;
    this.health = this.maxHealth;
    this.baseDamage = config?.baseDamage || 20;
    this.currentDamage = this.baseDamage;

    //SISTEMA DE ESTAMINA
    this.maxStamina = config?.maxStamina || 150;
    this.stamina = this.maxStamina;
    this.isFatigued = false;

    // Estados
    this.isDead = false;
    this.isAttacking = false;
    this.isChargingAttack = false;
    this.chargeStartTime = 0;

    this.animWalk = config?.animWalk || 'zombie-walk-anim';
    this.animAttack = config?.animAttack || 'zombie-attack-anim';

    // Controles
    this.keys = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      sprint: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      special: Phaser.Input.Keyboard.KeyCodes.Q,
    });

    // Escuchar clic izquierdo para atacar
    scene.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown() && !this.isDead && !this.isAttacking) {
        this.isChargingAttack = true;
        this.chargeStartTime = scene.time.now;
      } else if (pointer.rightButtonDown() && !this.isDead) {
        this.usarHabilidadEspecial();
      }
    });

    // Para saber si mantiene el click y hacer ataque cargado
    scene.input.on('pointerup', (pointer) => {
      if (pointer.leftButtonReleased() && this.isChargingAttack && !this.isDead) {
        this.isChargingAttack = false;
        const holdTime = scene.time.now - this.chargeStartTime;

        if (holdTime >= GLOBAL_PLAYER_MECHANICS.CHARGED_ATTACK.CHARGE_TIME_MS) {
          if (this.stamina >= GLOBAL_PLAYER_MECHANICS.CHARGED_ATTACK.STAMINA_COST) {
            this.stamina -= GLOBAL_PLAYER_MECHANICS.CHARGED_ATTACK.STAMINA_COST;
            this.ejecutarAtaque(true); // ataque cargado
          } else {
            this.ejecutarAtaque(false); // No tiene estamina, sale ataque normal
          }
        } else {
          this.ejecutarAtaque(false); // No mantiene, entonces es ataque normal.
        }
      }
    });

    // Habilidad especial por teclado (opcional, como atajo al clic derecho)
    scene.input.keyboard.on('keydown-Q', () => {
      if (!this.isDead) this.usarHabilidadEspecial();
    });

    // Retornar a caminar cuando el ataque termine
    this.on(`animationcomplete-${this.animAttack}`, () => {
      if (this.isDead) return;
      this.isAttacking = false;
      this.currentDamage = this.baseDamage;
    });
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

  curar(cantidad) {
    if (this.isDead) return;
    this.health += cantidad;

    if (this.health > this.maxHealth) {
      this.health = this.maxHealth; //Esto quiza sacar despues para ir agrandando la barra de vida----------------------------------------------
    }
    this.setTint(0x00ff00);
    this.scene.time.delayedCall(200, () => {
      if (!this.isDead) this.clearTint();
    });
  }

  morir() {
    const store = useGameStore();

    this.isDead = true;
    this.health = 0;
    // Efectos de muerte
    this.setVelocity(0, 0);
    this.setTint(0x333333);
    this.anims.stop();
    store.setGameOver();
    this.scene.scene.pause('MainScene');
  }

  ejecutarAtaque(esCargado) {
    if (!this.isAttacking && !this.isDead) {
      this.isAttacking = true;
      this.setVelocity(0, 0); // Se detiene para atacar

      if (esCargado) {
        this.setTint(0xffaa00); // Color temporal para notar el golpe cargado
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

    let isMoving = false;
    let currentSpeed = this.baseSpeed;
    const sprintConfig = GLOBAL_PLAYER_MECHANICS.SPRINT;

    if (this.isFatigued) {
      currentSpeed = this.baseSpeed * sprintConfig.FATIGUE_PENALTY;

      if (this.stamina >= sprintConfig.FATIGUE_RECOVERY) {
        this.isFatigued = false;
      }
    } else if (this.keys.sprint.isDown && !this.isAttacking && !this.isChargingAttack) {
      if (this.keys.left.isDown || this.keys.right.isDown || this.keys.up.isDown || this.keys.down.isDown) {
        currentSpeed = this.baseSpeed * sprintConfig.MULTIPLIER;
        // Restar estamina multiplicando por delta para que sea constante sin importar los FPS
        this.stamina -= sprintConfig.STAMINA_DRAIN_RATE * (delta / 1000);

        if (this.stamina <= 0) {
          this.stamina = 0;
          this.isFatigued = true; // Se cansó
        }
      }
    }

    if (!this.keys.sprint.isDown && !this.isAttacking && this.stamina < this.maxStamina) {
      // Sumar estamina multiplicando por delta para que sea constante sin importar los FPS
      this.stamina += sprintConfig.STAMINA_REGEN_RATE * (delta / 1000);
      if (this.stamina > this.maxStamina) this.stamina = this.maxStamina;
    }

    if (!this.isAttacking) {
      this.setVelocity(0, 0);
      let speedToApply = this.isChargingAttack ? currentSpeed * 0.4 : currentSpeed;

      if (this.keys.left.isDown) {
        this.setVelocityX(-speedToApply);
        this.setRotation(Phaser.Math.DegToRad(270));
        isMoving = true;
      } else if (this.keys.right.isDown) {
        this.setVelocityX(speedToApply);
        this.setRotation(Phaser.Math.DegToRad(90));
        isMoving = true;
      } else if (this.keys.up.isDown) {
        this.setVelocityY(-speedToApply);
        this.setRotation(Phaser.Math.DegToRad(0));
        isMoving = true;
      } else if (this.keys.down.isDown) {
        this.setVelocityY(speedToApply);
        this.setRotation(Phaser.Math.DegToRad(180));
        isMoving = true;
      }
    }

    // Asegurar animación de caminar si no está atacando
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
