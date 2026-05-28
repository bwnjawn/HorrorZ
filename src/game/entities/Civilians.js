import Phaser from 'phaser';

export class Civilian extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
  // Cambiamos el 'civil-walking' antiguo por la primera textura de la animación
  super(scene, x, y, 'civil_walk_1'); 

  scene.add.existing(this);
  scene.physics.add.existing(this);

  // Ajusta esta escala según tus sprites. Si siguen viéndose gigantes, baja este valor (ej: 0.2)
  this.setScale(0.15); 

  // Ajuste de Hitbox para que no choquen con el aire
  const hitboxAncho = this.width * 0.3; 
  const hitboxAlto = this.height * 0.3;
  this.body.setSize(hitboxAncho, hitboxAlto);
  this.body.setOffset((this.width - hitboxAncho) / 2, (this.height - hitboxAlto) / 2);

  this.setCollideWorldBounds(true);
  this.setBounce(1, 1);
  
  // Aquí activamos la nueva animación
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
    this.setLighting(true);

    scene.events.on('comandante-reagrupar', () => {
      if (this.isInfected && !this.isDead) this.estadoHorda = 'REAGRUPANDO';
    });
    scene.events.on('comandante-libre', () => {
      if (this.isInfected && !this.isDead) this.estadoHorda = 'LIBRE';
    });
  }

  desactivar() {
    this.setActive(false);
    this.setVisible(false);
    this.body.enable = false;
  }

  respawn(x, y) {
    this.setActive(true);
    this.setVisible(true);
    this.body.enable = true;
    this.setPosition(x, y);

    // Resetear estados críticos
    this.isDying = false;
    this.isInfected = false;

    this.clearTint();
    this.play('civil-walk-anim', true);
  }

  recibirDaño(cantidad, tipoDaño = 'normal') {
    if (this.isDead || (this.esInvulnerable && tipoDaño !== 'veneno')) return;

    this.health -= cantidad;

    this.setTint(tipoDaño === 'veneno' ? 0x00ff00 : 0xff0000);
    this.scene.time.delayedCall(150, () => {
      if (!this.isDead && this.active) this.clearTint();
    });

    if (this.health <= 0) {
      if (!this.isInfected) {
        this.infectar();
        this.scene.civiliansGroup.remove(this);
        this.scene.hordeGroup.add(this);
        if (this.scene.store) this.scene.store.infectCivilian();
      } else {
        this.morirDefinitivamente();
      }
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

    // Cuando se infecta, debemos recalcular la hitbox porque el sprite del zombie 
    // tiene un tamaño diferente al del civil.
    this.setScale(0.3); // O la escala que uses para los zombies (ej: 1)
    
    // Forzamos el cambio de textura de inmediato para recalcular la caja
    this.setTexture('zombie_walk_0');
    
    
    const hitboxAncho = this.width * 0.4; 
    const hitboxAlto = this.height * 0.4;
    this.body.setSize(hitboxAncho, hitboxAlto);
    this.body.setOffset((this.width - hitboxAncho) / 2, (this.height - hitboxAlto) / 2);

    this.ejecutarAtaque();
  }

  ejecutarAtaque() {
    if (this.isAttacking || this.isDead) return;

    this.isAttacking = true;
    this.setTint(0x550000);
    
    // CORRECCIÓN: Usar las nuevas texturas individuales de ataque
    this.setTexture('zombie_attack_1');
    this.play('zombie-attack-anim', true);

    // Cuando la animación termine, vuelve a caminar
    this.once('animationcomplete-zombie-attack-anim', () => {
      if (this.isDead || !this.active) return;
      this.isAttacking = false;
      // CORRECCIÓN: Usar la nueva textura base del zombie
      this.setTexture('zombie_walk_0');
      this.play('zombie-walk-anim', true);
    });
  }

  getClosestCivilian(civiles) {
    let closest = null;
    let minDistance = 250;

    civiles.forEach((civil) => {
      if (!civil.isInfected && civil.active && !civil.isDead) {
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

    const distance = desired.length();
    desired.normalize();

    if (distance < 50) {
      const speed = Phaser.Math.Interpolation.Linear([0, this.maxSpeed], distance / 50);
      desired.scale(speed);
    } else {
      desired.scale(this.maxSpeed);
    }
    const steer = desired.subtract(this.velocity);

    if (steer.length() > this.maxForce) steer.normalize().scale(this.maxForce);

    return steer;
  }

  applySeparate(horda) {
    const radius = 50; 
    let steer = new Phaser.Math.Vector2(0, 0);
    let count = 0;

    horda.forEach((neighbor) => {
      if (!neighbor.active || neighbor.isDead || neighbor === this) return;
      const d = Phaser.Math.Distance.Between(this.x, this.y, neighbor.x, neighbor.y);

      if (d > 0 && d < radius) {
        const diff = new Phaser.Math.Vector2(this.x, this.y)
          .subtract(new Phaser.Math.Vector2(neighbor.x, neighbor.y))
          .normalize()
          .divide({ x: d, y: d });

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
        return; 
      }
      this.acceleration.set(0, 0);

      let target = player;
      let pesoAtraccion = 1.0;
      let pesoSeparacion = 1.5;

      if (this.estadoHorda === 'REAGRUPANDO') {
        pesoAtraccion = 3.0;
        pesoSeparacion = 0.2;
        this.maxSpeed = 450;
      } else {
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
      const forceSeek = this.applySeek(target).scale(pesoAtraccion);
      const forceSeparate = this.applySeparate(horda).scale(pesoSeparacion);

      this.acceleration.add(forceSeek);
      this.acceleration.add(forceSeparate);

      this.velocity.add(this.acceleration);
      this.setVelocity(this.velocity.x, this.velocity.y);

      if (this.velocity.length() > this.maxSpeed) {
        this.velocity.normalize().scale(this.maxSpeed);
      }

      // CORRECCIÓN DE ROTACIÓN ZOMBIE: Sin + Math.PI/2
      this.setRotation(this.velocity.angle());
      this.acceleration.scale(0); 

      if (this.anims && this.anims.currentAnim && this.anims.currentAnim.key !== 'zombie-attack-anim') {
        this.play('zombie-walk-anim', true);
      }
    } else {
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
        
        // CORRECCIÓN DE ROTACIÓN CIVIL (Huyendo)
        this.setRotation(angle);
        this.play('civil-walk-anim', true);
      } else if (this.body.velocity.length() === 0) {
        const startAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);

        this.scene.physics.velocityFromRotation(startAngle, this.wanderSpeed, this.body.velocity);
        
        // CORRECCIÓN DE ROTACIÓN CIVIL (Patrullando)
        this.setRotation(startAngle);
      }
    }
  }
}