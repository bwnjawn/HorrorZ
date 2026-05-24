import { Player } from './Player';
import { PLAYER_TYPES } from '../config/PlayerStatsConfig';

export class Lamento extends Player {
  constructor(scene, x, y) {
    super(scene, x, y, PLAYER_TYPES.LAMENTO);

    this.setScale(0.12);
    this.setTint(0x99ff99);
  }

  usarHabilidadEspecial() {
    if (this.isDead) return;

    console.log('¡El Lamento escupe CHARCO DE ÁCIDO!');

    this.setTint(0x00ff00);
    this.scene.time.delayedCall(300, () => {
      if (!this.isDead) this.setTint(0x99ff99);
    });
  }
}
