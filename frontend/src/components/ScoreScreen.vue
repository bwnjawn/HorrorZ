<template>
  <div class="score-screen">
    <div class="bg-overlay"></div>

    <!-- ACTO 1: EL IMPACTO -->
    <div v-if="fase === 'resumen'" class="content act-1">
      <div class="death-title-block">
        <p class="pre-label">— FIN DE LA INFECCIÓN —</p>
        <h1 class="death-title">HAS CAÍDO</h1>
      </div>

      <div class="stats-panel">
        <p>
          Tiempo Sobrevivido: <span class="highlight">{{ store.formattedTime }}</span>
        </p>
        <p>
          Civiles Infectados: <span class="highlight">{{ store.totalInfected }}</span>
        </p>
        <p>
          Pico Máximo de la Horda: <span class="highlight">{{ store.maxHordeSize }}</span>
        </p>
        <p>
          Tamaño de Horda al Morir: <span class="highlight">{{ store.zombieCount }}</span>
        </p>
      </div>

      <p class="timer-text">Continuando en {{ countdown }}...</p>
      <button class="btn-arcade" @click="saltarFase1">VER TRIBUTO A LOS CAÍDOS</button>
    </div>
    <!-- ACTO 2: EL TRIBUTO (Créditos) -->
    <div v-else-if="fase === 'creditos'" class="content act-2">
      <h2 class="pre-label">— TRIBUTO A LOS CAÍDOS —</h2>

      <div class="credits-container">
        <!-- Contenedor que se animará hacia arriba -->
        <div class="victims-grid" @animationend="saltarFase2">
          <div v-for="v in victims" :key="v.name" class="victim-card">
            <img :src="v.photo" alt="Victim" />
            <div class="victim-info">
              <p class="name">{{ v.name }}</p>
              <p class="dob">{{ v.dob }}</p>
            </div>
          </div>
        </div>
      </div>

      <button class="btn-skip" @click="saltarFase2">Saltar Créditos >></button>
    </div>

    <!-- ACTO 3: LA REALIDAD (Ranking) -->
    <div v-else-if="fase === 'ranking'" class="content act-3">
      <h2 class="pre-label">— RANKING GLOBAL —</h2>

      <table class="terror-table">
        <thead>
          <tr>
            <th>Rango</th>
            <th>Jugador</th>
            <th>Tiempo</th>
            <th>Horda</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(score, index) in leaderboard" :key="index" :class="{ 'my-top-score': score.isMe }">
            <td>#{{ index + 1 }}</td>
            <td>{{ score.username }}</td>
            <td>{{ formatTime(score.survivalTime) }}</td>
            <td>{{ score.maxHordeSize }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Posición de la partida actual separada del Top 10 -->
      <div v-if="myCurrentRank" class="current-rank-panel">
        <p>TU POSICIÓN EN ESTA PARTIDA:</p>
        <h3 class="rank-number">#{{ myCurrentRank }}</h3>
      </div>

      <button class="btn-arcade" @click="volverAlInicio">VOLVER AL INICIO</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '../stores/gameStore';
import api from '../api/axios';

const store = useGameStore();

// Estados
const fase = ref('resumen');
const victims = ref([]);
const leaderboard = ref([]);
const myCurrentRank = ref(null);
const countdown = ref(5);

// Control de timers y audio
let timerInterval = null;
let bgmAudio = null;

const formatTime = (totalSeconds) => {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');

  const s = (totalSeconds % 60).toString().padStart(2, '0');

  return `${m}:${s}`;
};

// FASE 1: Guardado en segundo plano y temporizador
const iniciarFase1 = async () => {
  timerInterval = setInterval(() => {
    countdown.value--;

    if (countdown.value <= 0) {
      saltarFase1();
    }
  }, 1000);

  try {
    const res = await api.post('/scores', {
      survivalTime: store.timeAlive,
      maxHordeSize: store.maxHordeSize,
      victimsCount: store.totalInfected,
    });

    // Guardamos nuestra posición global
    myCurrentRank.value = res.data.rank;
  } catch (error) {
    console.error('Error al guardar la partida en segundo plano', error);
  }
};

// Transición FASE 1 -> FASE 2
const saltarFase1 = async () => {
  clearInterval(timerInterval);
  fase.value = 'creditos';

  // Reproducir música lúgubre
  bgmAudio = new Audio('/assets/audio/end-credits.mp3');
  bgmAudio.loop = true;
  bgmAudio.play().catch((e) => console.log('Autoplay bloqueado por el navegador', e));

  // Cargar las víctimas limitando a 30 máximo
  const victimCount = Math.min(store.totalInfected || 0, 30);

  try {
    const res = await api.get(`/victims?count=${victimCount}`);

    victims.value = res.data;
  } catch (e) {
    console.error('Error cargando víctimas', e);
    saltarFase2();
  }
};

// Transición FASE 2 -> FASE 3
const saltarFase2 = async () => {
  fase.value = 'ranking';

  if (bgmAudio) {
    bgmAudio.pause();
    bgmAudio.currentTime = 0;
  }

  // Cargar el Top 10 global
  try {
    const res = await api.get('/scores');

    leaderboard.value = res.data.map((item) => ({
      ...item,
      isMe: item.username === store.user?.username,
    }));
  } catch (e) {
    console.error('Error cargando ranking', e);
  }
};

const volverAlInicio = () => {
  if (bgmAudio) bgmAudio.pause();

  const gameStore = useGameStore();

  gameStore.isGameOver = false;
  gameStore.isGameStarted = false;

  gameStore.goToTitle();
};

onMounted(() => {
  iniciarFase1();
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
  if (bgmAudio) bgmAudio.pause();
});
</script>

<style scoped>
.score-screen {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: #050000;
  color: #fff;
  font-family: 'Courier New', Courier, monospace; /* Cambia a tu fuente de terror */
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.95) 100%);
  z-index: 1;
}

