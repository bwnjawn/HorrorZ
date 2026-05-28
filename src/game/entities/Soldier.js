import Phaser from 'phaser';
import { Enemy } from './Enemy';

export class Soldier extends Enemy {
  constructor(scene, x, y, typeConfig) {
    super(scene, x, y, typeConfig.texture, typeConfig);
    this.setLighting(true);

    this.setScale(0.1);

    const hitboxAncho = this.width * 0.4;
    const hitboxAlto = this.height * 0.4;

    this.body.setSize(hitboxAncho, hitboxAlto);

    // ASIGNACIÓN DE ESTADÍSTICAS DINÁMICAS
    this.role = typeConfig.type;
    this.rangoVision = typeConfig.visionRange;
    this.rangoDisparo = typeConfig.attackRange;
    this.rangoRetirada = typeConfig.retreatRange;
    this.cadenciaDisparo = typeConfig.fireRate;
    this.dañoBala = typeConfig.damage;
    this.maxHealth = typeConfig.hp;

    this.ultimoDisparo = 0;
    this.objetivoActual = null;

    // Reproducir animación inactiva/movimiento inicial según el rol
    this.gestionarAnimacionCaminar();
  }

  respawn(x, y, typeConfig) {
    super.respawnBase(x, y, typeConfig);

    this.role = typeConfig.type;
    this.rangoVision = typeConfig.visionRange;
    this.rangoDisparo = typeConfig.attackRange;
    this.rangoRetirada = typeConfig.retreatRange;
    this.cadenciaDisparo = typeConfig.fireRate;
    this.dañoBala = typeConfig.damage;
    this.maxHealth = typeConfig.hp;

    this.ultimoDisparo = 0;
    this.objetivoActual = null;

    const hitboxAncho = this.width * 0.4;
    const hitboxAlto = this.height * 0.4;

    this.body.setSize(hitboxAncho, hitboxAlto);
    this.gestionarAnimacionCaminar();
  }

  buscarObjetivo(player, horda) {
    let objetivoMasCercano = null;
    let distanciaMinima = this.rangoVision;

    if (this.role === 'KAMIKAZE') {
      const distJugador = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

      if (player.active && !player.isDead && distJugador < distanciaMinima) {
        this.objetivoActual = player;
      }

      return;
    }

    // Revisar distancia con el jugador
    const distJugador = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

    if (player.active && !player.isDead && distJugador < distanciaMinima) {
      distanciaMinima = distJugador;
      objetivoMasCercano = player;
    }

    // Revisar distancia con la horda
    if (horda) {
      horda.forEach((zombie) => {
        if (!zombie.active || zombie.isDead) return;
        const distZombie = Phaser.Math.Distance.Between(this.x, this.y, zombie.x, zombie.y);

        if (distZombie < distanciaMinima) {
          distanciaMinima = distZombie;
          objetivoMasCercano = zombie;
        }
      });
    }
    this.objetivoActual = objetivoMasCercano;
  }

  ejecutarAccionCombate(time) {
    if (time > this.ultimoDisparo + this.cadenciaDisparo) {
      // Lógica de ataque separada por roles
      if (this.role === 'RANGED') {
        this.play('soldier-shoot-anim', true);
        const anguloHaciaObjetivo = Phaser.Math.Angle.Between(this.x, this.y, this.objetivoActual.x, this.objetivoActual.y);

        this.scene.events.emit('disparo-enemigo', { x: this.x, y: this.y, angulo: anguloHaciaObjetivo, daño: this.dañoBala });
      } else if (this.role === 'MELEE') {
        // Reproducir la nueva animación del cuchillo
        this.play('melee-attack', true);

        if (this.objetivoActual.recibirDaño) {
          this.objetivoActual.recibirDaño(this.dañoBala);
        } else if (this.objetivoActual === this.scene.player) {
          this.scene.store.takeDamage(this.dañoBala);
        }
      } else if (this.role === 'KAMIKAZE') {
        this.play('kamikaze-walk-anim', true);
      } else {
        // Lógica de soldado estándar
        if (this.anims.currentAnim?.key !== 'soldier-shoot-anim') {
          this.play('soldier-walk-anim', true);
        }
      }

      this.ultimoDisparo = time;

      // Volver a la animación de caminar tras un breve retraso
      this.scene.time.delayedCall(300, () => {
        if (!this.isDead && this.estado !== 'ATACANDO') {
          this.gestionarAnimacionCaminar();
        }
      });
    }
  }

