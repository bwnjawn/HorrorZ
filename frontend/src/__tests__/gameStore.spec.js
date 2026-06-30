import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../stores/gameStore';

describe('Game Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const storeMock = {};

    global.localStorage = {
      getItem: vi.fn((key) => storeMock[key] || null),
      setItem: vi.fn((key, value) => {
        storeMock[key] = value.toString();
      }),
      clear: vi.fn(() => {
        for (const k in storeMock) delete storeMock[k];
      }),
    };
  });

  it('debería restar vida correctamente sin bajar de 0', () => {
    const store = useGameStore();

    store.setPlayerHealth(100);

    store.takeDamage(150);

    // La vida no debe ser -50, debe topar en 0
    expect(store.playerHealth).toBe(0);
  });

  it('debería curar al jugador sin sobrepasar la vida máxima', () => {
    const store = useGameStore();

    store.playerMaxHealth = 200;
    store.setPlayerHealth(150);

    // Curamos más de lo que falta para el máximo
    store.healPlayer(100);

    // La vida debe topar en 200
    expect(store.playerHealth).toBe(200);
  });

  it('debería incrementar el conteo de zombies y actualizar el récord de horda', () => {
    const store = useGameStore();

    store.zombieCount = 5;
    store.maxHordeSize = 5;
    store.totalInfected = 10;

    store.infectCivilian();

    // Verificamos que todo suba en 1
    expect(store.zombieCount).toBe(6);
    expect(store.totalInfected).toBe(11);
    expect(store.maxHordeSize).toBe(6);
  });
});
