import { Player } from './Player';
import { PLAYER_TYPES } from '../config/PlayerStatsConfig';
import Phaser from 'phaser';

export class Atrofia extends Player {
  constructor(scene, x, y) {
    super(scene, x, y, PLAYER_TYPES.ATROFIA);

    this.setScale(0.09);
    this.setTint(0xaaaaff);

    this.originalBaseSpeed = this.baseSpeed;
    this.isJumping = false;
    this.boostTimer = null;
  }
  onInfectarCivil() {
    console.log('¡Adrenalina Zombi activada!');

    this.stamina += this.maxStamina * 0.2;

    if (this.stamina > this.maxStamina) {
      this.stamina = this.maxStamina;
    }
    this.isFatigued = false;

    this.baseSpeed = this.originalBaseSpeed * 1.5;
    this.setTint(0x00ffff); // Brillo cyan para indicar velocidad

    if (this.boostTimer) {
      this.boostTimer.remove();
    }

    this.boostTimer = this.scene.time.delayedCall(2000, () => {
      this.baseSpeed = this.originalBaseSpeed;
      if (!this.isDead && !this.isJumping) this.setTint(0xaaaaff);
    });
  }

  usarHabilidadEspecial() {
    if (this.isDead || this.isJumping || !this.puedeUsarHabilidad()) return;

    console.log('¡La Atrofia usa SALTO DEPREDADOR!');
    this.isJumping = true;
    this.setTint(0x0000ff); // Se oscurece mientras salta

    // 1. Obtener la posición del cursor en el mundo
    const pointer = this.scene.input.activePointer;
    const targetX = pointer.worldX;
    const targetY = pointer.worldY;

    // 2. Limitar la distancia máxima (para que no salte de punta a punta del mapa)
    const maxDist = 450;
    let finalX = targetX;
    let finalY = targetY;

    const dist = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);

    if (dist > maxDist) {
      // Si el cursor está muy lejos, calculamos el punto máximo en esa dirección
      const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);

      finalX = this.x + Math.cos(angle) * maxDist;
      finalY = this.y + Math.sin(angle) * maxDist;
    }

    this.setRotation(Phaser.Math.Angle.Between(this.x, this.y, finalX, finalY) + Math.PI / 2);

    this.body.checkCollision.none = true;

    // 5. Animación de salto con un "Tween"
    this.scene.tweens.add({
      targets: this,
      x: finalX,
      y: finalY,
      duration: 350,
      ease: 'Sine.easeOut', // Empieza rápido y frena un poco al aterrizar
      onComplete: () => {
        // Al aterrizar
        this.body.checkCollision.none = false;
        this.isJumping = false;
        if (this.baseSpeed === this.originalBaseSpeed && !this.isDead) this.setTint(0xaaaaff);

        this.impactoAlCaer();
      },
    });
  }
  impactoAlCaer() {
    const radioImpacto = 70; // Área de efecto al caer (un pequeño círculo a su alrededor)

    // Matar militares aplastados
    this.scene.enemiesGroup.getChildren().forEach((enemigo) => {
      if (!enemigo.isDead && Phaser.Math.Distance.Between(this.x, this.y, enemigo.x, enemigo.y) <= radioImpacto) {
        enemigo.recibirDaño(300);
      }
    });

    // Infectar civiles aplastados
    this.scene.civiliansGroup.getChildren().forEach((civil) => {
      if (!civil.isInfected && !civil.isDying && Phaser.Math.Distance.Between(this.x, this.y, civil.x, civil.y) <= radioImpacto) {
        civil.infectar();
        this.scene.civiliansGroup.remove(civil);
        this.scene.hordeGroup.add(civil);
        this.scene.store.infectCivilian();

        this.onInfectarCivil();

        this.scene.store.healPlayer(15);
        this.curar(15);
      }
    });
  }

  update(time, delta) {
    if (this.isDead) return;

    // Mientras vuela, ignoramos el control por teclado para que no interrumpa el Tween
    if (this.isJumping) {
      return;
    }

    super.update(time, delta);
  }
}
