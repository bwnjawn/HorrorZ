<template>
  <div class="main-menu">
    <h1 class="title">HORROR Z</h1>
    <p class="subtitle">Selecciona a tu Líder de la Horda</p>

    <div class="zombie-grid">
      <div v-for="zombie in zombies" :key="zombie.id" class="zombie-card">
        <h2>{{ zombie.name }}</h2>
        <p class="desc">{{ zombie.description }}</p>

        <div class="stats">
          <p>Vida: {{ zombie.baseHealth }}</p>
          <p>Velocidad: {{ zombie.baseSpeed }}</p>
          <p>Estamina: {{ zombie.maxStamina }}</p>
        </div>

        <p class="passive"><strong>Pasiva:</strong> {{ zombie.passiveDescription }}</p>

        <button @click="seleccionarPersonaje(zombie.id)">JUGAR CON {{ zombie.name.toUpperCase() }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGameStore } from '../stores/gameStore';
import { PLAYER_TYPES } from '../game/config/PlayerStatsConfig';

const store = useGameStore();

// Convertimos el objeto de configuraciones en un Array para poder usar el v-for de Vue
const zombies = Object.values(PLAYER_TYPES);

const seleccionarPersonaje = (zombieId) => {
  store.startGame(zombieId); // Le avisa al store que ya elegimos
};
</script>

<style scoped>
.main-menu {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #0a0a0a;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999; /* Para que quede por encima del canvas de Phaser */
  font-family: sans-serif;
}
.title {
  color: #ff3333;
  font-size: 3rem;
  margin-bottom: 0;
}
.subtitle {
  margin-bottom: 40px;
  color: #aaa;
}
.zombie-grid {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}
.zombie-card {
  background-color: #1a1a1a;
  border: 2px solid #333;
  border-radius: 8px;
  padding: 20px;
  width: 250px;
  text-align: center;
  transition: transform 0.2s;
}
.zombie-card:hover {
  border-color: #ff3333;
  transform: translateY(-5px);
}
.desc {
  font-style: italic;
  color: #ccc;
  font-size: 0.9rem;
  height: 60px;
}
.stats {
  text-align: left;
  background: #000;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 10px;
}
.stats p {
  margin: 5px 0;
  font-size: 0.9rem;
}
.passive {
  font-size: 0.85rem;
  color: #ffaa00;
  height: 50px;
}
button {
  width: 100%;
  padding: 10px;
  background-color: #ff3333;
  color: white;
  border: none;
  font-weight: bold;
  cursor: pointer;
  border-radius: 4px;
}
button:hover {
  background-color: #cc0000;
}
</style>
