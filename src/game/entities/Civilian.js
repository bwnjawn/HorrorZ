import Phaser from 'phaser';

export class Civilian extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'civil-walking');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(0.25);
    this.setCollideWorldBounds(true);
    this.setBounce(1, 1);
    this.play('civil-walk-anim');

    // Variables de estado
    this.isInfected = false;
    this.panicDistance = 250;
    this.escapeSpeed = 350;
    this.wanderSpeed = 100;
    this.followSpeed = 150;
  }

  infectar() {
    if (this.isInfected) return;
    this.isInfected = true;
    console.log('¡Civil convertido!');
    this.setTint(0x00ff00); // Cambio visual temporal a verde
  }

  update(player) {
    if (this.isInfected) {
      // Lógica de horda: seguir al jugador
      const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      this.scene.physics.velocityFromRotation(angle, this.followSpeed, this.body.velocity);
      this.setRotation(angle + Math.PI / 2);
      this.play('civil-walk-anim', true);
    } else {
      // Lógica de escape de los civiles
      const distance = Phaser.Math.Distance.Between(player.x, player.y, this.x, this.y);
      const isBlocked = !this.body.blocked.none;

      if (distance < this.panicDistance) {
        this.setCollideWorldBounds(true);
        let angle = Phaser.Math.Angle.Between(player.x, player.y, this.x, this.y);
        if (isBlocked) {
          angle += Phaser.Math.FloatBetween(-Math.PI / 4, Math.PI / 4);
        }
        this.scene.physics.velocityFromRotation(angle, this.escapeSpeed, this.body.velocity);
        this.setRotation(angle + Math.PI / 2);
        this.play('civil-walk-anim', true);
      } else {
        if (this.body.velocity.length() === 0) {
          const startAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
          this.scene.physics.velocityFromRotation(startAngle, this.wanderSpeed, this.body.velocity);
          this.setRotation(startAngle + Math.PI / 2);
          this.play('civil-walk-anim', true);
        }
        if (isBlocked || Math.random() < 0.01) {
          const randomAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
          this.scene.physics.velocityFromRotation(randomAngle, this.wanderSpeed, this.body.velocity);
          this.setRotation(randomAngle + Math.PI / 2);
        }
      }
    }
  }
}
