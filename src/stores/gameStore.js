import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useGameStore = defineStore('game', () => {
  // --- ESTADO (Variables reactivas) ---
  const health = ref(100);
  const hordeCount = ref(0);
  const civilianCount = ref(50); // Mismo número que tienes en MainScene.js
  const isRegrouping = ref(false);

  // --- ACCIONES (Funciones para modificar el estado fácilmente) ---
  
  // Llama a esto cuando un zombie muerde a un civil
  function infectCivilian() {
    if (civilianCount.value > 0) {
      civilianCount.value--;
      hordeCount.value++;
    }
  }

  // Llama a esto si el jugador principal recibe daño
  function takeDamage(amount) {
    health.value -= amount;
    if (health.value < 0) health.value = 0;
  }

  return {
    // Exportamos todo para que Vue y Phaser puedan usarlo
    health,
    hordeCount,
    civilianCount,
    isRegrouping,
    infectCivilian,
    takeDamage
  };
});