.content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

/* === ACTO 1 === */
.death-title {
  font-size: 5rem;
  color: #ff0000;
  text-shadow: 0 0 20px #ff0000;
  margin: 0 0 20px 0;
}
.pre-label {
  color: #888;
  letter-spacing: 5px;
  font-size: 1.2rem;
}
.stats-panel {
  background: rgba(20, 0, 0, 0.8);
  border: 1px solid #ff0000;
  padding: 30px;
  font-size: 1.5rem;
  margin-bottom: 20px;
}
.highlight {
  color: #ff4444;
  font-weight: bold;
}
.timer-text {
  color: #555;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

/* === ACTO 2 (Créditos Animados) === */
.credits-container {
  height: 60vh; /* Alto visible para los créditos */
  width: 500px;
  overflow: hidden; /* Oculta lo que sale del contenedor */
  position: relative;
  mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
}

.victims-grid {
  display: grid;
  grid-template-columns: 1fr 1fr; /* DOS COLUMNAS */
  gap: 20px;
  padding-top: 60vh; /* Empieza desde abajo */
  animation: scrollCredits 20s linear forwards; /* Ajusta los segundos para la velocidad */
}

@keyframes scrollCredits {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-100%);
  }
}

.victim-card {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border-left: 3px solid #550000;
  padding: 10px;
}
.victim-card img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
  filter: grayscale(100%) contrast(1.2); /* Estilo de obituario */
}
.victim-info {
  text-align: left;
}
.victim-info .name {
  margin: 0;
  font-weight: bold;
  font-size: 1rem;
}
.victim-info .dob {
  margin: 0;
  font-size: 0.8rem;
  color: #aaa;
}
.btn-skip {
  background: transparent;
  color: #888;
  border: none;
  margin-top: 20px;
  cursor: pointer;
}
.btn-skip:hover {
  color: #fff;
}

/* === ACTO 3 (Ranking) === */
.terror-table {
  width: 600px;
  border-collapse: collapse;
  background: rgba(0, 0, 0, 0.8);
  margin-bottom: 20px;
}
.terror-table th,
.terror-table td {
  padding: 12px;
  border-bottom: 1px solid #330000;
}
.terror-table th {
  background: #220000;
  color: #ff4444;
}
.my-top-score {
  background: rgba(255, 0, 0, 0.15);
  font-weight: bold;
}
.current-rank-panel {
  border-top: 3px solid #ff0000;
  padding-top: 20px;
  margin-bottom: 20px;
  text-align: center;
}
.rank-number {
  font-size: 2.5rem;
  color: #ff0000;
  margin: 10px 0 0 0;
  text-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
}

/* Botones Generales */
.btn-arcade {
  background: #8b0000;
  color: white;
  border: 2px solid #ff0000;
  padding: 15px 30px;
  font-family: inherit;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s;
}
.btn-arcade:hover {
  background: #ff0000;
  box-shadow: 0 0 15px #ff0000;
}
</style>
