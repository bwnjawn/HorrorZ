import Phaser from 'phaser';
import { Enemy } from './Enemy';

export class Soldier extends Enemy {
  constructor(scene, x, y, typeConfig) {
    super(scene, x, y, typeConfig.texture, typeConfig);
    this.setLighting(true);

    // 1. ASIGNACIÓN DE ESTADÍSTICAS DINÁMICAS
    this.role = typeConfig.type;
    this.rangoVision = typeConfig.visionRange;
    this.rangoDisparo = typeConfig.attackRange;
    this.rangoRetirada = typeConfig.retreatRange;
    this.cadenciaDisparo = typeConfig.fireRate;
    this.dañoBala = typeConfig.damage;
    this.maxHealth = typeConfig.hp;

    this.ultimoDisparo = 0;
    this.objetivoActual = null;
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
      if (this.role === 'RANGED') {
        this.play('soldier-shoot-anim', true);
        const anguloHaciaObjetivo = Phaser.Math.Angle.Between(this.x, this.y, this.objetivoActual.x, this.objetivoActual.y);
        this.scene.events.emit('disparo-enemigo', { x: this.x, y: this.y, angulo: anguloHaciaObjetivo, daño: this.dañoBala });
      } else if (this.role === 'MELEE') {
        this.play('soldier-shoot-anim', true);
        if (this.objetivoActual.recibirDaño) {
          this.objetivoActual.recibirDaño(this.dañoBala);
        } else if (this.objetivoActual === this.scene.player) {
          this.scene.store.takeDamage(this.dañoBala);
        }
      } else if (this.role === 'KAMIKAZE') {
        this.ejecutarExplosion();
        return;
      }
      this.ultimoDisparo = time;

      this.scene.time.delayedCall(200, () => {
        if (!this.isDead && this.estado !== 'ATACANDO') {
          this.play('soldier-walk-anim', true);
        }
      });
    }
  }

  ejecutarExplosion() {
    this.isDead = true;
    this.play('soldier-shoot-anim', true); // Sprite temporal

    // Emitir un evento especial de explosión para que MainScene cree efectos visuales
    this.scene.events.emit('explosion-kamikaze', { x: this.x, y: this.y, daño: this.dañoBala });
    this.destroy();
  }

  update(time, delta, player, horda) {
    if (this.isDead) return;
    let teniaObjetivo = this.objetivoActual !== null;
    this.buscarObjetivo(player, horda);

    if (teniaObjetivo && !this.objetivoActual) {
      this.calcularNuevoPuntoPatrulla(player);
    }
    if (this.objetivoActual) {
      const distancia = Phaser.Math.Distance.Between(this.x, this.y, this.objetivoActual.x, this.objetivoActual.y);
      const anguloHaciaObjetivo = Phaser.Math.Angle.Between(this.x, this.y, this.objetivoActual.x, this.objetivoActual.y);
      this.setRotation(anguloHaciaObjetivo + Math.PI / 2);

      if (distancia <= this.rangoDisparo) {
        if (this.rangoRetirada > 0 && distancia < this.rangoRetirada) {
          this.estado = 'RETIRADA';
          this.play('soldier-walk-anim', true);

          this.acceleration.set(0, 0);
          const forceFlee = this.applyFlee(this.objetivoActual);
          this.acceleration.add(forceFlee);
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
        this.play('soldier-walk-anim', true);

        this.puntoObjetivo.x = this.objetivoActual.x;
        this.puntoObjetivo.y = this.objetivoActual.y;
        super.updateBase(time, delta, player);
      }
    } else {
      this.estado = 'PATRULLANDO';
      this.play('soldier-walk-anim', true);
      super.updateBase(time, delta, player);
    }
  }
}
