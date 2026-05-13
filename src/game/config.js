import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';

export const gameConfig = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: '100%',
    height: '100%',
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
    noAudio: true,
  },

  scene: [MainScene], // Aquí registramos la escena principal
};
