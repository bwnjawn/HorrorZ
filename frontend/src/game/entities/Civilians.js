import Phaser from 'phaser';

export class Civilian extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'civil_walk_1');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(0.15);

    const hitboxAncho = this.width * 0.3;
    const hitboxAlto = this.height * 0.3;

    this.body.setSize(hitboxAncho, hitboxAlto);
    this.body.setOffset((this.width - hitboxAncho) / 2, (this.height - hitboxAlto) / 2);

    this.setBounce(1, 1);

    this.play('civil-walk-anim');

    this.health = 30;
    this.isDead = false;

    this.isInfected = false;
    this.panicDistance = 250;
    this.escapeSpeed = 150;
    this.wanderSpeed = 50;

    this.maxSpeed = 280;
    this.maxForce = 15;
    this.acceleration = new Phaser.Math.Vector2(0, 0);
    this.velocity = new Phaser.Math.Vector2(0, 0);
    this.estadoHorda = 'LIBRE';
    this.isAttacking = false;
    this.setLighting(true);
    this.isResurrecting = false;

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

    this.isDying = false;
    this.isInfected = false;
    this.isResurrecting = false;
    this.isAttacking = false;

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
    if (this.isDead) return;
    this.isDead = true;

    // 1. Frenamos por completo el movimiento e inercias del cuerpo
    this.setVelocity(0, 0);
    this.acceleration.set(0, 0);
    this.velocity.set(0, 0);

    // 2. DESACTIVAR HITBOX INMEDIATAMENTE:
    // Esto es crítico para que las balas de los soldados lo atraviesen
    // y otros zombies no choquen contra él mientras cae al suelo.
    if (this.body) {
      this.body.enable = false;
    }

    // 3. Limpiamos cualquier tinte rojo de daño previo para que se vea limpio
    this.clearTint();

    // 4. Reproducir la secuencia de muerte que creamos en la escena
    this.play('zombie-death-anim', true);

    // 5. ESCUCHADOR: Cuando la animación termine por completo, removemos el objeto del juego
    this.once('animationcomplete-zombie-death-anim', () => {
      this.destroy();
    });
  }

  infectar() {
    if (this.isDead || this.isInfected) return;
    this.isInfected = true;
    this.isResurrecting = true;
    this.health = 50;

    // Frenamos por completo el cuerpo físico inmediatamente
    this.setVelocity(0, 0);

    if (this.body) {
      this.body.reset(this.x, this.y);
    }

    this.clearTint();

    // Ajustamos la escala para la animación de levantamiento
    this.setScale(0.35);

    // 1. REPRODUCIR LA RESURRECCIÓN PRIMERO Visualmente
    this.play('zombie-resurrection-anim', true);

    // 2. ESCUCHADOR: Cuando termine de levantarse, pasa a convertirse en un Zombie activo
    this.once('animationcomplete-zombie-resurrection-anim', () => {
      this.isResurrecting = false;

      // Ponemos la textura base oficial de caminar
      this.setTexture('zombie_walk_0');

      // Recalculamos la hitbox física exacta que usará la Horda
      const hitboxAncho = this.width * 0.4;
      const hitboxAlto = this.height * 0.4;

      this.body.setSize(hitboxAncho, hitboxAlto);
      this.body.setOffset((this.width - hitboxAncho) / 2, (this.height - hitboxAlto) / 2);

      // Activamos de inmediato su animación normal de caminar como zombie y empieza a moverse
      this.play('zombie-walk-anim', true);
    });

    // CORRECCIÓN CRÍTICA: Eliminamos "this.ejecutarAtaque()" de aquí para evitar que rompa el ciclo.
  }

  ejecutarAtaque() {
    // Si está muerto, ya atacando o levantándose del suelo, bloqueamos nuevos ataques
    if (this.isAttacking || this.isDead || this.isResurrecting) return;

    this.isAttacking = true;
    this.setTint(0x550000);

    this.setTexture('zombie_attack_1');
    this.play('zombie-attack-anim', true);

    this.once('animationcomplete-zombie-attack-anim', () => {
      if (this.isDead || !this.active) return;
      this.isAttacking = false;
      this.clearTint();
      this.setTexture('zombie_walk_0');
      this.play('zombie-walk-anim', true);
    });
  }

  getClosestCivilian(civiles) {
    let closest = null;
    let minDistance = 250;

    civiles.forEach((civil) => {
      if (!civil.isInfected && civil.active && !civil.isDead) {
        const dist = this.scene.calcularDistanciaToroidal(this.x, this.y, civil.x, civil.y);

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
    const desired = this.scene.calcularVectorToroidal(this.x, this.y, target.x, target.y);

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
      const d = this.scene.calcularDistanciaToroidal(this.x, this.y, neighbor.x, neighbor.y);

      if (d > 0 && d < radius) {
        const diff = this.scene.calcularVectorToroidal(neighbor.x, neighbor.y, this.x, this.y).normalize().divide({ x: d, y: d });

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

  applyObstacleAvoidance() {
    const radioVisionObstaculos = 60;
    let steer = new Phaser.Math.Vector2(0, 0);

    if (this.velocity.lengthSq() === 0 && this.body.velocity.lengthSq() === 0) return steer;

    const velActual = this.velocity.lengthSq() > 0 ? this.velocity : this.body.velocity;
    const dir = velActual.clone().normalize();
    const anguloBase = dir.angle();

    const angulosBigotes = [0, -Math.PI / 4, Math.PI / 4];

    if (!this.scene.obstaculos) return steer;
    const obstaculos = this.scene.obstaculos.getChildren();

    for (let i = 0; i < angulosBigotes.length; i++) {
      const anguloRayo = anguloBase + angulosBigotes[i];
      const puntaRayoX = this.x + Math.cos(anguloRayo) * radioVisionObstaculos;
      const puntaRayoY = this.y + Math.sin(anguloRayo) * radioVisionObstaculos;

      let choca = false;

      for (let j = 0; j < obstaculos.length; j++) {
        if (obstaculos[j].getBounds().contains(puntaRayoX, puntaRayoY)) {
          choca = true;
          break;
        }
      }

      if (choca) {
        let multiplicador = angulosBigotes[i] <= 0 ? Math.PI / 2.5 : -Math.PI / 2.5;
        let anguloEscape = anguloRayo + multiplicador;

        const desired = new Phaser.Math.Vector2(Math.cos(anguloEscape) * this.maxSpeed, Math.sin(anguloEscape) * this.maxSpeed);

        steer = desired.subtract(velActual);

        if (steer.length() > this.maxForce * 1.5) {
          steer.normalize().scale(this.maxForce * 1.5);
        }
        break;
      }
    }

    return steer;
  }

  update(player, horda, civiles) {
    if (this.isDead || !this.active) return;

    // Si está resucitando, congelamos la física por completo y salimos de la IA
    if (this.isResurrecting) {
      this.setVelocity(0, 0);

      return;
    }

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
      const forceAvoid = this.applyObstacleAvoidance().scale(2.5);

      this.acceleration.add(forceSeek);
      this.acceleration.add(forceSeparate);
      this.acceleration.add(forceAvoid);

      this.velocity.add(this.acceleration);

      if (this.velocity.length() > this.maxSpeed) {
        this.velocity.normalize().scale(this.maxSpeed);
      }

      this.setVelocity(this.velocity.x, this.velocity.y);
      this.setRotation(this.velocity.angle());
      this.acceleration.scale(0);

      if (this.anims && this.anims.currentAnim && this.anims.currentAnim.key !== 'zombie-attack-anim') {
        this.play('zombie-walk-anim', true);
      }
    } else {
      let amenazaCercana = player;
      let distAmenaza = this.scene.calcularDistanciaToroidal(this.x, this.y, player.x, player.y);

      if (horda) {
        horda.forEach((zombie) => {
          if (!zombie.active || zombie.isDead) return;
          const dist = this.scene.calcularDistanciaToroidal(this.x, this.y, zombie.x, zombie.y);

          if (dist < distAmenaza) {
            distAmenaza = dist;
            amenazaCercana = zombie;
          }
        });
      }

      if (distAmenaza < this.panicDistance) {
        let angle = this.scene.calcularAnguloToroidal(amenazaCercana.x, amenazaCercana.y, this.x, this.y);

        const avoidForce = this.applyObstacleAvoidance();

        if (avoidForce.lengthSq() > 0) {
          angle = this.body.velocity.clone().add(avoidForce).angle();
        }
        this.scene.physics.velocityFromRotation(angle, this.escapeSpeed, this.body.velocity);
        this.setRotation(angle);
        this.play('civil-walk-anim', true);
      } else if (this.body.velocity.length() === 0) {
        const startAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);

        this.scene.physics.velocityFromRotation(startAngle, this.wanderSpeed, this.body.velocity);
        this.setRotation(startAngle);
      }
    }
  }
}
