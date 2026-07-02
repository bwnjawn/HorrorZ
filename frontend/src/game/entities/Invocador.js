import Phaser from 'phaser';
import { Player } from './Player';
import { PLAYER_TYPES } from '../config/PlayerStatsConfig';

export class Invocador extends Player {
  constructor(scene, x, y) {
    super(scene, x, y, PLAYER_TYPES.INVOCADOR);

    this.setScale(0.45);
    this.setTint(0xcc66ff);
    this.civilesExpuestos = new Map();
  }

  usarHabilidadEspecial() {
    // Verificamos isAttacking para que no grite mientras da un golpe básico
    if (this.isDead || this.isAttacking || !this.puedeUsarHabilidad()) return;

    // ==========================================
    // REPRODUCIR ANIMACIÓN DE GRITO
    // ==========================================
    this.isAttacking = true;
    this.setVelocity(0, 0); // Se detiene para gritar
    this.play('invocador-scream-anim', true);

    this.once('animationcomplete-invocador-scream-anim', () => {
      this.isAttacking = false;
      if (!this.isDead) this.setTexture('zombie_walk_0');
    });
    // ==========================================

    const radioGrito = 250;

    let auraVisual = this.scene.add.circle(this.x, this.y, 50, 0xff00ff, 0.4);

    this.scene.tweens.add({
      targets: auraVisual,
      radius: radioGrito,
      alpha: 0,
      duration: 500,
      onComplete: () => auraVisual.destroy(), // Se borra al terminar
    });

    // 2. Iterar sobre todos los zombis de la horda en el mapa
    this.scene.hordeGroup.getChildren().forEach((zombi) => {
      if (!zombi.isDead && Phaser.Math.Distance.Between(this.x, this.y, zombi.x, zombi.y) <= radioGrito) {
        if (zombi.isFrenzied) return;

        zombi.isFrenzied = true;
        zombi.setTint(0xff00ff);

        if (!zombi.originalSpeed) zombi.originalSpeed = zombi.maxSpeed || 100;
        if (!zombi.originalDamage) zombi.originalDamage = zombi.baseDamage || 10;

        zombi.maxSpeed = zombi.originalSpeed * 1.5;
        zombi.baseDamage = zombi.originalDamage * 3;

        this.scene.time.delayedCall(5000, () => {
          if (!zombi.active) return; // Por si el zombi murió durante esos 5 segundos

          zombi.isFrenzied = false;
          zombi.maxSpeed = zombi.originalSpeed;
          zombi.baseDamage = zombi.originalDamage;
          // Corregido: para no quitar el tinte base del Invocador por error al limpiar a la horda
          zombi.clearTint();
        });
      }
    });
  }
  update(time, delta) {
    if (this.isDead) return;

    super.update(time, delta);

    const radioAura = 100;
    const tiempoParaInfectar = 1000;

    this.scene.civiliansGroup.getChildren().forEach((civil) => {
      if (civil.isInfected || civil.isDying) return;

      const dist = Phaser.Math.Distance.Between(this.x, this.y, civil.x, civil.y);

      if (dist <= radioAura) {
        let tiempoExpuesto = this.civilesExpuestos.get(civil) || 0;

        tiempoExpuesto += delta;
        this.civilesExpuestos.set(civil, tiempoExpuesto);

        civil.setTint(0xccffcc);

        if (tiempoExpuesto >= tiempoParaInfectar) {
          civil.isDying = true;
          civil.setVelocity(0, 0);

          this.scene.time.delayedCall(600, () => {
            civil.infectar();
            this.scene.civiliansGroup.remove(civil);
            this.scene.hordeGroup.add(civil);

            if (this.onInfectarCivil) this.onInfectarCivil();

            if (this.curar) this.curar(15);
            this.scene.store.healPlayer(15);
          });

          this.civilesExpuestos.delete(civil);
        }
      } else {
        if (this.civilesExpuestos.has(civil)) {
          this.civilesExpuestos.delete(civil);
          civil.clearTint(); // Vuelve a su color normal
        }
      }
    });
  }
}
