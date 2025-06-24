import Phaser from 'phaser'
import { GameManager } from './GameManager'
import { Maze } from './Maze'
import { GridScene } from './GridScene'
import { COLOR_PLAYER, GRID_SIZE } from '@/game/constants'

export class Player {
  rect: Phaser.GameObjects.Rectangle | null = null
  scene: Phaser.Scene
  cell: { x: number; y: number } = { x: 0, y: 0 }

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.create()
  }

  create() {
    const playerX =
      Math.floor(this.scene.scale.width / 2 / GRID_SIZE) * GRID_SIZE
    const playerY =
      Math.floor(this.scene.scale.height / 2 / GRID_SIZE) * GRID_SIZE

    // Update cell position to match initial visual position
    this.cell.x = playerX / GRID_SIZE
    this.cell.y = playerY / GRID_SIZE

    this.rect = this.scene.add.rectangle(
      playerX + GRID_SIZE / 2,
      playerY + GRID_SIZE / 2,
      GRID_SIZE,
      GRID_SIZE,
      COLOR_PLAYER
    )
    this.rect.setOrigin(0.5)
    this.rect.setDepth(1)
  }

  destroy() {
    if (this.rect) {
      this.rect.destroy()
      this.rect = null
    }
  }

  setCell(cell: { x: number; y: number }) {
    this.cell = { ...cell }
    this.setPositionByCell(this.cell)
  }

  redraw() {
    const currentCell = { ...this.cell }
    this.destroy()
    this.create()
    // Override the cell position set in create() with the stored position
    this.setCell(currentCell)
  }

  moveBy(dx: number, dy: number, maze: Maze) {
    const newX = this.cell.x + dx
    const newY = this.cell.y + dy
    if (maze && maze.isMoveAllowed(this.cell.x, this.cell.y, dx, dy)) {
      this.setCell({ x: newX, y: newY })
      // Increment step count when a valid move is made
      GameManager.getInstance().incrementSteps()

      // Check if player has reached the exit
      this.checkForLevelCompletion(maze)
    }
  }

  checkForLevelCompletion(maze: Maze): void {
    const exitCell = maze.getEnd()
    // If player's position matches the exit position
    if (this.cell.x === exitCell.x && this.cell.y === exitCell.y) {
      // Level completed! Increment level
      const gameManager = GameManager.getInstance()
      gameManager.incrementLevel()

      // Get the GridScene and call generateRandomGridColor with tweening enabled
      const gridScene = this.scene.scene.get('GridScene') as GridScene
      if (
        gridScene &&
        typeof gridScene.generateRandomGridColor === 'function'
      ) {
        gridScene.generateRandomGridColor(true) // Enable tweening for smooth color transition

        // Delay scene restart to allow the tween to complete
        this.scene.time.delayedCall(1100, () => {
          // 1100ms = tween duration (1000ms) + small buffer
          // Reset the current scene to generate a new maze for the next level
          this.scene.scene.restart()
        })
      } else {
        // Fallback if gridScene is not available
        this.scene.scene.restart()
      }
    }
  }

  setPositionByCell(cell: { x: number; y: number }) {
    // Update the internal cell coordinates
    this.cell = { ...cell }

    if (this.rect) {
      this.rect.setPosition(
        cell.x * GRID_SIZE + GRID_SIZE / 2,
        cell.y * GRID_SIZE + GRID_SIZE / 2
      )
    }
  }
}
