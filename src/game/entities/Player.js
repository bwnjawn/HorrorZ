import Phaser from 'phaser';
import { useGameStore } from '../../stores/gameStore';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'zombie-walk');

    // Añadir al motor de renderizado y físicas de la escena
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(0.1);
    this.setCollideWorldBounds(true); //Hay q desactivar esto cuando agrandemos el mapa
    this.setLighting(true);
    // Variables de estado copiadas de tu código
    this.speed = 300;
    this.isAttacking = false;
    this.lastVelocity = { x: this.speed, y: 0 };
    this.cursors = scene.input.keyboard.createCursorKeys();

    // Sistema de vida
    this.maxHealth = 200;
    this.health = this.maxHealth;
    this.isDead = false;

    // Inicialización
    this.play('zombie-walk-anim');
    this.setVelocityX(this.speed);

    // Escuchar clic izquierdo para atacar
    scene.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown() && !this.isDead) {
        this.ejecutarAtaque();
      }
    });

    // Retornar a caminar cuando el ataque termine
    this.on('animationcomplete-zombie-attack-anim', () => {
      if (this.isDead) return;
      this.isAttacking = false;
      this.setVelocity(this.lastVelocity.x, this.lastVelocity.y);
      this.play('zombie-walk-anim', true);
    });
  }
  recibirDaño(cantidad) {
    if (this.isDead) return;
    this.health -= cantidad;
    this.setTint(0xff0000);
    this.scene.time.delayedCall(150, () => {
      if (!this.isDead) this.clearTint();
    });

    if (this.health <= 0) {
      this.morir();
    }
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

  ejecutarAtaque() {
    if (!this.isAttacking && !this.isDead) {
      this.isAttacking = true;
      this.setVelocity(0, 0); // Se detiene para atacar
      this.play('zombie-attack-anim', true);
    }
  }

  update() {
    if (this.isDead) return;

    // Control de dirección
    if (!this.isAttacking) {
      if (this.cursors.left.isDown) {
        this.lastVelocity = { x: -this.speed, y: 0 };
        this.setVelocityX(this.lastVelocity.x);
        this.setVelocityY(0);
        this.setRotation(Phaser.Math.DegToRad(270));
      } else if (this.cursors.right.isDown) {
        this.lastVelocity = { x: this.speed, y: 0 };
        this.setVelocityX(this.lastVelocity.x);
        this.setVelocityY(0);
        this.setRotation(Phaser.Math.DegToRad(90));
      } else if (this.cursors.up.isDown) {
        this.lastVelocity = { x: 0, y: -this.speed };
        this.setVelocityX(0);
        this.setVelocityY(this.lastVelocity.y);
        this.setRotation(Phaser.Math.DegToRad(0));
      } else if (this.cursors.down.isDown) {
        this.lastVelocity = { x: 0, y: this.speed };
        this.setVelocityX(0);
        this.setVelocityY(this.lastVelocity.y);
        this.setRotation(Phaser.Math.DegToRad(180));
      }
    }

    // Asegurar animación de caminar si no está atacando
    if (this.anims && this.anims.currentAnim && this.anims.currentAnim.key !== 'zombie-attack-anim') {
      this.play('zombie-walk-anim', true);
    }
  }
}
