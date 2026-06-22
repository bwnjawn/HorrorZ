// @vitest-environment jsdom
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useGameStore } from '../stores/gameStore';
import ScoreScreen from '../components/ScoreScreen.vue';

describe('Pantalla de Puntuación (ScoreScreen.vue)', () => {
  it('debería renderizar correctamente las estadísticas finales y el título', async () => {
    const pinia = createPinia();

    setActivePinia(pinia);

    const store = useGameStore();

    store.totalInfected = 150;
    store.selectedZombie = 'atrofia';
    store.timeAlive = 120;

    const wrapper = mount(ScoreScreen, {
      global: {
        plugins: [pinia],
      },
    });

    const title = wrapper.find('.death-title');

    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('HAS CAÍDO');

    const className = wrapper.find('.cl-name');

    expect(className.exists()).toBe(true);
    expect(className.text()).not.toBe('—');

    // Verificamos que el número de infectados se haya inyectado en el DOM
    const statNumbers = wrapper.findAll('.stat-number');

    expect(statNumbers.length).toBeGreaterThan(1);
    expect(statNumbers[1].text()).toBe('150');
  });
});
