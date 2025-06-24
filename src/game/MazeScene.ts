// filepath: d:\projects\phaser-sandbox\src\game\MazeScene.ts
import Phaser from 'phaser'
import { Player } from './Player'
import { Maze } from './Maze'
import { GameManager } from './GameManager'

let player: Player | null = null
let maze: Maze | null = null

export class MazeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MazeScene' })
  }

  init() {
    // Create maze with more cells to make shapes visible
    maze = new Maze(
      this,
      this.scale.width,
      this.scale.height,
      400 // Using more cells for better shape visibility
    )
    maze.render()
    player = new Player(this)
    if (maze && player) {
      player.setPositionByCell(maze.getStart())
    }
    // Reset step count when initializing the scene
    GameManager.getInstance().resetSteps()
    this.scale.on('resize', this.handleResize, this)
  }

  handleResize(gameSize: Phaser.Structs.Size) {
    this.cameras.main.setSize(gameSize.width, gameSize.height)
    // Create a maze with more cells to make shapes visible
    maze = new Maze(
      this,
      this.scale.width,
      this.scale.height,
      400 // Using more cells for better shape visibility
    )
    maze.render()
    if (player) player.redraw()
    if (maze && player) {
      player.setPositionByCell(maze.getStart())
    }
    // Reset step count when resizing as this creates a new maze
    GameManager.getInstance().resetSteps()
  }

  create() {
    if (!this.input || !this.input.keyboard) return
    this.input.keyboard.on('keydown', (event: KeyboardEvent) => {
      if (!player || !maze) return
      switch (event.key) {
        case 'ArrowUp':
          player.moveBy(0, -1, maze)
          break
        case 'ArrowRight':
          player.moveBy(1, 0, maze)
          break
        case 'ArrowDown':
          player.moveBy(0, 1, maze)
          break
        case 'ArrowLeft':
          player.moveBy(-1, 0, maze)
          break
      }
    })
  }

  update() {
    // Any frame-by-frame updates
  }
}
