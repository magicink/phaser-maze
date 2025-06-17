import { AUTO, Game } from 'phaser'
import { GridScene } from './GridScene'

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: 1280, // Fixed width for modern screens
  height: 720, // Fixed height for modern screens
  parent: 'game-container',
  backgroundColor: '#f8f9fa', // Very light grey
  scene: [GridScene]
}

const StartGame = (parent: string) => {
  return new Game({ ...config, parent })
}

export default StartGame
