import Phaser from 'phaser';
import { Enemy } from './Enemy';

export class Kamikaze extends Enemy {
  constructor(scene, x, y, typeConfig) {
    super(scene, x, y, typeConfig.texture, typeConfig);

    this.rangoExplosion = 80;
    this.rangoActivacion = 100;
    this.dañoExplosion = typeConfig.damage || 50;
    // Variables de la fase de detonación
    this.isExploding = false;
    this.fuseTime = 2000;
    this.textoTimer = null;
  }

  respawnBase(x, y, typeConfig) {
    super.respawnBase(x, y, typeConfig);

    // Reiniciamos sus estados explosivos
    this.isExploding = false;
    this.clearTint();

    if (this.textoTimer) {
      this.textoTimer.destroy();
      this.textoTimer = null;
    }

    if (this.parpadeoEvento) {
      this.parpadeoEvento.remove();
      this.parpadeoEvento = null;
    }
  }

  iniciarDetonacion() {
    this.isExploding = true;

    // Efecto visual: parpadeo rápido rojo y blanco
    this.parpadeoEvento = this.scene.time.addEvent({
      delay: 200, // Parpadea cada 200ms
      callback: () => {
        if (this.isTinted) {
          this.clearTint();
        } else {
          this.setTint(0xff0000);
        }
      },
      loop: true,
    });

    // Texto visual del Timer sobre el zombie
    let cuentaAtras = 3;

    this.textoTimer = this.scene.add
      .text(this.x, this.y - 40, cuentaAtras.toString(), {
        fontSize: '20px',
        color: '#ff0000',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    this.scene.time.addEvent({
      delay: this.fuseTime / 3,
      repeat: 2,
      callback: () => {
        cuentaAtras--;

        if (this.textoTimer && this.textoTimer.active) {
          this.textoTimer.setText(cuentaAtras > 0 ? cuentaAtras.toString() : 'BOOM!');
        }
      },
    });

    this.scene.time.delayedCall(this.fuseTime, () => {
      if (this.parpadeoEvento) this.parpadeoEvento.remove();
      if (this.textoTimer) this.textoTimer.destroy();

      if (!this.isDead) {
        this.scene.events.emit('explosion-kamikaze', {
          x: this.x,
          y: this.y,
          daño: this.dañoExplosion,
          rango: 150,
        });
        this.scene.events.emit('visual-custom-explosion', {
          x: this.x,
          y: this.y,
          scale: 2.8,
        });

        // El Kamikaze muere tras explotar
        this.morirEInfectarse();
      }
    });
  }
  morirEInfectarse() {
    if (this.textoTimer) {
      this.textoTimer.destroy();
      this.textoTimer = null; // Lo limpiamos de la memoria
    }

    if (this.parpadeoEvento) {
      this.parpadeoEvento.remove();
      this.parpadeoEvento = null;
    }
    super.morirEInfectarse();
  }

  update(time, delta, player) {
    if (this.isDead) {
      if (this.textoTimer && this.textoTimer.active) this.textoTimer.destroy();

      return;
    }

    this.play('kamikaze-walk-anim', true);
    this.puntoObjetivo.x = player.x;
    this.puntoObjetivo.y = player.y;
    super.updateBase(time, delta, player);

    if (this.textoTimer && this.textoTimer.active) {
      this.textoTimer.setPosition(this.x, this.y - 40);
    }

    if (!this.isExploding) {
      const distAlJugador = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

      if (distAlJugador <= this.rangoActivacion) {
        this.iniciarDetonacion();
      }
    }
  }
}
