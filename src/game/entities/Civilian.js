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

    this.setCollideWorldBounds(true);
    this.setBounce(1, 1);
    this.play('civil-walk-anim');

    // Variables de estado
    this.isInfected = false;
    this.panicDistance = 250;
    this.escapeSpeed = 150;
    this.wanderSpeed = 50;

    // Propiedades de Enjambre
    this.maxSpeed = 280;
    this.maxForce = 15;
    this.acceleration = new Phaser.Math.Vector2(0, 0);
    this.velocity = new Phaser.Math.Vector2(0, 0);
    this.estadoHorda = 'LIBRE';
    this.isAttacking = false;
    scene.events.on('comandante-reagrupar', () => {
      if (this.isInfected) this.estadoHorda = 'REAGRUPANDO';
    });
    scene.events.on('comandante-libre', () => {
      if (this.isInfected) this.estadoHorda = 'LIBRE';
    });
  }

  infectar() {
    if (this.isInfected) return;
    this.isInfected = true;
    this.ejecutarAtaque();
  }

  // 3. Crea esta NUEVA función debajo de infectar():
  ejecutarAtaque() {
    if (this.isAttacking) return;

    this.isAttacking = true;
    this.setTint(0x550000);
    this.play('zombie-attack-anim', true); // Reproduce la animación de mordida
    // Cuando la animación termine, vuelve a caminar
    this.once('animationcomplete-zombie-attack-anim', () => {
      this.isAttacking = false;
      this.play('zombie-walk-anim', true);
    });
  }

  getClosestCivilian(civiles) {
    let closest = null;
    let minDistance = 250; // Radio masivo: si hay un humano en el mapa, lo verán

    civiles.forEach((civil) => {
      if (!civil.isInfected) {
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
    const desired = new Phaser.Math.Vector2(target.x, target.y).subtract(new Phaser.Math.Vector2(this.x, this.y));

    // Si estamos cerca, bajamos la velocidad para no orbitar locamente
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

  // Fuerza de Separación: Evita que los zombies se solapen
  applySeparate(horda) {
    const radius = 50; // Radio de "espacio personal"
    let steer = new Phaser.Math.Vector2(0, 0);
    let count = 0;

    horda.forEach((neighbor) => {
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
            target = presaCercana; // CORRECCIÓN CLAVE: El objetivo ahora es el civil
            pesoAtraccion = 1.8;
            pesoSeparacion = 1.0;
          }
        }
      }
      // Sumar fuerzas
      const forceSeek = this.applySeek(target).scale(pesoAtraccion); // Peso de atracción
      const forceSeparate = this.applySeparate(horda).scale(pesoSeparacion); // Peso de separación (más fuerte)

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

      this.play('zombie-walk-anim', true);
    } else {
      // Lógica de escape de los civiles
      let amenazaCercana = player;
      let distAmenaza = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
      if (horda) {
        horda.forEach((zombie) => {
          const dist = Phaser.Math.Distance.Between(this.x, this.y, zombie.x, zombie.y);
          if (dist < distAmenaza) {
            distAmenaza = dist;
            amenazaCercana = zombie; // Cambia el origen de su miedo al zombie
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
