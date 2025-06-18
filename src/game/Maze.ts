import Phaser from 'phaser'

const GRID_SIZE = 16
const COLOR_MAZE = 0x000000 // Black for maze outline
const COLOR_END = 0x00aa00 // Green for end location highlight
const COLOR_EMPTY = 0xcccccc // Light gray for empty cells

export class Maze {
  cols: number
  rows: number
  grid: number[][]
  scene: Phaser.Scene
  start: { x: number; y: number } = { x: 0, y: 0 }
  end: { x: number; y: number }
  totalCells: number // How many cells should be used in the maze

  constructor(
    scene: Phaser.Scene,
    width: number,
    height: number,
    totalCells: number = 0
  ) {
    this.scene = scene

    // Calculate maximum possible cols and rows based on board dimensions
    const maxCols = Math.floor(width / GRID_SIZE)
    const maxRows = Math.floor(height / GRID_SIZE)
    const maxCells = maxCols * maxRows

    // If totalCells is 0 or not provided, use all cells
    this.totalCells =
      totalCells <= 0 ? maxCells : Math.min(totalCells, maxCells)

    // Calculate dimensions based on totalCells
    if (this.totalCells >= maxCells) {
      // If using all cells, use maximum dimensions
      this.cols = maxCols
      this.rows = maxRows
    } else {
      // Calculate dimensions to approximate a square shape
      // while respecting the aspect ratio of the board
      const aspectRatio = maxCols / maxRows
      this.rows = Math.floor(Math.sqrt(this.totalCells / aspectRatio))
      this.cols = Math.floor(this.totalCells / this.rows)

      // Adjust if we didn't get exactly the right number of cells
      if (this.cols * this.rows < this.totalCells) {
        this.cols += 1
      }

      // Ensure we don't exceed the maximum dimensions
      this.cols = Math.min(this.cols, maxCols)
      this.rows = Math.min(this.rows, maxRows)
    }

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

    // To track cells that are part of the maze vs gaps
    const isPartOfMaze = Array.from({ length: rows }, () =>
      Array(cols).fill(false)
    )
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

    // Check if all maze cells are connected to the start position
    const checkConnectivity = (): boolean => {
      // Count total cells that should be part of maze
      let totalMazeCells = 0
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (isPartOfMaze[y][x]) {
            totalMazeCells++
          }
        }
      }

      // BFS from start position to count reachable cells
      const bfsVisited = Array.from({ length: rows }, () =>
        Array(cols).fill(false)
      )
      const queue: [number, number][] = [[this.start.x, this.start.y]]
      bfsVisited[this.start.y][this.start.x] = true
      let reachableCells = 1 // Start with 1 for the start cell

      while (queue.length > 0) {
        const [x, y] = queue.shift()!

        for (let dir = 0; dir < 4; dir++) {
          const nx = x + DX[dir]
          const ny = y + DY[dir]

          if (
            nx >= 0 &&
            nx < cols &&
            ny >= 0 &&
            ny < rows &&
            isPartOfMaze[ny][nx] &&
            !bfsVisited[ny][nx] &&
            maze[y][x] & (1 << dir)
          ) {
            queue.push([nx, ny])
            bfsVisited[ny][nx] = true
            reachableCells++
          }
        }
      }

