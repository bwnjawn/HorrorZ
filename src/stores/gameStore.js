import { defineStore } from 'pinia';

export const useGameStore = defineStore('game', {
  state: () => ({
    playerHealth: 200,
    playerMaxHealth: 200,
    zombieCount: 1,
    civilianCount: 35,
    timeAlive: 0,
    isRegrouping: false,
    regroupCooldown: 0,
    isGameOver: false,
    isGameStarted: false,
    selectedZombie: null,
  }),
  actions: {
    startGame(zombieId) {
      this.selectedZombie = zombieId;
      this.isGameStarted = true;
    },

    takeDamage(amount) {
      this.playerHealth = Math.max(0, this.playerHealth - amount);
    },

    healPlayer(amount) {
      this.playerHealth = Math.min(this.playerMaxHealth, this.playerHealth + amount);
    },

    infectCivilian() {
      if (this.civilianCount > 0) {
        this.civilianCount--;
        this.zombieCount++;
      }
    },

    incrementTime() {
      this.timeAlive++;
    },

    setGameOver() {
      this.isGameOver = true;
    },

    resetGame() {
      window.location.reload();
    },
  },
});
