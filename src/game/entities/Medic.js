import Phaser from 'phaser';
import { Enemy } from './Enemy';

export class Medic extends Enemy {
  constructor(scene, x, y, typeConfig) {
    super(scene, x, y, typeConfig.texture, typeConfig);

    this.rangoVision = typeConfig.visionRange;
    this.rangoCuracion = typeConfig.attackRange;
    this.potenciaCuracion = Math.abs(typeConfig.damage);
    this.cadenciaCuracion = typeConfig.fireRate;

    this.ultimaCuracion = 0;
    this.aliadoHerido = null;
  }
  buscarAliadoHerido(militaresGroup) {
    let aliadoMasNecesitado = null;
    let distanciaMinima = this.rangoVision;

    if (!militaresGroup) return;

    militaresGroup.getChildren().forEach((soldado) => {
      if (soldado === this || soldado.isDead || soldado.health >= soldado.maxHealth) return;

      const distancia = Phaser.Math.Distance.Between(this.x, this.y, soldado.x, soldado.y);

      if (distancia < distanciaMinima) {
        distanciaMinima = distancia;
        aliadoMasNecesitado = soldado;
      }
    });

    this.aliadoHerido = aliadoMasNecesitado;
  }

  curarAliado(time) {
    if (time > this.ultimaCuracion + this.cadenciaCuracion) {
      this.play('soldier-shoot-anim', true); // Animación temporal de curar

      this.aliadoHerido.health += this.potenciaCuracion;

      if (this.aliadoHerido.health > this.aliadoHerido.maxHealth) {
        this.aliadoHerido.health = this.aliadoHerido.maxHealth;
      }

      this.aliadoHerido.setTint(0x00ff00); // Feedback visual del aliado curado
      this.scene.time.delayedCall(150, () => {
        if (!this.aliadoHerido.isDead) this.aliadoHerido.setTint(this.aliadoHerido.colorOriginal);
      });

      this.ultimaCuracion = time;
    }
  }

  update(time, delta, player) {
    if (this.isDead) return;

    this.buscarAliadoHerido(this.scene.enemiesGroup);

    if (this.aliadoHerido) {
      const distancia = Phaser.Math.Distance.Between(this.x, this.y, this.aliadoHerido.x, this.aliadoHerido.y);

      this.setRotation(Phaser.Math.Angle.Between(this.x, this.y, this.aliadoHerido.x, this.aliadoHerido.y) + Math.PI / 2);

      if (distancia <= this.rangoCuracion) {
        this.setVelocity(0, 0);
        this.curarAliado(time);
      } else {
        this.play('soldier-walk-anim', true);
        this.puntoObjetivo.x = this.aliadoHerido.x;
        this.puntoObjetivo.y = this.aliadoHerido.y;
        super.updateBase(time, delta, player);
      }
    } else {
      this.play('soldier-walk-anim', true);
      super.updateBase(time, delta, player);
    }
  }
}
