import Phaser from 'phaser'

const GRID_SIZE = 16
const COLOR_PLAYER = 0x1952a6 // Dark blue for player

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

  moveBy(dx: number, dy: number, maze: any) {
    const newX = this.cell.x + dx
    const newY = this.cell.y + dy
    if (maze && maze.isMoveAllowed(this.cell.x, this.cell.y, dx, dy)) {
      this.setCell({ x: newX, y: newY })
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
