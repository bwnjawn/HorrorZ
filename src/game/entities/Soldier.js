import Phaser from 'phaser';
import { Enemy } from './Enemy';
export class Soldier extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'soldier-walking');

    this.health = 100;
    this.maxSpeed = 120;

    // Propiedades de combate a distancia
    this.rangoVision = 350;
    this.rangoDisparo = 120;
    this.cadenciaDisparo = 800;
    this.ultimoDisparo = 0;

    this.objetivoActual = null;
  }

  buscarObjetivo(player, horda) {
    let objetivoMasCercano = null;
    let distanciaMinima = this.rangoVision;

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
  ejecutarDisparo(time) {
    if (time > this.ultimoDisparo + this.cadenciaDisparo) {
      this.play('soldier-shoot-anim', true);
      const anguloHaciaObjetivo = Phaser.Math.Angle.Between(this.x, this.y, this.objetivoActual.x, this.objetivoActual.y);
      this.scene.events.emit('disparo-enemigo', { x: this.x, y: this.y, angulo: anguloHaciaObjetivo });
      this.ultimoDisparo = time;

      this.scene.time.delayedCall(200, () => {
        if (!this.isDead && this.estado !== 'ATACANDO') {
          this.play('soldier-walk-anim', true);
        }
      });
    }
  }
  update(time, delta, player, horda) {
    if (this.isDead) return;
    let teniaObjetivo = this.objetivoActual !== null;
    this.buscarObjetivo(player, horda);

    if (teniaObjetivo && !this.objetivoActual) {
      this.calcularNuevoPuntoPatrulla(player);
    }
    if (this.objetivoActual) {
      const distanciaAlObjetivo = Phaser.Math.Distance.Between(this.x, this.y, this.objetivoActual.x, this.objetivoActual.y);

      if (distanciaAlObjetivo <= this.rangoDisparo) {
        this.estado = 'ATACANDO';
        this.setVelocity(0, 0);

        this.setRotation(Phaser.Math.Angle.Between(this.x, this.y, this.objetivoActual.x, this.objetivoActual.y) + Math.PI / 2);
        this.ejecutarDisparo(time);
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
