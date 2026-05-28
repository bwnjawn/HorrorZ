import { Player } from './Player';
import { PLAYER_TYPES } from '../config/PlayerStatsConfig';

export class Coloso extends Player {
  constructor(scene, x, y) {
    super(scene, x, y, PLAYER_TYPES.COLOSO);

    this.setScale(0.75);
    this.setTint(0xff9999);
    this.isDashing = false;
  }
  recibirDaño(cantidad, tipoDaño = 'normal') {
    if (tipoDaño === 'bala') {
      cantidad = cantidad * 0.7; // Reducimos el daño un 30%
      console.log(`¡Piel blindada absorbe daño! Recibe solo: ${cantidad}`);
    }
    super.recibirDaño(cantidad, tipoDaño);
  }

  usarHabilidadEspecial() {
    if (this.isDead || this.isDashing || !this.puedeUsarHabilidad()) return;

    console.log('¡El Coloso usa EMBESTIDA!');
    this.isDashing = true;
    
    // 1. REPRODUCIR LA ANIMACIÓN DE EMBESTIDA
    this.play('coloso-dash-anim', true);

    this.scene.physics.velocityFromRotation(this.rotation, 800, this.body.velocity);

    this.scene.time.delayedCall(500, () => {
      this.isDashing = false;
      if (!this.isDead) {
        this.setTexture('zombie_walk_0'); // Regresa a la pose normal
        
      }
    });
  }

  update(time, delta) {
    if (this.isDead) return;

    if (this.isDashing) {
      return;
    }

    // Si no está embistiendo, es como zombie default.
    super.update(time, delta);
  }
}