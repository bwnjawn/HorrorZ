import Phaser from 'phaser';

export class Civilian extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'civil-walking');

    scene.add.existing(this);
    this.setScale(0.1);

    scene.physics.add.existing(this);

    // Estos valores recortan el espacio vacío alrededor de tu PNG
    this.body.setSize(150, 250);
    this.body.setOffset(80, 60);

    this.setCollideWorldBounds(true); //Hay q desactivar esto cuando agrandemos el mapa
    this.setBounce(1, 1);
    this.play('civil-walk-anim');

    // Propiedades de vida
    this.health = 30;
    this.isDead = false;

    // propiedades de estado
    this.isInfected = false;
    this.panicDistance = 250;
    this.escapeSpeed = 150;
    this.wanderSpeed = 50;

    // propiedades de movimiento
    this.maxSpeed = 280;
    this.maxForce = 15;
    this.acceleration = new Phaser.Math.Vector2(0, 0);
    this.velocity = new Phaser.Math.Vector2(0, 0);
    this.estadoHorda = 'LIBRE';
    this.isAttacking = false;

    scene.events.on('comandante-reagrupar', () => {
      if (this.isInfected && !this.isDead) this.estadoHorda = 'REAGRUPANDO';
    });
    scene.events.on('comandante-libre', () => {
      if (this.isInfected && !this.isDead) this.estadoHorda = 'LIBRE';
    });
  }
  recibirDaño(cantidad) {
    if (this.isDead || !this.isInfected) return;
    this.health -= cantidad;
    
    // Feedback de impacto (Rojo)
    this.setTint(0xff0000);
    this.scene.time.delayedCall(150, () => {
      if (!this.isDead && this.active) this.clearTint();
    });
    if (this.health <= 0) {
      this.morirDefinitivamente();
    }
  }

  morirDefinitivamente() {
    this.isDead = true;
    this.setVelocity(0, 0);
    this.destroy(); 
  }

  infectar() {
    if (this.isDead || this.isInfected) return;
    this.isInfected = true;
    this.health = 50;
    this.ejecutarAtaque();
  }

  ejecutarAtaque() {
    if (this.isAttacking || this.isDead) return;

    this.isAttacking = true;
    this.setTint(0x550000);
    this.setTexture('zombie-attack');
    this.play('zombie-attack-anim', true); 

    // Cuando la animación termine, vuelve a caminar
    this.once('animationcomplete-zombie-attack-anim', () => {
      if (this.isDead || !this.active) return;
      this.isAttacking = false;
      this.setTexture('zombie-walk');
      this.play('zombie-walk-anim', true);
    });
  }

  getClosestCivilian(civiles) {
    let closest = null;
    let minDistance = 250; 
    civiles.forEach((civil) => {
      if (!civil.isInfected && civil.active && !civil.isDead) {
        // Solo detectar a los sanos
        const dist = Phaser.Math.Distance.Between(this.x, this.y, civil.x, civil.y);
        if (dist < minDistance) {
          minDistance = dist;
          closest = civil;
        }
      }
    });

    return closest;
  }

  applySeek(target) {
    if (!target || !target.active || target.isDead) return new Phaser.Math.Vector2(0, 0);
    const desired = new Phaser.Math.Vector2(target.x, target.y).subtract(new Phaser.Math.Vector2(this.x, this.y));

    // Si estamos cerca, bajamos la velocidad para no dar vueltas
    const distance = desired.length();
    desired.normalize();

    if (distance < 50) {
      const speed = Phaser.Math.Interpolation.Linear([0, this.maxSpeed], distance / 50);
      desired.scale(speed);
    } else {
      desired.scale(this.maxSpeed);
    }
    //Fuerza de correccion
    const steer = desired.subtract(this.velocity);
    if (steer.length() > this.maxForce) steer.normalize().scale(this.maxForce);
    return steer;
  }

  // Fuerza de Separación: Evita que los zombies se solapen
  applySeparate(horda) {
    const radius = 50; // Radio de "espacio personal"
    let steer = new Phaser.Math.Vector2(0, 0);
    let count = 0;

    horda.forEach((neighbor) => {
      if (!neighbor.active || neighbor.isDead || neighbor === this) return; 
      const d = Phaser.Math.Distance.Between(this.x, this.y, neighbor.x, neighbor.y);
      if (d > 0 && d < radius) {
        const diff = new Phaser.Math.Vector2(this.x, this.y).subtract(new Phaser.Math.Vector2(neighbor.x, neighbor.y)).normalize().divide({ x: d, y: d }); // Mientras más cerca, más fuerte el empujón
        steer.add(diff);
        count++;
      }
    });

    if (count > 0) {
      steer.divide({ x: count, y: count });
      steer.normalize().scale(this.maxSpeed).subtract(this.velocity);
      if (steer.length() > this.maxForce) steer.normalize().scale(this.maxForce);
    }
    return steer;
  }

  update(player, horda, civiles) {
    if (this.isDead || !this.active) return;
    if (this.isInfected) {
      if (this.isAttacking) {
        this.acceleration.set(0, 0);
        this.velocity.set(0, 0);
        this.setVelocity(0, 0);
        return; // Detiene la ejecución del update aquí mismo
      }
      this.acceleration.set(0, 0);

      let target = player;
      let pesoAtraccion = 1.0;
      let pesoSeparacion = 1.5;

      // MÁQUINA DE ESTADOS
      if (this.estadoHorda === 'REAGRUPANDO') {
        // Ignora civiles, va hacia el jugador
        pesoAtraccion = 3.0;
        pesoSeparacion = 0.2;
        this.maxSpeed = 450;
      } else {
        // Estado LIBRE: Puede buscar presa
        this.maxSpeed = 280;
        if (civiles && civiles.length > 0) {
          const presaCercana = this.getClosestCivilian(civiles);
          if (presaCercana) {
            target = presaCercana; 
            pesoAtraccion = 1.8;
            pesoSeparacion = 1.0;
          }
        }
      }
      // Sumar fuerzas
      const forceSeek = this.applySeek(target).scale(pesoAtraccion); 
      const forceSeparate = this.applySeparate(horda).scale(pesoSeparacion); 

      this.acceleration.add(forceSeek);
      this.acceleration.add(forceSeparate);

      // Mover el cuerpo
      this.velocity.add(this.acceleration);
      this.setVelocity(this.velocity.x, this.velocity.y);

      if (this.velocity.length() > this.maxSpeed) {
        this.velocity.normalize().scale(this.maxSpeed);
      }

      // Girar el sprite hacia donde camina
      this.setRotation(this.velocity.angle() + Math.PI / 2);
      this.acceleration.scale(0); // Resetear aceleración para el próximo frame

      if (this.anims && this.anims.currentAnim && this.anims.currentAnim.key !== 'zombie-attack-anim') {
        this.play('zombie-walk-anim', true);
      }
    } else {
      // Lógica de escape de los civiles
      let amenazaCercana = player;
      let distAmenaza = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
      if (horda) {
        horda.forEach((zombie) => {
          if (!zombie.active || zombie.isDead) return;
          const dist = Phaser.Math.Distance.Between(this.x, this.y, zombie.x, zombie.y);
          if (dist < distAmenaza) {
            distAmenaza = dist;
            amenazaCercana = zombie; 
          }
        });
      }
      const isBlocked = !this.body.blocked.none;

      if (distAmenaza < this.panicDistance) {
        this.setCollideWorldBounds(true);
        let angle = Phaser.Math.Angle.Between(amenazaCercana.x, amenazaCercana.y, this.x, this.y);
        if (isBlocked) {
          angle += Phaser.Math.FloatBetween(-Math.PI / 4, Math.PI / 4);
        }
        this.scene.physics.velocityFromRotation(angle, this.escapeSpeed, this.body.velocity);
        this.setRotation(angle + Math.PI / 2);
        this.play('civil-walk-anim', true);
      } else if (this.body.velocity.length() === 0) {
        const startAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        this.scene.physics.velocityFromRotation(startAngle, this.wanderSpeed, this.body.velocity);
        this.setRotation(startAngle + Math.PI / 2);
      }
    }
  }
}