  ejecutarExplosion() {
    this.isDead = true;

    // CAMBIO: Aquí reproducimos la animación específica de explosión/ataque
    // Asegúrate de que este nombre coincida con el anims.create en MainScene
    this.play('kamikaze-explosion-anim', true);

    // Emitir el evento para MainScene
    this.scene.events.emit('explosion-kamikaze', {
      x: this.x,
      y: this.y,
      daño: this.dañoBala,
    });

    // Desactivamos al enemigo después de un breve momento para que se vea la animación
    this.scene.time.delayedCall(500, () => {
      this.desactivar();
    });
  }

  update(time, delta, player, horda) {
    if (this.isDead) return;

    if (this.body) {
      const centroX = this.width / 2;
      const centroY = this.height / 2;
      const mitadAncho = this.body.width / this.scaleX / 2;
      const mitadAlto = this.body.height / this.scaleY / 2;

      this.body.setOffset(centroX - mitadAncho, centroY - mitadAlto);
    }
    let teniaObjetivo = this.objetivoActual !== null;

    this.buscarObjetivo(player, horda);

    if (teniaObjetivo && !this.objetivoActual) {
      this.calcularNuevoPuntoPatrulla(player);
    }

    if (this.objetivoActual) {
      const distancia = Phaser.Math.Distance.Between(this.x, this.y, this.objetivoActual.x, this.objetivoActual.y);
      const anguloHaciaObjetivo = Phaser.Math.Angle.Between(this.x, this.y, this.objetivoActual.x, this.objetivoActual.y);

      // CORRECCIÓN DE ROTACIÓN: Sin + Math.PI/2 para que miren de frente
      this.setRotation(anguloHaciaObjetivo);

      if (distancia <= this.rangoDisparo) {
        if (this.rangoRetirada > 0 && distancia < this.rangoRetirada) {
          this.estado = 'RETIRADA';
          this.gestionarAnimacionCaminar(true);

          this.acceleration.set(0, 0);
          const forceFlee = this.applyFlee(this.objetivoActual);
          const forceAvoid = this.applyObstacleAvoidance().scale(2.5);

          this.acceleration.add(forceFlee);
          this.acceleration.add(forceAvoid);
          this.velocity.add(this.acceleration);

          if (this.velocity.length() > this.maxSpeed) this.velocity.normalize().scale(this.maxSpeed);
          this.setVelocity(this.velocity.x, this.velocity.y);
        } else {
          this.estado = 'ATACANDO';
          this.setVelocity(0, 0);
        }
        this.ejecutarAccionCombate(time);
      } else {
        this.estado = 'PERSIGUIENDO';
        this.gestionarAnimacionCaminar();

        this.puntoObjetivo.x = this.objetivoActual.x;
        this.puntoObjetivo.y = this.objetivoActual.y;
        super.updateBase(time, delta, player);
      }
    } else {
      this.estado = 'PATRULLANDO';
      this.gestionarAnimacionCaminar();
      super.updateBase(time, delta, player);
    }
  }

  gestionarAnimacionCaminar(forzar = false) {
    if (this.role === 'MELEE') {
      if (forzar || this.anims.currentAnim?.key !== 'melee-attack') {
        this.play('melee-move', true);
      }
    } else {
      if (forzar || this.anims.currentAnim?.key !== 'soldier-shoot-anim') {
        this.play('soldier-walk-anim', true);
      }
    }
  }
}
