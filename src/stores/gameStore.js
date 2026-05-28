import { defineStore } from 'pinia';
import { PLAYER_TYPES } from '../game/config/PlayerStatsConfig';

export const useGameStore = defineStore('game', {
  state: () => ({
    // ── FLUJO DE PANTALLAS ─────────────────────────────────────────────
    // 'title' → 'charSelect' → 'playing' → 'gameOver'
    currentView: 'title',
    isGameStarted: false,
    isPaused: false,

    // ── COMPATIBILIDAD (los usa MainScene y Player directamente) ────────
    isGameStarted: false,
    isGameOver: false,
    selectedZombie: null,

    // ── STATS DEL JUGADOR ──────────────────────────────────────────────
    playerHealth: 200,
    playerMaxHealth: 200,

    // ── STATS DE LA HORDA / CIVILES ────────────────────────────────────
    zombieCount: 0, // zombis actuales en la horda
    civilianCount: 0, // civiles totales spawneados (vivos + muertos)

    // ── PUNTUACIÓN ─────────────────────────────────────────────────────
    timeAlive: 0, // segundos sobrevividos
    totalInfected: 0, // total de infecciones realizadas
    maxHordeSize: 0, // pico máximo de la horda

    // ── MECÁNICA DE REAGRUPAMIENTO ─────────────────────────────────────
    isRegrouping: false,
    regroupCooldown: 0,
  }),

  getters: {
    selectedZombieConfig: (state) => {
      return Object.values(PLAYER_TYPES).find((p) => p.id === state.selectedZombie) || null;
    },
    formattedTime: (state) => {
      const m = Math.floor(state.timeAlive / 60);
      const s = state.timeAlive % 60;

      return `${m}:${s.toString().padStart(2, '0')}`;
    },
  },

  actions: {
    // ── NAVEGACIÓN ──────────────────────────────────────────────────────
    goToCharSelect() {
      this.currentView = 'charSelect';
    },

    goToTitle() {
      this.currentView = 'title';
    },

    // ── INICIO / FIN DE PARTIDA ─────────────────────────────────────────
    startGame(zombieId) {
      this.selectedZombie = zombieId;

      // Sincronizar vida máxima con el personaje elegido
      const config = Object.values(PLAYER_TYPES).find((p) => p.id === zombieId);

      if (config) {
        this.playerMaxHealth = config.baseHealth;
        this.playerHealth = config.baseHealth;
      }

      this.isGameStarted = true;
      this.currentView = 'playing';
    },

    togglePause() {
      if (this.currentView === 'playing') {
        this.isPaused = true;
        this.currentView = 'paused';
      } else if (this.currentView === 'paused') {
        this.isPaused = false;
        this.currentView = 'playing';
      }
    },
    quitToMenu() {
      this.isPaused = false;
      this.isGameStarted = false;
      this.currentView = 'title'; // Te manda de vuelta a la pantalla de título
    },

    setGameOver() {
      this.isGameOver = true;
      this.currentView = 'gameOver';
    },

    resetGame() {
      // Resetear todo el estado de partida pero quedarse en title
      this.isGameStarted = false;
      this.isGameOver = false;
      this.selectedZombie = null;

      this.playerHealth = 200;
      this.playerMaxHealth = 200;

      this.zombieCount = 0;
      this.civilianCount = 0;
      this.timeAlive = 0;
      this.totalInfected = 0;
      this.maxHordeSize = 0;

      this.isRegrouping = false;
      this.regroupCooldown = 0;

      this.currentView = 'title';
    },

    // ── ACCIONES DE JUEGO ───────────────────────────────────────────────
    takeDamage(amount) {
      this.playerHealth = Math.max(0, this.playerHealth - amount);
    },

    healPlayer(amount) {
      this.playerHealth = Math.min(this.playerMaxHealth, this.playerHealth + amount);
    },

    infectCivilian() {
      this.zombieCount++;
      this.totalInfected++;

      if (this.zombieCount > this.maxHordeSize) {
        this.maxHordeSize = this.zombieCount;
      }
    },

    spawnCivilian() {
      this.civilianCount++;
    },

    incrementTime() {
      if (!this.isGameOver) this.timeAlive++;
    },

    // ── REAGRUPAMIENTO ──────────────────────────────────────────────────
    startRegroup() {
      this.isRegrouping = true;
    },
    stopRegroup() {
      this.isRegrouping = false;
    },
    setRegroupCooldown(seconds) {
      this.regroupCooldown = seconds;
    },
  },
});
