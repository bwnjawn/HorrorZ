import Phaser from 'phaser';
import { Player } from './Player';
import { PLAYER_TYPES } from '../config/PlayerStatsConfig';

export class Atrofia extends Player {
  constructor(scene, x, y) {
    super(scene, x, y, PLAYER_TYPES.ATROFIA);

    // Nota: Si configuraste la escala a 1 en Player.js, puedes borrar este setScale.
    // Lo dejo en 0.4 tal como lo tenías por si tus sprites de Atrofia son más grandes.
    this.setScale(0.4);
    this.setTint(0xaaaaff);

    this.originalBaseSpeed = this.baseSpeed;
    this.isJumping = false;
    this.boostTimer = null;
  }

  onInfectarCivil() {
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

    this.isJumping = true;
    this.isAttacking = true; // Bloquea la caminata en Player.js

    // Inicia la animación del salto en el aire
    this.play('atrofia-jump-anim', true);

    this.setTint(0x0000ff); // Se oscurece mientras salta

    // 1. Obtener la posición del cursor en el mundo
    const pointer = this.scene.input.activePointer;
    const targetX = pointer.worldX;
    const targetY = pointer.worldY;

    // 2. Limitar la distancia máxima
    const maxDist = 450;
    let finalX = targetX;
    let finalY = targetY;

    const dist = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);
    const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);

    if (dist > maxDist) {
      finalX = this.x + Math.cos(angle) * maxDist;
      finalY = this.y + Math.sin(angle) * maxDist;
    }

    if (this.scene.obstaculos) {
      const obstaculos = this.scene.obstaculos.getChildren();
      let intersecta = true;
      let intentos = 0;

      // Si el punto de caída toca una pared, lo retrocedemos hacia Atrofia 15 píxeles a la vez
      while (intersecta && intentos < 30) {
        intersecta = false;

        for (let i = 0; i < obstaculos.length; i++) {
          if (obstaculos[i].getBounds().contains(finalX, finalY)) {
            intersecta = true;
            break;
          }
        }

        if (intersecta) {
          finalX -= Math.cos(angle) * 15;
          finalY -= Math.sin(angle) * 15;
        }
        intentos++;
      }
    }

    // CORRECCIÓN DE ROTACIÓN: Apunta hacia donde salta
    this.setRotation(Phaser.Math.Angle.Between(this.x, this.y, finalX, finalY));

    this.body.checkCollision.none = true;

    // 5. Animación de salto con un "Tween"
    const tiempoSalto = 350; // milisegundos
    const distanciaX = finalX - this.x;
    const distanciaY = finalY - this.y;

    const velX = (distanciaX / tiempoSalto) * 1000;
    const velY = (distanciaY / tiempoSalto) * 1000;

    this.setVelocity(velX, velY);

    // Finalizar el salto cuando pase el tiempo
    this.scene.time.delayedCall(tiempoSalto, () => {
      if (this.isDead) return;
      this.setVelocity(0, 0);
      this.body.checkCollision.none = false;
      this.isJumping = false;
      this.isAttacking = false;
      this.setTexture('zombie_walk_0');

      if (this.baseSpeed === this.originalBaseSpeed && !this.isDead) this.setTint(0xaaaaff);

      this.impactoAlCaer();
    });
  }

  // ==============================================================
  // ESTA ES LA FUNCIÓN QUE FALTABA (El daño al tocar el suelo)
  // ==============================================================
  impactoAlCaer() {
    const radioImpacto = 70; // Área de efecto al caer

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

        this.onInfectarCivil();

        this.scene.store.healPlayer(15);
        this.curar(15);
      }
    });
  }

  update(time, delta) {
    if (this.isDead) return;

    if (this.isJumping) {
      return;
    }

    super.update(time, delta);
  }
}
