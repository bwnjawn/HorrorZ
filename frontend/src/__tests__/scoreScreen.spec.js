// @vitest-environment jsdom
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useGameStore } from '../stores/gameStore';
import ScoreScreen from '../components/ScoreScreen.vue';

// mock de localStorage
const localStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

vi.stubGlobal('localStorage', localStorageMock);

describe('Pantalla de Puntuación (ScoreScreen.vue)', () => {
  it('debería renderizar correctamente las estadísticas finales y el título', async () => {
    const pinia = createPinia();

    setActivePinia(pinia);

    const store = useGameStore();

    store.totalInfected = 150;
    store.timeAlive = 120;
    store.maxHordeSize = 80;
    store.zombieCount = 45;
    store.formattedTime = '02:00';

    const wrapper = mount(ScoreScreen, {
      global: {
        plugins: [pinia],
      },
    });

    const title = wrapper.find('.death-title');

    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('HAS CAÍDO');

    // Estadísticas mostradas
    const highlights = wrapper.findAll('.highlight');

    expect(highlights).toHaveLength(3);

    expect(highlights[1].text()).toBe('80');
    expect(highlights[2].text()).toBe('45');
    expect(store.totalInfected).toBe(150);

    expect(wrapper.text()).toContain('Continuando en');
  });
});
