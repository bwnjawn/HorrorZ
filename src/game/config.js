import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';

export const gameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
    audio: {
      noAudio: true,
    },
  },
  scene: [MainScene], // Aquí registramos la escena principal
};
