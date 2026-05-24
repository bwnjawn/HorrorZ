import { Player } from './Player';
import { PLAYER_TYPES } from '../config/PlayerStatsConfig';

export class Coloso extends Player {
  constructor(scene, x, y) {
    super(scene, x, y, PLAYER_TYPES.COLOSO);

    this.setScale(0.15);
    this.setTint(0xff9999);
  }

  usarHabilidadEspecial() {
    if (this.isDead) return;

    console.log('¡El Coloso usa EMBESTIDA!');

    this.setTint(0xff0000);
    this.scene.time.delayedCall(300, () => {
      if (!this.isDead) this.setTint(0xff9999);
    });
  }
}
