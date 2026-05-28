import Phaser from 'phaser';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, statsConfig) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(statsConfig.scale);
    this.colorOriginal = statsConfig.colorTint;
    this.setTint(statsConfig.colorTint); //Esto se saca cuando cambiemos lo sprites

    this.setCollideWorldBounds(true); //Hay q desactivar esto cuando agrandemos el mapa
    this.setLighting(true);

    // Propiedades de estado
    this.health = statsConfig.hp;
    this.maxHealth = statsConfig.hp;
    this.estado = 'PATRULLANDO';
    this.isDead = false;
    this.healReward = statsConfig.healReward;

    // Propiedades de movimiento
    this.maxSpeed = statsConfig.speed;
    this.maxForce = 10;
    this.acceleration = new Phaser.Math.Vector2(0, 0);
    this.velocity = new Phaser.Math.Vector2(0, 0);

    // Propiedades de patrulla
    this.puntoObjetivo = new Phaser.Math.Vector2(x, y);
    this.tiempoAtascado = 0;

    this.healthBar = scene.add.graphics();
    this.healthBar.setDepth(10); // Sobre los sprites, pero debajo de los números
    this.healthBarAlpha = 0; // 0 = Invisible por defecto
    this.healthBarTimer = null;

    // Si tiene más de 300 de vida (Jefes/Tanques), la barra siempre se ve
    this.alwaysShowHealth = this.maxHealth >= 300;
    if (this.alwaysShowHealth) this.healthBarAlpha = 1;
  }

  mostrarNumeroDaño(cantidad, tipoDaño) {
    const isCrit = cantidad >= 50;
    const colorTexto = tipoDaño === 'veneno' ? '#00ff00' : isCrit ? '#ffaa00' : '#ffffff';
    const sizeTexto = isCrit ? '22px' : '14px';

    const textoDaño = this.scene.add
      .text(this.x, this.y - 20, `-${cantidad}`, {
        fontSize: sizeTexto,
        color: colorTexto,
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(15);

    this.scene.tweens.add({
      targets: textoDaño,
      y: this.y - 60,
      alpha: 0,
      duration: 800,
      ease: 'Power1',
      onComplete: () => {
        textoDaño.destroy();
      },
    });
  }

  dibujarBarraVida() {
    if (!this.healthBar) return;
    this.healthBar.clear();

    if (this.isDead || (this.healthBarAlpha <= 0 && !this.alwaysShowHealth)) return;

    const anchoBarra = 40;
    const altoBarra = 6;

    // Sincronizamos la posición del objeto gráfico entero con el enemigo
    const offsetY = -(this.height * this.scaleY) / 2 - 15;

    this.healthBar.setPosition(this.x, this.y + offsetY);

    this.healthBar.fillStyle(0x000000, this.healthBarAlpha);
    this.healthBar.fillRect(-anchoBarra / 2, 0, anchoBarra, altoBarra);

    const porcentaje = Math.max(0, this.health / this.maxHealth);

    let colorVida = 0x00ff00; // Verde

    if (porcentaje <= 0.5) colorVida = 0xffff00; // Amarillo
    if (porcentaje <= 0.25) colorVida = 0xff0000; // Rojo

    // Vida actual (dibujada desde 0,0 relativo a la nueva posición)
    this.healthBar.fillStyle(colorVida, this.healthBarAlpha);
    this.healthBar.fillRect(-anchoBarra / 2 + 1, 1, (anchoBarra - 2) * porcentaje, altoBarra - 2);
  }

  recibirDaño(cantidad, tipoDaño = 'normal') {
    if (this.isDead || (this.esInvulnerable && tipoDaño !== 'veneno')) return;

    if (this.isDead || this.esInvulnerable) return;
    this.health -= cantidad;
    this.esInvulnerable = true;
    this.mostrarNumeroDaño(cantidad, tipoDaño);

    this.healthBarAlpha = 1;
    this.dibujarBarraVida();

    if (!this.alwaysShowHealth) {
      if (this.healthBarTimer) this.healthBarTimer.remove();

      this.healthBarTimer = this.scene.time.delayedCall(2000, () => {
        // Tween para que la barra se apague suavemente en lugar de desaparecer de golpe
        this.scene.tweens.add({
          targets: this,
          healthBarAlpha: 0,
          duration: 300,
          onUpdate: () => this.dibujarBarraVida(),
        });
      });
    }

    if (tipoDaño !== 'veneno') {
      this.scene.time.delayedCall(200, () => {
        this.esInvulnerable = false;
      });
    } else {
      this.esInvulnerable = false; // El veneno hace daño constante
    }
    this.setTint(tipoDaño === 'veneno' ? 0x00ff00 : 0xffffff);

    this.scene.time.delayedCall(1300, () => {
      if (!this.isDead) {
        this.clearTint();
        this.setTint(this.colorOriginal);
      }
    });

    this.scene.time.delayedCall(1500, () => {
      this.esInvulnerable = false;
    });

    if (this.health <= 0) {
      this.morirEInfectarse();
    }
  }
  morirEInfectarse() {
    this.isDead = true;
    this.setVelocity(0, 0);

    this.scene.events.emit('enemigo-muerto', { x: this.x, y: this.y, healReward: this.healReward });
    this.desactivar();
  }
  //desactivar porque destruir era muy pesado.
  desactivar() {
    this.setActive(false);
    this.setVisible(false);
    this.body.enable = false;

    if (this.healthBar) {
      this.healthBar.clear();
      this.healthBar.setPosition(0, 0);
    }
  }

  respawnBase(x, y, statsConfig) {
    this.setActive(true);
    this.setVisible(true);
    this.body.enable = true;
    this.setPosition(x, y);

    this.isDead = false;
    this.esInvulnerable = false;
    this.estado = 'PATRULLANDO';
    this.velocity.set(0, 0);
    this.acceleration.set(0, 0);

    this.colorOriginal = statsConfig.colorTint;
    this.healReward = statsConfig.healReward;
    this.health = statsConfig.hp;
    this.maxHealth = statsConfig.hp;
    this.maxSpeed = statsConfig.speed;

    this.alwaysShowHealth = this.maxHealth >= 300;
    this.healthBarAlpha = this.alwaysShowHealth ? 1 : 0;
    if (this.healthBar) this.healthBar.clear();

    this.setScale(statsConfig.scale);
    this.setTint(this.colorOriginal);
  }

  calcularNuevoPuntoPatrulla(player) {
    let puntoValido = false;
    let intentos = 0;
    let maxIntentos = 10;

    while (!puntoValido && intentos < maxIntentos) {
      const angulo = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const distancia = Phaser.Math.Between(140, 400);

      const posibleX = player.x + Math.cos(angulo) * distancia;
      const posibleY = player.y + Math.sin(angulo) * distancia;
      let chocaConObstaculo = false;

      // Verificamos si el punto generado está dentro de una zona de obstáculo
      if (this.scene.obstaculos) {
        const obstaculos = this.scene.obstaculos.getChildren();

        for (let i = 0; i < obstaculos.length; i++) {
          if (obstaculos[i].getBounds().contains(posibleX, posibleY)) {
            chocaConObstaculo = true;
            break;
          }
        }
      }

      if (!chocaConObstaculo) {
        this.puntoObjetivo.x = posibleX;
        this.puntoObjetivo.y = posibleY;
        puntoValido = true;
      }

      intentos++;
    }
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

    //Fuerza de correccion
    const steer = desired.subtract(this.velocity);

    if (steer.length() > this.maxForce) steer.normalize().scale(this.maxForce);

    return steer;
  }
  applyFlee(target) {
    const desired = new Phaser.Math.Vector2(this.x, this.y).subtract(new Phaser.Math.Vector2(target.x, target.y));

    desired.normalize().scale(this.maxSpeed);

    const steer = desired.subtract(this.velocity);

    if (steer.length() > this.maxForce) steer.normalize().scale(this.maxForce);

    return steer;
  }
  //optimizacion del sistema de giro en obstaculos
  applyObstacleAvoidance() {
    const radioVisionObstaculos = 60;
    let steer = new Phaser.Math.Vector2(0, 0);

    // Si el enemigo está quieto, no calculamos evasión
    if (this.velocity.lengthSq() === 0) return steer;

    const dir = this.velocity.clone().normalize();
    const anguloBase = dir.angle();

    // Creamos 3 bigotes invisibles: Frente (0°), Izquierda (-45°), Derecha (+45°)
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
        // Fuerza de repulsión: Si choca de frente o izquierda, gira a la derecha (+90°). Si choca a la derecha, gira a la izquierda (-90°).
        let multiplicador = angulosBigotes[i] <= 0 ? Math.PI / 2.5 : -Math.PI / 2.5;
        let anguloEscape = anguloRayo + multiplicador;

        // Empujamos en esa nueva dirección de escape
        const desired = new Phaser.Math.Vector2(Math.cos(anguloEscape) * this.maxSpeed, Math.sin(anguloEscape) * this.maxSpeed);

        steer = desired.subtract(this.velocity);

        // Al esquivar paredes le damos un poco más de fuerza de giro que a caminar normal
        if (steer.length() > this.maxForce * 1.5) {
          steer.normalize().scale(this.maxForce * 1.5);
        }

        break; // Reaccionamos al primer bigote que detecte choque para no volvernos locos
      }
    }

    return steer;
  }
  preUpdate(time, delta) {
    super.preUpdate(time, delta); // VITAL: Mantiene las animaciones y físicas funcionando

    // Sincronización obligatoria de la barra de vida en cada frame
    if (this.healthBarAlpha > 0 || this.alwaysShowHealth) {
      this.dibujarBarraVida();
    } else if (this.healthBar) {
      this.healthBar.clear();
    }
  }
  updateBase(time, delta, player) {
    if (this.isDead) return;
    this.acceleration.set(0, 0);

    if (!this.body.blocked.none) {
      this.tiempoAtascado += delta;

      if (this.tiempoAtascado >= 1000) {
        this.calcularNuevoPuntoPatrulla(player);
        this.tiempoAtascado = 0;
      }
    } else {
      this.tiempoAtascado = 0;
    }
    const distAlObjetivo = Phaser.Math.Distance.Between(this.x, this.y, this.puntoObjetivo.x, this.puntoObjetivo.y);

    if (distAlObjetivo < 50) {
      this.calcularNuevoPuntoPatrulla(player);
    }
    const forceSeek = this.applySeek(this.puntoObjetivo);
    const forceAvoid = this.applyObstacleAvoidance().scale(2.5); // 2.5 de peso para que no ignore la pared por perseguirte

    this.acceleration.add(forceSeek);
    this.acceleration.add(forceAvoid);
    this.velocity.add(this.acceleration);

    if (this.velocity.length() > this.maxSpeed) {
      this.velocity.normalize().scale(this.maxSpeed);
    }
    this.setVelocity(this.velocity.x, this.velocity.y);
    this.setRotation(this.velocity.angle());
  }
}
