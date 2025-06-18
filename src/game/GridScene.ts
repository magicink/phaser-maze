import Phaser from 'phaser'

const GRID_SIZE = 16
const COLOR_BG = 0xf8f9fa // Very light grey
const COLOR_GRID = 0xc7d6e6 // Light bluish grey, darker than COLOR_BG

export class GridScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GridScene' })
  }

  init() {
    this.drawGrid()
    this.scale.on('resize', this.handleResize, this)
  }

  drawGrid() {
    const width = this.scale.width
    const height = this.scale.height
    const camera = this.cameras.main
    camera.setZoom(1)
    camera.setScroll(0, 0)

    this.children.removeAll()
    const graphics = this.add.graphics()
    graphics.fillStyle(COLOR_BG, 1)
    graphics.fillRect(0, 0, width, height)
    graphics.lineStyle(1, COLOR_GRID, 1)
    // Draw only lines that are fully within the canvas
    for (let x = 0; x < width; x += GRID_SIZE) {
      graphics.beginPath()
      graphics.moveTo(x, 0)
      graphics.lineTo(x, height)
      graphics.strokePath()
    }
    for (let y = 0; y < height; y += GRID_SIZE) {
      graphics.beginPath()
      graphics.moveTo(0, y)
      graphics.lineTo(width, y)
      graphics.strokePath()
    }
    // Draw the right and bottom border if not already drawn
    if (width % GRID_SIZE === 0) {
      graphics.beginPath()
      graphics.moveTo(width - 1, 0)
      graphics.lineTo(width - 1, height)
      graphics.strokePath()
    }
    if (height % GRID_SIZE === 0) {
      graphics.beginPath()
      graphics.moveTo(0, height - 1)
      graphics.lineTo(width, height - 1)
      graphics.strokePath()
    }
  }

  handleResize(gameSize: Phaser.Structs.Size) {
    // this.cameras.main.setSize(gameSize.width, gameSize.height)
    // this.drawGrid()
  }

  create() {
    // Start the MazeScene which will overlay on top of this scene
    this.scene.launch('MazeScene')
  }

  update() {
    // Nothing to do here since we only draw the grid
  }
}
