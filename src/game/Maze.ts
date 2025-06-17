import Phaser from 'phaser'

const GRID_SIZE = 16
const COLOR_MAZE = 0x000000 // Black for maze outline
const COLOR_END = 0x00aa00 // Green for end location highlight

export class Maze {
  cols: number
  rows: number
  grid: number[][]
  scene: Phaser.Scene
  start: { x: number; y: number } = { x: 0, y: 0 }
  end: { x: number; y: number }

  constructor(scene: Phaser.Scene, width: number, height: number) {
    this.scene = scene
    this.cols = Math.floor(width / GRID_SIZE)
    this.rows = Math.floor(height / GRID_SIZE)

    // Pick a random start cell
    this.start = {
      x: Math.floor(Math.random() * this.cols),
      y: Math.floor(Math.random() * this.rows)
    }

    // Pick a random end cell (different from start)
    do {
      this.end = {
        x: Math.floor(Math.random() * this.cols),
        y: Math.floor(Math.random() * this.rows)
      }
    } while (this.end.x === this.start.x && this.end.y === this.start.y) // Make sure start and end are different

    this.grid = this.generateMaze()
  }

  generateMaze(): number[][] {
    // Simple recursive backtracking maze generation
    const cols = this.cols
    const rows = this.rows
    const maze = Array.from({ length: rows }, () => Array(cols).fill(0))
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false))
    const stack: [number, number][] = []

    const DX = [0, 1, 0, -1]
    const DY = [-1, 0, 1, 0]

    function shuffle<T>(array: T[]): T[] {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[array[i], array[j]] = [array[j], array[i]]
      }
      return array
    }

    function carve(x: number, y: number) {
      visited[y][x] = true
      const dirs = shuffle([0, 1, 2, 3])
      for (const dir of dirs) {
        const nx = x + DX[dir]
        const ny = y + DY[dir]
        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && !visited[ny][nx]) {
          // Remove wall between (x, y) and (nx, ny)
          maze[y][x] |= 1 << dir
          maze[ny][nx] |= 1 << (dir + 2) % 4
          carve(nx, ny)
        }
      }
    }

    // Use the random start cell for maze generation
    carve(this.start.x, this.start.y)
    return maze
  }

  render() {
    const graphics = this.scene.add.graphics()
    graphics.lineStyle(2, COLOR_MAZE, 1)
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const cell = this.grid[y][x]
        const px = x * GRID_SIZE
        const py = y * GRID_SIZE
        // Top wall
        if ((cell & 1) === 0) {
          graphics.beginPath()
          graphics.moveTo(px, py)
          graphics.lineTo(px + GRID_SIZE, py)
          graphics.strokePath()
        }
        // Right wall
        if ((cell & 2) === 0) {
          graphics.beginPath()
          graphics.moveTo(px + GRID_SIZE, py)
          graphics.lineTo(px + GRID_SIZE, py + GRID_SIZE)
          graphics.strokePath()
        }
        // Bottom wall
        if ((cell & 4) === 0) {
          graphics.beginPath()
          graphics.moveTo(px, py + GRID_SIZE)
          graphics.lineTo(px + GRID_SIZE, py + GRID_SIZE)
          graphics.strokePath()
        }
        // Left wall
        if ((cell & 8) === 0) {
          graphics.beginPath()
          graphics.moveTo(px, py)
          graphics.lineTo(px, py + GRID_SIZE)
          graphics.strokePath()
        }
      }
    }

    // Highlight the end location with a green outline
    graphics.lineStyle(3, COLOR_END, 1)
    const endX = this.end.x * GRID_SIZE
    const endY = this.end.y * GRID_SIZE
    graphics.strokeRect(
      endX + 2, // Add a small padding to make it visible inside the cell
      endY + 2,
      GRID_SIZE - 4, // Subtract padding from both sides
      GRID_SIZE - 4
    )
  }

  getStart() {
    return this.start
  }
  getEnd() {
    return this.end
  }

  isMoveAllowed(x: number, y: number, dx: number, dy: number): boolean {
    // Directions: 0=top, 1=right, 2=bottom, 3=left
    let dir: number | undefined = undefined
    if (dx === 0 && dy === -1)
      dir = 0 // up
    else if (dx === 1 && dy === 0)
      dir = 1 // right
    else if (dx === 0 && dy === 1)
      dir = 2 // down
    else if (dx === -1 && dy === 0) dir = 3 // left
    if (dir === undefined) return false
    const cell = this.grid[y]?.[x]
    if (cell === undefined) return false
    // If the wall in the direction is open, allow move
    return (cell & (1 << dir)) !== 0
  }
}
