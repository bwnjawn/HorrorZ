import { describe, it, expect } from 'vitest';
import { ENEMY_TYPES } from '../game/config/StatsConfig';
import { PLAYER_TYPES } from '../game/config/PlayerStatsConfig';

describe('Configuraciones Matemáticas y Estadísticas', () => {
  it('todos los enemigos deberían tener atributos válidos y consistentes', () => {
    const enemies = Object.values(ENEMY_TYPES);

    enemies.forEach((enemy) => {
      // Validamos que exista la propiedad hp y sea un número mayor a 0
      expect(enemy).toHaveProperty('hp');
      expect(typeof enemy.hp).toBe('number');
      expect(enemy.hp).toBeGreaterThan(0);

      // Validamos que tengan textura y velocidad
      expect(enemy).toHaveProperty('texture');
      expect(typeof enemy.speed).toBe('number');
    });
  });

  it('las clases de jugador deben tener estamina base positiva', () => {
    const players = Object.values(PLAYER_TYPES);

    players.forEach((player) => {
      // Evita que por error de tipeo un jugador nazca sin estamina
      expect(player).toHaveProperty('maxStamina');
      expect(player.maxStamina).toBeGreaterThan(0);
    });
  });
});
