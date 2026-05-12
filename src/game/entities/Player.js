import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'zombie-walk');

    // Añadir al motor de renderizado y físicas de la escena
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(0.1);
    this.setCollideWorldBounds(true);

    // Variables de estado copiadas de tu código
    this.speed = 400;
    this.isAttacking = false;
    this.lastVelocity = { x: this.speed, y: 0 };
    this.cursors = scene.input.keyboard.createCursorKeys();

    // Inicialización
    this.play('zombie-walk-anim');
    this.setVelocityX(this.speed);

    // Escuchar clic izquierdo para atacar
    scene.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.ejecutarAtaque();
      }
    });

    // Retornar a caminar cuando el ataque termine
    this.on('animationcomplete-zombie-attack-anim', () => {
      this.isAttacking = false;
      this.setVelocity(this.lastVelocity.x, this.lastVelocity.y);
      this.play('zombie-walk-anim', true);
    });
  }

  ejecutarAtaque() {
    if (!this.isAttacking) {
      this.isAttacking = true;
      this.setVelocity(0, 0); // Se detiene para atacar
      this.play('zombie-attack-anim', true);
    }
  }

  update() {
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