      // If all maze cells are reachable, we have no orphans
      return reachableCells === totalMazeCells
    }

    // Find a path from start to end to ensure maze is solvable
    const findPath = (
      startX: number,
      startY: number,
      endX: number,
      endY: number
    ): boolean => {
      const queue: [number, number][] = [[startX, startY]]
      const pathVisited = Array.from({ length: rows }, () =>
        Array(cols).fill(false)
      )
      pathVisited[startY][startX] = true

      while (queue.length > 0) {
        const [x, y] = queue.shift()!

        if (x === endX && y === endY) return true

        for (let dir = 0; dir < 4; dir++) {
          const nx = x + DX[dir]
          const ny = y + DY[dir]

          if (
            nx >= 0 &&
            nx < cols &&
            ny >= 0 &&
            ny < rows &&
            isPartOfMaze[ny][nx] &&
            !pathVisited[ny][nx] &&
            maze[y][x] & (1 << dir)
          ) {
            queue.push([nx, ny])
            pathVisited[ny][nx] = true
          }
        }
      }

      return false
    }

    const carve = (x: number, y: number) => {
      visited[y][x] = true
      isPartOfMaze[y][x] = true

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

    // Start carving from the start position
    carve(this.start.x, this.start.y)

    // If totalCells is less than the maximum, create partial maze
    const maxCells = cols * rows
    if (this.totalCells < maxCells) {
      // Use the specified number of cells
      const targetCellCount = this.totalCells
      let currentCellCount = 0

      // Count cells that are already part of the maze
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (isPartOfMaze[y][x]) {
            currentCellCount++
          }
        }
      }

      // Keep removing cells from the maze until we reach the target count
      // But always ensure there's a path from start to end and no orphans
      const candidates: [number, number][] = []

      // Find cells that can be removed
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          // Don't remove start or end cells
          if (
            (x === this.start.x && y === this.start.y) ||
            (x === this.end.x && y === this.end.y)
          ) {
            continue
          }

          if (isPartOfMaze[y][x]) {
            candidates.push([x, y])
          }
        }
      }

      // Shuffle candidates to remove cells randomly
      shuffle(candidates)

      for (const [x, y] of candidates) {
        if (currentCellCount <= targetCellCount) break

        // Temporarily remove this cell
        const oldValue = maze[y][x]
        isPartOfMaze[y][x] = false

        // Remove connections to neighbors
        for (let dir = 0; dir < 4; dir++) {
          const nx = x + DX[dir]
          const ny = y + DY[dir]

          if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
            // Remove passage between cells
            maze[y][x] &= ~(1 << dir)
            maze[ny][nx] &= ~(1 << (dir + 2) % 4)
          }
        }

        // Check if path still exists AND no orphan sections were created
        if (
          findPath(this.start.x, this.start.y, this.end.x, this.end.y) &&
          checkConnectivity()
        ) {
          currentCellCount--
        } else {
          // Restore the cell if removing it breaks the path or creates orphans
          maze[y][x] = oldValue
          isPartOfMaze[y][x] = true

          // Restore connections to neighbors
          for (let dir = 0; dir < 4; dir++) {
            const nx = x + DX[dir]
            const ny = y + DY[dir]

            if (
              nx >= 0 &&
              nx < cols &&
              ny >= 0 &&
              ny < rows &&
              oldValue & (1 << dir)
            ) {
              maze[ny][nx] |= 1 << (dir + 2) % 4
            }
          }
        }
      }
    }

    return maze
  }

  render() {
    const graphics = this.scene.add.graphics()

    // First render any empty cells with a light background
    graphics.fillStyle(COLOR_EMPTY, 0.5)
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        // Skip start and end cells
        if (
          (x === this.start.x && y === this.start.y) ||
          (x === this.end.x && y === this.end.y)
        ) {
          continue
        }

        // Check if this is an empty cell by looking at walls
        // If all walls are present, it's likely an unused cell
        const cell = this.grid[y][x]
        if (cell === 0) {
          graphics.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE)
        }
      }
    }

    // Then render walls
    graphics.lineStyle(2, COLOR_MAZE, 1)
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const cell = this.grid[y][x]

        // Top wall
        if (!(cell & 1)) {
          graphics.beginPath()
          graphics.moveTo(x * GRID_SIZE, y * GRID_SIZE)
          graphics.lineTo((x + 1) * GRID_SIZE, y * GRID_SIZE)
          graphics.strokePath()
        }

        // Right wall
        if (!(cell & 2)) {
          graphics.beginPath()
          graphics.moveTo((x + 1) * GRID_SIZE, y * GRID_SIZE)
          graphics.lineTo((x + 1) * GRID_SIZE, (y + 1) * GRID_SIZE)
          graphics.strokePath()
        }

        // Bottom wall
        if (!(cell & 4)) {
          graphics.beginPath()
          graphics.moveTo(x * GRID_SIZE, (y + 1) * GRID_SIZE)
          graphics.lineTo((x + 1) * GRID_SIZE, (y + 1) * GRID_SIZE)
          graphics.strokePath()
        }

        // Left wall
        if (!(cell & 8)) {
          graphics.beginPath()
          graphics.moveTo(x * GRID_SIZE, y * GRID_SIZE)
          graphics.lineTo(x * GRID_SIZE, (y + 1) * GRID_SIZE)
          graphics.strokePath()
        }
      }
    }

    // Highlight the end point
    graphics.fillStyle(COLOR_END)
    graphics.fillRect(
      this.end.x * GRID_SIZE + GRID_SIZE / 4,
      this.end.y * GRID_SIZE + GRID_SIZE / 4,
      GRID_SIZE / 2,
      GRID_SIZE / 2
    )
  }

  // Helper to check if a cell is valid
  isValidCell(x: number, y: number): boolean {
    return x >= 0 && x < this.cols && y >= 0 && y < this.rows
  }

  // Helper to check if a wall exists between two cells
  hasWall(fromX: number, fromY: number, toX: number, toY: number): boolean {
    // Make sure we're moving to an adjacent cell
    if (Math.abs(fromX - toX) + Math.abs(fromY - toY) !== 1) {
      return true
    }

    // Check for walls in each direction
    if (toX > fromX) {
      // Moving right, check for right wall
      return !(this.grid[fromY][fromX] & 2)
    } else if (toX < fromX) {
      // Moving left, check for left wall
      return !(this.grid[fromY][fromX] & 8)
    } else if (toY > fromY) {
      // Moving down, check for bottom wall
      return !(this.grid[fromY][fromX] & 4)
    } else {
      // Moving up, check for top wall
      return !(this.grid[fromY][fromX] & 1)
    }
  }

  getStart(): { x: number; y: number } {
    return this.start
  }

  getEnd(): { x: number; y: number } {
    return this.end
  }

  // Check if a move from (x,y) by (dx,dy) is allowed
  isMoveAllowed(x: number, y: number, dx: number, dy: number): boolean {
    const newX = x + dx
    const newY = y + dy

    // First check if the target cell is valid
    if (!this.isValidCell(newX, newY)) {
      return false
    }

    // Then check if there's no wall between the cells
    return !this.hasWall(x, y, newX, newY)
  }
}
