import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';

export const gameConfig = {
  type: Phaser.WEBGL,
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
    maxLights: 40,
  },
  parent: 'game-container',

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  audio: {
    noAudio: false,
  },

  scene: [MainScene], // Aquí registramos la escena principal
};
