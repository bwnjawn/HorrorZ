import { Player } from './Player';
import { PLAYER_TYPES } from '../config/PlayerStatsConfig';

export class Atrofia extends Player {
  constructor(scene, x, y) {
    super(scene, x, y, PLAYER_TYPES.ATROFIA);

    this.setScale(0.09);
    this.setTint(0xaaaaff);
  }

  usarHabilidadEspecial() {
    if (this.isDead) return;

    console.log('¡La Atrofia usa SALTO DEPREDADOR!');

    this.setTint(0x0000ff);
    this.scene.time.delayedCall(300, () => {
      if (!this.isDead) this.setTint(0xaaaaff);
    });
  }
}
