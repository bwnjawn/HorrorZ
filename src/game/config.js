import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';

export const gameConfig = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: true,
    },
  },
  audio: {
    noAudio: true,
  },

  scene: [MainScene], // Aquí registramos la escena principal
};
