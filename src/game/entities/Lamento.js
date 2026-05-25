import { Player } from './Player';
import { PLAYER_TYPES } from '../config/PlayerStatsConfig';
import Phaser from 'phaser';

export class Lamento extends Player {
  constructor(scene, x, y) {
    super(scene, x, y, PLAYER_TYPES.LAMENTO);

    this.setScale(0.12);
    this.setTint(0x99ff99);
  }

  recibirDaño(cantidad, tipoDaño = 'normal') {
    super.recibirDaño(cantidad, tipoDaño);

    if (!this.isDead) {
      this.crearNubeToxica(80, 10);
    }
  }

  morir() {
    this.crearNubeToxica(160, 40);
    super.morir();
  }

  crearNubeToxica(radio, daño) {
    // Efecto visual de la nube de gas
    let nube = this.scene.add.circle(this.x, this.y, radio, 0x00ff00, 0.4);

    this.scene.tweens.add({
      targets: nube,
      alpha: 0,
      duration: 800,
      onComplete: () => nube.destroy(),
    });

    if (this.scene.enemiesGroup) {
      this.scene.enemiesGroup.getChildren().forEach((enemigo) => {
        if (!enemigo.isDead) {
          const dist = Phaser.Math.Distance.Between(this.x, this.y, enemigo.x, enemigo.y);

          if (dist <= radio) {
            enemigo.recibirDaño(daño, 'veneno');
          }
        }
      });
    }

    if (this.scene.civiliansGroup) {
      this.scene.civiliansGroup.getChildren().forEach((civilian) => {
        if (!civilian.isDead) {
          const dist = Phaser.Math.Distance.Between(this.x, this.y, civilian.x, civilian.y);

          if (dist <= radio) {
            civilian.recibirDaño(daño, 'veneno');
          }
        }
      });
    }
  }

  usarHabilidadEspecial() {
    if (this.isDead || !this.puedeUsarHabilidad()) return;

    console.log('¡El Lamento escupe CHARCO DE ÁCIDO!');

    // Brillo temporal
    this.setTint(0x00ff00);
    this.scene.time.delayedCall(300, () => {
      if (!this.isDead) this.setTint(0x99ff99);
    });

    // 1. Obtener la posición del mouse en el mundo (considerando la cámara)
    const pointer = this.scene.input.activePointer;
    const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);

    // 2. Calcular ángulo y distancia desde Lamento hasta el mouse
    const anguloAlMouse = Phaser.Math.Angle.Between(this.x, this.y, worldPoint.x, worldPoint.y);
    let distancia = Phaser.Math.Distance.Between(this.x, this.y, worldPoint.x, worldPoint.y);

    // 3. Limitar la distancia máxima (igual que el salto)
    const distanciaMaxima = 300; // Ajusta este límite a lo que consideres balanceado

    if (distancia > distanciaMaxima) {
      distancia = distanciaMaxima;
    }

    // 4. Calcular la posición donde caerá finalmente el charco
    const charcoX = this.x + Math.cos(anguloAlMouse) * distancia;
    const charcoY = this.y + Math.sin(anguloAlMouse) * distancia;

    // Opcional: hacer que el zombi se gire hacia donde escupe el ácido
    this.setRotation(anguloAlMouse + Math.PI / 2);

    // 5. Efecto visual del charco en el suelo
    let charco = this.scene.add.circle(charcoX, charcoY, 70, 0x00aa00, 0.6);

    // 6. Daño en el tiempo (DoT) a los enemigos que pisen el charco
    let timerDaño = this.scene.time.addEvent({
      delay: 500, // Hace daño cada medio segundo
      callback: () => {
        // Dañar Militares
        if (this.scene.enemiesGroup) {
          this.scene.enemiesGroup.getChildren().forEach((enemigo) => {
            if (!enemigo.isDead) {
              const dist = Phaser.Math.Distance.Between(charcoX, charcoY, enemigo.x, enemigo.y);

              if (dist <= 70) enemigo.recibirDaño(15, 'veneno');
            }
          });
        }

        // Dañar Civiles
        if (this.scene.civiliansGroup) {
          this.scene.civiliansGroup.getChildren().forEach((civil) => {
            if (!civil.isDead && !civil.isInfected) {
              // Solo daña civiles sanos
              const dist = Phaser.Math.Distance.Between(charcoX, charcoY, civil.x, civil.y);

              if (dist <= 70) civil.recibirDaño(15, 'veneno');
            }
          });
        }
      },
      loop: true,
    });

    // 7. Limpiar y destruir el charco después de 5 segundos
    this.scene.time.delayedCall(5000, () => {
      timerDaño.remove(); // Detener el daño

      // Desvanecer visualmente antes de destruirlo
      this.scene.tweens.add({
        targets: charco,
        alpha: 0,
        duration: 500,
        onComplete: () => charco.destroy(),
      });
    });
  }
}
