import { Player } from './Player';
import { PLAYER_TYPES } from '../config/PlayerStatsConfig';

export class Invocador extends Player {
  constructor(scene, x, y) {
    super(scene, x, y, PLAYER_TYPES.INVOCADOR);

    this.setScale(0.1);
    this.setTint(0xcc66ff);
  }

  usarHabilidadEspecial() {
    if (this.isDead) return;

    console.log('¡El Invocador usa GRITO FRENÉTICO!');

    this.setTint(0xff00ff);
    this.scene.time.delayedCall(300, () => {
      if (!this.isDead) this.setTint(0xcc66ff);
    });
  }
}
