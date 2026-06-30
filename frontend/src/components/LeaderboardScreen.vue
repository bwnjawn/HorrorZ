<template>
  <TerrorLayout>
    <div class="content leaderboard-container">
      <div class="death-title-block">
        <p class="pre-label">— RANKING GLOBAL —</p>
        <h1 class="death-title">MEJORES ZOMBIES</h1>
      </div>

      <div class="table-wrapper">
        <p v-if="isLoading" class="loading-text">Buscando en los registros...</p>
        <p v-else-if="error" class="error-text">{{ error }}</p>

        <table v-else class="terror-table">
          <thead>
            <tr>
              <th>Rango</th>
              <th>Jugador</th>
              <th>Tiempo</th>
              <th>Horda Max</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(score, index) in scores" :key="score.id">
              <td class="rank">#{{ index + 1 }}</td>
              <td class="player">{{ score.username }}</td>
              <td>{{ formatTime(score.survivalTime) }}</td>
              <td>{{ score.maxHordeSize }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <button class="btn-back-arcade" @click="gameStore.goToTitle()">
        <span class="btn-glow"></span>
        <span class="btn-text">◀ VOLVER AL INICIO</span>
      </button>
    </div>
  </TerrorLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useGameStore } from '../stores/gameStore';
import TerrorLayout from './TerrorLayout.vue';
import api from '../api/axios';

const gameStore = useGameStore();
const scores = ref([]);
const isLoading = ref(true);
const error = ref(null);

// Función para convertir los segundos a MM:SS
const formatTime = (totalSeconds) => {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');

  const s = (totalSeconds % 60).toString().padStart(2, '0');

  return `${m}:${s}`;
};

onMounted(async () => {
  try {
    const response = await api.get('/scores');

    scores.value = response.data;
  } catch {
    error.value = 'Error al conectar con la base de datos de infectados.';
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
/* IMPORTAR FUENTES (Por si no están globales) */
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Share+Tech+Mono&display=swap');

.leaderboard-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  z-index: 10;
  position: relative;
}

.death-title-block {
  text-align: center;
  margin-bottom: 2rem;
}

.pre-label {
  font-family: 'Courier New', Courier, monospace;
  color: #a00;
  letter-spacing: 0.3em;
  font-size: 0.9rem;
  margin-bottom: -15px;
}

.death-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 4.5rem;
  color: #ff3333;
  margin: 0;
  text-shadow: 0 0 15px rgba(200, 0, 0, 0.7);
  letter-spacing: 0.05em;
}

.table-wrapper {
  width: 90%;
  max-width: 600px;
  background: rgba(10, 0, 0, 0.7);
  border: 1px solid #5a0000;
  padding: 20px;
  box-shadow: 0 0 20px rgba(100, 0, 0, 0.5) inset;
}

.terror-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Courier New', Courier, monospace;
  color: #ccc;
  text-align: center;
}

.terror-table th {
  border-bottom: 2px solid #8b0000;
  padding: 10px;
  color: #ff4444;
  letter-spacing: 0.1em;
}

.terror-table td {
  padding: 12px 10px;
  border-bottom: 1px solid rgba(139, 0, 0, 0.3);
}

.rank {
  color: #ff3333;
  font-weight: bold;
}

.player {
  font-weight: bold;
  letter-spacing: 0.05em;
  color: #fff;
}

.loading-text,
.error-text {
  text-align: center;
  font-family: 'Courier New', Courier, monospace;
  color: #ff4444;
}

/* ── ESTILOS DEL NUEVO BOTÓN VOLVER ARCADE PREMIUM ── */
.btn-back-arcade {
  position: relative;
  width: 100%;
  max-width: 280px;
  margin-top: 40px;
  background: #0f0000;
  border: 2px solid #4a0000;
  padding: 14px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-text {
  position: relative;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.4rem;
  letter-spacing: 0.15em;
  color: #884444;
  z-index: 2;
  transition:
    color 0.3s ease,
    text-shadow 0.3s ease;
}

.btn-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(235, 49, 49, 0.25), transparent);
  transform: translateX(-100%);
  transition: transform 0.5s ease-in-out;
  z-index: 1;
}

.btn-back-arcade:hover {
  border-color: #ff3333;
  box-shadow: 0 0 25px rgba(255, 50, 50, 0.4);
  background: #1c0000;
}

.btn-back-arcade:hover .btn-text {
  color: #ffffff;
  text-shadow: 0 0 10px #ff3333;
}

.btn-back-arcade:hover .btn-glow {
  transform: translateX(100%);
}
</style>
