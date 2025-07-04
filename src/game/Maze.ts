import Phaser from 'phaser'
import { COLOR_EMPTY, COLOR_END, COLOR_MAZE, GRID_SIZE } from './constants'
import { MazeShapes } from '@/lib/maze/MazeShapes'
import { EventBus } from '@/lib/shared/EventBus'
import { EVENT_MAX_TILES_UPDATED } from '@/lib/shared/EventBusEvents'

export class Maze {
  cols: number
  rows: number
  grid: number[][]
  scene: Phaser.Scene
  start: { x: number; y: number } = { x: 0, y: 0 }
  end: { x: number; y: number } = { x: 0, y: 0 }
  totalCells: number // How many cells should be used in the maze
  cellsInShape: boolean[][] // Tracks which cells are part of the chosen shape

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

    // Emit an event with the maximum number of tiles
    EventBus.emit(EVENT_MAX_TILES_UPDATED, this.totalCells)

    // Always use the maximum dimensions for the grid
    this.cols = maxCols
    this.rows = maxRows

    // Initialize the cellsInShape array with all cells set to false
    this.cellsInShape = Array.from({ length: this.rows }, () =>
      Array(this.cols).fill(false)
    )

    // Generate a shape for the maze
    this.generateShape()

    // Calculate the minimum required distance (at least half the total cells)
    const minRequiredDistance = Math.ceil(this.totalCells / 2)

    // Ensure the shape has enough cells to potentially satisfy the minimum distance requirement
    // We need at least minRequiredDistance + 1 cells (for start and path to end)
    let cellsInShape = this.countCellsInShape()

    // If we have fewer than 2 cells, force at least 2 cells to ensure we have a start and end
    if (cellsInShape < 2) {
      console.log(
        `Shape has only ${cellsInShape} cells, forcing at least 2 cells`
      )
      // Add the center cell and one adjacent cell
      const centerX = Math.floor(this.cols / 2)
      const centerY = Math.floor(this.rows / 2)
      this.cellsInShape[centerY][centerX] = true
      this.cellsInShape[centerY][centerX + 1] = true
      cellsInShape = this.countCellsInShape()
    }

    // Now expand to meet the minimum distance requirement
    // The minimum number of cells should be at least half the total available cells
    if (cellsInShape < minRequiredDistance) {
      console.log(
        `Shape has only ${cellsInShape} cells, expanding to at least ${minRequiredDistance} cells`
      )
      this.expandShape(minRequiredDistance)
    }

    // Pick a random start cell within the shape
    const validCells = this.getValidCellsInShape()
    if (validCells.length === 0) {
      // Fallback if no valid cells in shape (shouldn't happen)
      this.start = {
        x: Math.floor(this.cols / 2),
        y: Math.floor(this.rows / 2)
      }
      this.cellsInShape[this.start.y][this.start.x] = true
    } else {
      const startIdx = Math.floor(Math.random() * validCells.length)
      this.start = { ...validCells[startIdx] }
    }

    // Function to calculate the shortest path distance between two points
    const calculateDistance = (
      startX: number,
      startY: number,
      endX: number,
      endY: number
    ): number => {
      const queue: [number, number, number][] = [[startX, startY, 0]] // [x, y, distance]
      const visited = Array.from({ length: this.rows }, () =>
        Array(this.cols).fill(false)
      )
      visited[startY][startX] = true

      const dx = [0, 1, 0, -1]
      const dy = [-1, 0, 1, 0]

      while (queue.length > 0) {
        const [x, y, distance] = queue.shift()!

        if (x === endX && y === endY) {
          return distance
        }

        for (let dir = 0; dir < 4; dir++) {
          const nx = x + dx[dir]
          const ny = y + dy[dir]

          if (
            nx >= 0 &&
            nx < this.cols &&
            ny >= 0 &&
            ny < this.rows &&
            this.cellsInShape[ny][nx] &&
            !visited[ny][nx]
          ) {
            queue.push([nx, ny, distance + 1])
            visited[ny][nx] = true
          }
        }
      }

      return -1 // No path found
    }

    // Filter candidates that are different from start
    const endCandidates = validCells.filter(
      cell => !(cell.x === this.start.x && cell.y === this.start.y)
    )

    if (endCandidates.length === 0) {
      // Fallback if no other valid cells (shouldn't happen)
      this.end = {
        x: this.start.x === 0 ? 1 : this.start.x - 1,
        y: this.start.y
      }
      this.cellsInShape[this.end.y][this.end.x] = true
    } else {
      // Find candidates that are at least minRequiredDistance away
      let distantCandidates = endCandidates.filter(cell => {
        const distance = calculateDistance(
          this.start.x,
          this.start.y,
          cell.x,
          cell.y
        )
        return distance >= minRequiredDistance && distance !== -1
      })

      // If no distant candidates, expand the shape and try again
      if (distantCandidates.length === 0) {
        console.log(
          `No candidates with distance >= ${minRequiredDistance} found. Expanding shape...`
        )

        // Keep expanding the shape until we find a candidate with sufficient distance
        let attempts = 0
        const maxAttempts = 10 // Limit the number of attempts to prevent infinite loops

        while (distantCandidates.length === 0 && attempts < maxAttempts) {
          attempts++

          // Expand the shape by adding more cells
          this.expandShape(
            this.countCellsInShape() + Math.ceil(this.totalCells * 0.1)
          ) // Add 10% more cells

          // Get updated valid cells
          const updatedValidCells = this.getValidCellsInShape()
          const updatedEndCandidates = updatedValidCells.filter(
            cell => !(cell.x === this.start.x && cell.y === this.start.y)
          )

          // Check for distant candidates again
          distantCandidates = updatedEndCandidates.filter(cell => {
            const distance = calculateDistance(
              this.start.x,
              this.start.y,
              cell.x,
              cell.y
            )
            return distance >= minRequiredDistance && distance !== -1
          })

          console.log(
            `Attempt ${attempts}: Found ${distantCandidates.length} candidates with sufficient distance`
          )
        }
      }

      if (distantCandidates.length > 0) {
        // Pick a random end cell from the distant candidates
        const endIdx = Math.floor(Math.random() * distantCandidates.length)
        this.end = { ...distantCandidates[endIdx] }

        // Verify the actual distance
        const finalDistance = calculateDistance(
          this.start.x,
          this.start.y,
          this.end.x,
          this.end.y
        )
        console.log(
          `Selected end cell with distance ${finalDistance} (required: ${minRequiredDistance})`
        )
      } else {
        // If still no distant candidates after expansion, pick the farthest one
        let maxDistance = -1
        let farthestCell = endCandidates[0]

        for (const cell of endCandidates) {
          const distance = calculateDistance(
            this.start.x,
            this.start.y,
            cell.x,
            cell.y
          )
          if (distance > maxDistance && distance !== -1) {
            maxDistance = distance
            farthestCell = cell
          }
        }

        this.end = { ...farthestCell }
        console.log(
          `Using farthest available cell with distance ${maxDistance} (required: ${minRequiredDistance})`
        )
      }
    }

    this.grid = this.generateMaze()
  }

  // Generate a shape for the maze
  generateShape() {
    // Randomly choose a shape type
    const shapeTypes = [
      MazeShapes.SHAPE_BLOB,
      MazeShapes.SHAPE_PARABOLA,
      MazeShapes.SHAPE_RANDOM,
      MazeShapes.SHAPE_HEART,
      MazeShapes.SHAPE_SPIRAL,
      MazeShapes.SHAPE_DONUT
    ]
    const shapeType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)]

    // Calculate center of the grid
    const centerX = Math.floor(this.cols / 2)
    const centerY = Math.floor(this.rows / 2)

    // Calculate the size of the shape based on totalCells
    // We want to ensure we have approximately totalCells cells in the shape
    const maxRadius = Math.min(this.cols, this.rows) / 2
    const targetRadius = Math.sqrt(this.totalCells / Math.PI)
    // Ensure radius is at least 2 to avoid shapes with only one cell
    const minRadius = 2
    const radius = Math.max(minRadius, Math.min(targetRadius, maxRadius))

    // Generate the selected shape using the MazeShapes library
    switch (shapeType) {
      case MazeShapes.SHAPE_BLOB:
        this.cellsInShape = MazeShapes.generateBlobShape(
          this.rows,
          this.cols,
          centerX,
          centerY,
          radius
        )
        break
      case MazeShapes.SHAPE_PARABOLA:
        this.cellsInShape = MazeShapes.generateParabolaShape(
          this.rows,
          this.cols,
          centerX,
          centerY,
          radius
        )
        break
      case MazeShapes.SHAPE_HEART:
        this.cellsInShape = MazeShapes.generateHeartShape(
          this.rows,
          this.cols,
          centerX,
          centerY,
          radius
        )
        break
      case MazeShapes.SHAPE_SPIRAL:
        this.cellsInShape = MazeShapes.generateSpiralShape(
          this.rows,
          this.cols,
          centerX,
          centerY,
          radius
        )
        break
      case MazeShapes.SHAPE_DONUT:
        this.cellsInShape = MazeShapes.generateDonutShape(
          this.rows,
          this.cols,
          centerX,
          centerY,
          radius
        )
        break
      case MazeShapes.SHAPE_RANDOM:
      default:
        this.cellsInShape = MazeShapes.generateRandomShape(
          this.rows,
          this.cols,
          centerX,
          centerY,
          radius
        )
        break
    }

    // Ensure we have enough cells in the shape
    const cellsInShape = this.countCellsInShape()
    if (cellsInShape < this.totalCells * 0.8) {
      // If we have too few cells, expand the shape
      this.expandShape(this.totalCells)
    } else if (cellsInShape > this.totalCells * 1.2) {
      // If we have too many cells, shrink the shape
      this.shrinkShape(this.totalCells)
    }
  }

  // Count the number of cells in the shape
  countCellsInShape(): number {
    let count = 0
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.cellsInShape[y][x]) {
          count++
        }
      }
    }
    return count
  }

  // Expand the shape to reach the target cell count
  expandShape(targetCellCount: number) {
    // Use MazeShapes.expandShape to expand the shape
    this.cellsInShape = MazeShapes.expandShape(
      this.cellsInShape,
      this.rows,
      this.cols,
      targetCellCount
    )
  }

  // Shrink the shape to reach the target cell count
  shrinkShape(targetCellCount: number) {
    while (this.countCellsInShape() > targetCellCount) {
      const borderCells: [number, number][] = []

      // Find cells at the border of the shape
      for (let y = 0; y < this.rows; y++) {
        for (let x = 0; x < this.cols; x++) {
          if (this.cellsInShape[y][x]) {
            // Skip start and end cells
            if (
              (x === this.start.x && y === this.start.y) ||
              (x === this.end.x && y === this.end.y)
            ) {
              continue
            }

            // Check if this cell is at the border (has at least one non-shape neighbor)
            let isBorder = false
            for (let ny = y - 1; ny <= y + 1; ny++) {
              for (let nx = x - 1; nx <= x + 1; nx++) {
                if (nx === x && ny === y) continue

                if (
                  nx < 0 ||
                  nx >= this.cols ||
                  ny < 0 ||
                  ny >= this.rows ||
                  !this.cellsInShape[ny][nx]
                ) {
                  isBorder = true
                  break
                }
              }
              if (isBorder) break
            }

            if (isBorder) {
              borderCells.push([x, y])
            }
          }
        }
      }

      if (borderCells.length === 0) break

      // Remove a random border cell from the shape
      const idx = Math.floor(Math.random() * borderCells.length)
      const [x, y] = borderCells[idx]
      this.cellsInShape[y][x] = false

      // Stop if we've removed enough cells
      if (this.countCellsInShape() <= targetCellCount) break
    }
  }

  // Get all valid cells in the shape
  getValidCellsInShape(): { x: number; y: number }[] {
    const validCells: { x: number; y: number }[] = []
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.cellsInShape[y][x]) {
          validCells.push({ x, y })
        }
      }
    }
    return validCells
  }

  // Ensure all cells are reachable from the starting point
  ensureReachableCells() {
    const visited = Array.from({ length: this.rows }, () =>
      Array(this.cols).fill(false)
    )

    // BFS to discover reachable cells
    const queue = [this.start]
    visited[this.start.y][this.start.x] = true

    while (queue.length > 0) {
      const { x, y } = queue.shift()!

      // Check neighbors
      const neighbors = [
        { x: x - 1, y },
        { x: x + 1, y },
        { x, y: y - 1 },
        { x, y: y + 1 }
      ]

      for (const neighbor of neighbors) {
        if (
          neighbor.x >= 0 &&
          neighbor.x < this.cols &&
          neighbor.y >= 0 &&
          neighbor.y < this.rows &&
          this.cellsInShape[neighbor.y][neighbor.x] &&
          !visited[neighbor.y][neighbor.x]
        ) {
          visited[neighbor.y][neighbor.x] = true
          queue.push(neighbor)
        }
      }
    }

    // Mark unreachable cells as inaccessible
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.cellsInShape[y][x] && !visited[y][x]) {
          this.cellsInShape[y][x] = false
        }
      }
    }
  }

  // Update maze generation to ensure reachable cells
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
    const DX = [0, 1, 0, -1]
    const DY = [-1, 0, 1, 0]

    function shuffle<T>(array: T[]): T[] {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[array[i], array[j]] = [array[j], array[i]]
      }
      return array
    }

    // Check if all cells in the shape are connected to the start position
    const checkConnectivity = (): boolean => {
      // Count total cells that should be part of maze (all cells in the shape)
      let totalShapeCells = 0
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (this.cellsInShape[y][x]) {
            totalShapeCells++
          }
        }
      }

      // BFS from the start position to count reachable cells
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

          // Bitwise operations for checking connectivity:
          // 1. (1 << dir) creates a bit mask for the current direction
          // 2. The bitwise AND checks if that bit is set in the cell's value
          // 3. This is checking if there's a passage from the current cell to the neighbor
          // This approach is more efficient than storing connectivity in a separate data structure
          const hasPassage = maze[y][x] & (1 << dir)

          if (
            nx >= 0 &&
            nx < cols &&
            ny >= 0 &&
            ny < rows &&
            this.cellsInShape[ny][nx] && // Check if cell is in shape
            !bfsVisited[ny][nx] &&
            hasPassage
          ) {
            queue.push([nx, ny])
            bfsVisited[ny][nx] = true
            reachableCells++
          }
        }
      }

      // If all cells in the shape are reachable, we have no orphans
      return reachableCells === totalShapeCells
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

          // Bitwise operations for path finding:
          // 1. (1 << dir) creates a bit mask for the current direction
          // 2. The bitwise AND checks if that bit is set in the cell's value
          // 3. This is checking if there's a passage from the current cell to the neighbor
          // Using bitwise operations here allows for fast path finding, which is critical
          // for maze generation and validation
          const hasPathPassage = maze[y][x] & (1 << dir)

          if (
            nx >= 0 &&
            nx < cols &&
            ny >= 0 &&
            ny < rows &&
            isPartOfMaze[ny][nx] &&
            !pathVisited[ny][nx] &&
            hasPathPassage
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

        if (
          nx >= 0 &&
          nx < cols &&
          ny >= 0 &&
          ny < rows &&
          !visited[ny][nx] &&
          this.cellsInShape[ny][nx]
        ) {
          // Remove wall between (x, y) and (nx, ny)
          // Bitwise operations are used here for efficient maze representation:
          // 1. (1 << dir) creates a bit mask where only the bit at position 'dir' is set to 1
          // 2. The bitwise OR assignment (|=) sets that specific bit in the cell's value
          // 3. This compact representation uses a single number to store the state of all four walls
          //    (0=top, 1=right, 2=bottom, 3=left), which is more memory-efficient than using
          //    four separate boolean values or an array
          maze[y][x] |= 1 << dir
          maze[ny][nx] |= 1 << (dir + 2) % 4
          carve(nx, ny)
        }
      }
    }

    // Start carving from the start position
    carve(this.start.x, this.start.y)

    // Check for orphaned cells and connect them to the main maze
    let connectivityAttempts = 0
    const maxAttempts = 10 // Limit the number of attempts to prevent infinite loops

    // First try the sophisticated cluster-based approach
    while (!checkConnectivity() && connectivityAttempts < maxAttempts) {
      connectivityAttempts++
      // Find all cells that are part of the shape but not visited
      const orphanedCells: [number, number][] = []
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (this.cellsInShape[y][x] && !isPartOfMaze[y][x]) {
            orphanedCells.push([x, y])
          }
        }
      }

      if (orphanedCells.length === 0) {
        break // No more orphaned cells, but connectivity check failed - shouldn't happen
      }

      // Process orphaned cells in clusters
      // First, identify clusters of connected orphaned cells
      const clusterMap = Array.from({ length: rows }, () =>
        Array(cols).fill(-1)
      )
      let clusterCount = 0

      // Function to identify clusters using flood fill
      const identifyCluster = (x: number, y: number, clusterId: number) => {
        const queue: [number, number][] = [[x, y]]
        clusterMap[y][x] = clusterId

        while (queue.length > 0) {
          const [cx, cy] = queue.shift()!

          for (let dir = 0; dir < 4; dir++) {
            const nx = cx + DX[dir]
            const ny = cy + DY[dir]

            if (
              nx >= 0 &&
              nx < cols &&
              ny >= 0 &&
              ny < rows &&
              this.cellsInShape[ny][nx] &&
              !isPartOfMaze[ny][nx] &&
              clusterMap[ny][nx] === -1
            ) {
              clusterMap[ny][nx] = clusterId
              queue.push([nx, ny])
            }
          }
        }
      }

      // Identify all clusters
      for (const [x, y] of orphanedCells) {
        if (clusterMap[y][x] === -1) {
          identifyCluster(x, y, clusterCount++)
        }
      }

      // For each cluster, find the nearest connected cell and connect it
      for (let clusterId = 0; clusterId < clusterCount; clusterId++) {
        // Get all cells in this cluster
        const clusterCells: [number, number][] = []
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            if (clusterMap[y][x] === clusterId) {
              clusterCells.push([x, y])
            }
          }
        }

        // Find the nearest connected cell to any cell in this cluster
        let bestDistance = Infinity
        let bestConnection: [number, number, number, number] | null = null // [clusterX, clusterY, connectedX, connectedY]

        for (const [clusterX, clusterY] of clusterCells) {
          // BFS to find the nearest connected cell
          const cellQueue: [number, number, number][] = [] // [x, y, distance]
          const cellVisited = Array.from({ length: rows }, () =>
            Array(cols).fill(false)
          )

          cellQueue.push([clusterX, clusterY, 0])
          cellVisited[clusterY][clusterX] = true

          while (cellQueue.length > 0) {
            const [cx, cy, dist] = cellQueue.shift()!

            // Check if this is a connected cell
            if (isPartOfMaze[cy][cx] && visited[cy][cx]) {
              if (dist < bestDistance) {
                bestDistance = dist
                bestConnection = [clusterX, clusterY, cx, cy]
              }
              break // Found the nearest connected cell for this cluster cell
            }

            // Continue BFS
            for (let dir = 0; dir < 4; dir++) {
              const nx = cx + DX[dir]
              const ny = cy + DY[dir]

              if (
                nx >= 0 &&
                nx < cols &&
                ny >= 0 &&
                ny < rows &&
                !cellVisited[ny][nx]
              ) {
                cellQueue.push([nx, ny, dist + 1])
                cellVisited[ny][nx] = true
              }
            }
          }
        }

        // Connect the cluster to the main maze
        if (bestConnection) {
          const [clusterX, clusterY, connectedX, connectedY] = bestConnection

          // Find a path from the cluster cell to the connected cell
          const pathQueue: [number, number, number[][]][] = [] // [x, y, path]
          const pathVisited = Array.from({ length: rows }, () =>
            Array(cols).fill(false)
          )

          pathQueue.push([clusterX, clusterY, [[clusterX, clusterY]]])
          pathVisited[clusterY][clusterX] = true

          while (pathQueue.length > 0) {
            const [cx, cy, path] = pathQueue.shift()!

            if (cx === connectedX && cy === connectedY) {
              // Found the path, now carve it
              for (let i = 0; i < path.length - 1; i++) {
                const [x1, y1] = path[i]
                const [x2, y2] = path[i + 1]

                // Determine direction
                for (let dir = 0; dir < 4; dir++) {
                  if (x1 + DX[dir] === x2 && y1 + DY[dir] === y2) {
                    maze[y1][x1] |= 1 << dir
                    maze[y2][x2] |= 1 << (dir + 2) % 4
                    break
                  }
                }

                // Mark cells as part of the maze
                isPartOfMaze[y1][x1] = true
                isPartOfMaze[y2][x2] = true
                visited[y1][x1] = true
                visited[y2][x2] = true
              }
              break
            }

            // Continue BFS
            for (let dir = 0; dir < 4; dir++) {
              const nx = cx + DX[dir]
              const ny = cy + DY[dir]

              if (
                nx >= 0 &&
                nx < cols &&
                ny >= 0 &&
                ny < rows &&
                !pathVisited[ny][nx]
              ) {
                const newPath = [...path, [nx, ny]]
                pathQueue.push([nx, ny, newPath])
                pathVisited[ny][nx] = true
              }
            }
          }
        }
      }

      // Don't automatically mark all orphaned cells as part of the maze
      // Only cells that were actually connected through the path finding should be marked
      // The rest will be handled in the next iteration of the while loop
    }

    // If we still have orphaned cells after max attempts, use a simpler approach
    // to forcibly connect any remaining orphaned cells
    if (!checkConnectivity()) {
      console.log(
        'Using fallback connectivity method for remaining orphaned cells'
      )

      // Find all remaining orphaned cells
      const remainingOrphans: [number, number][] = []
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (this.cellsInShape[y][x] && !isPartOfMaze[y][x]) {
            remainingOrphans.push([x, y])
            isPartOfMaze[y][x] = true // Mark as part of maze
          }
        }
      }

      // For each orphaned cell, connect it directly to the nearest accessible cell
      for (const [x, y] of remainingOrphans) {
        // BFS to find the nearest accessible cell
        const queue: [number, number, number[][]][] = [] // [x, y, path]
        const visited = Array.from({ length: rows }, () =>
          Array(cols).fill(false)
        )

        queue.push([x, y, [[x, y]]])
        visited[y][x] = true

        let foundPath = false

        while (queue.length > 0 && !foundPath) {
          const [cx, cy, path] = queue.shift()!

          // Check if this cell is already connected to the maze
          if (cx !== x || cy !== y) {
            // Skip the starting cell
            if (isPartOfMaze[cy][cx] && visited[cy][cx]) {
              // Found a connected cell, carve a path to it
              for (let i = 0; i < path.length - 1; i++) {
                const [x1, y1] = path[i]
                const [x2, y2] = path[i + 1]

                // Determine direction
                for (let dir = 0; dir < 4; dir++) {
                  if (x1 + DX[dir] === x2 && y1 + DY[dir] === y2) {
                    maze[y1][x1] |= 1 << dir
                    maze[y2][x2] |= 1 << (dir + 2) % 4
                    break
                  }
                }
              }

              foundPath = true
              break
            }
          }

          // Continue BFS
          for (let dir = 0; dir < 4; dir++) {
            const nx = cx + DX[dir]
            const ny = cy + DY[dir]

            if (
              nx >= 0 &&
              nx < cols &&
              ny >= 0 &&
              ny < rows &&
              !visited[ny][nx]
            ) {
              const newPath = [...path, [nx, ny]]
              queue.push([nx, ny, newPath])
              visited[ny][nx] = true
            }
          }
        }
      }
    }

    // Ensure every cell has at least one exit
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (this.cellsInShape[y][x] && maze[y][x] === 0) {
          // This cell has no exits, create at least one
          const possibleExits = []

          // Check all four directions for valid exits
          for (let dir = 0; dir < 4; dir++) {
            const nx = x + DX[dir]
            const ny = y + DY[dir]

            // Check if the neighboring cell is valid and part of the shape
            if (
              nx >= 0 &&
              nx < cols &&
              ny >= 0 &&
              ny < rows &&
              this.cellsInShape[ny][nx]
            ) {
              possibleExits.push(dir)
            }
          }

          if (possibleExits.length > 0) {
            // Randomly select one direction to create an exit
            const randomDir =
              possibleExits[Math.floor(Math.random() * possibleExits.length)]
            const nx = x + DX[randomDir]
            const ny = y + DY[randomDir]

            // Remove the wall between current cell and the selected neighbor
            maze[y][x] |= 1 << randomDir
            maze[ny][nx] |= 1 << (randomDir + 2) % 4 // Opposite direction
          }
        }
      }
    }

    // Ensure all cells are reachable from the starting point
    this.ensureReachableCells()

    // Ensure there's a path from start to end
    if (!findPath(this.start.x, this.start.y, this.end.x, this.end.y)) {
      console.log('No path found from start to end, creating one...')

      // Create a direct path from start to end if no path exists
      const pathQueue: [number, number, number[][]][] = [] // [x, y, path]
      const pathVisited = Array.from({ length: rows }, () =>
        Array(cols).fill(false)
      )

      pathQueue.push([
        this.start.x,
        this.start.y,
        [[this.start.x, this.start.y]]
      ])
      pathVisited[this.start.y][this.start.x] = true

      while (pathQueue.length > 0) {
        const [cx, cy, path] = pathQueue.shift()!

        if (cx === this.end.x && cy === this.end.y) {
          // Found a path, carve it
          for (let i = 0; i < path.length - 1; i++) {
            const [x1, y1] = path[i]
            const [x2, y2] = path[i + 1]

            // Determine direction
            for (let dir = 0; dir < 4; dir++) {
              if (x1 + DX[dir] === x2 && y1 + DY[dir] === y2) {
                maze[y1][x1] |= 1 << dir
                maze[y2][x2] |= 1 << (dir + 2) % 4
                break
              }
            }
          }
          break
        }

        // Continue BFS
        for (let dir = 0; dir < 4; dir++) {
          const nx = cx + DX[dir]
          const ny = cy + DY[dir]

          if (
            nx >= 0 &&
            nx < cols &&
            ny >= 0 &&
            ny < rows &&
            this.cellsInShape[ny][nx] &&
            !pathVisited[ny][nx]
          ) {
            const newPath = [...path, [nx, ny]]
            pathQueue.push([nx, ny, newPath])
            pathVisited[ny][nx] = true
          }
        }
      }
    }

    // Ensure the exit cell is inside a valid cell
    if (!this.isValidCell(this.end.x, this.end.y)) {
      console.log('Exit cell is not valid, finding a new one...')

      // Get valid cells that are part of the shape
      const validCells = this.getValidCellsInShape()

      if (validCells.length > 0) {
        // Pick a random valid cell different from the start
        const validExits = validCells.filter(
          cell => !(cell.x === this.start.x && cell.y === this.start.y)
        )

        if (validExits.length > 0) {
          const exitIdx = Math.floor(Math.random() * validExits.length)
          this.end = { ...validExits[exitIdx] }
        } else if (validCells.length > 0) {
          // If no valid cells other than start, just pick any valid cell
          // (not ideal but better than an invalid exit)
          const exitIdx = Math.floor(Math.random() * validCells.length)
          this.end = { ...validCells[exitIdx] }
        }
      }
    }

    return maze
  }

  render() {
    const graphics = this.scene.add.graphics()

    // First render any cells that are not part of the shape with a light background
    graphics.fillStyle(COLOR_EMPTY, 0.5)
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (!this.cellsInShape[y][x]) {
          graphics.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE)
        }
      }
    }

    // Then render walls only for cells that are part of the shape
    graphics.lineStyle(2, COLOR_MAZE, 1)
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        // Skip cells that are not part of the shape
        if (!this.cellsInShape[y][x]) {
          continue
        }

        const cell = this.grid[y][x]

        // Bitwise operations are used here for efficient wall rendering:
        // Each cell stores wall information as bits in a single number:
        // - Bit 0 (value 1): passage to the top
        // - Bit 1 (value 2): passage to the right
        // - Bit 2 (value 4): passage to the bottom
        // - Bit 3 (value 8): passage to the left
        // Using bitwise AND (&) with these values checks if the corresponding passage exists
        // The NOT operator (!) inverts the result to check for walls instead of passages

        // Top wall - draw if cell has a top wall or if the cell above is not part of the shape
        const hasTopPassage = cell & 1
        if (!hasTopPassage || y === 0 || !this.cellsInShape[y - 1][x]) {
          graphics.beginPath()
          graphics.moveTo(x * GRID_SIZE, y * GRID_SIZE)
          graphics.lineTo((x + 1) * GRID_SIZE, y * GRID_SIZE)
          graphics.strokePath()
        }

        // Right wall - draw if cell has a right wall or if the cell to the right is not part of the shape
        const hasRightPassage = cell & 2
        if (
          !hasRightPassage ||
          x === this.cols - 1 ||
          !this.cellsInShape[y][x + 1]
        ) {
          graphics.beginPath()
          graphics.moveTo((x + 1) * GRID_SIZE, y * GRID_SIZE)
          graphics.lineTo((x + 1) * GRID_SIZE, (y + 1) * GRID_SIZE)
          graphics.strokePath()
        }

        // Bottom wall - draw if cell has a bottom wall or if the cell below is not part of the shape
        const hasBottomPassage = cell & 4
        if (
          !hasBottomPassage ||
          y === this.rows - 1 ||
          !this.cellsInShape[y + 1][x]
        ) {
          graphics.beginPath()
          graphics.moveTo(x * GRID_SIZE, (y + 1) * GRID_SIZE)
          graphics.lineTo((x + 1) * GRID_SIZE, (y + 1) * GRID_SIZE)
          graphics.strokePath()
        }

        // Left wall - draw if cell has a left wall or if the cell to the left is not part of the shape
        const hasLeftPassage = cell & 8
        if (!hasLeftPassage || x === 0 || !this.cellsInShape[y][x - 1]) {
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
    return (
      x >= 0 &&
      x < this.cols &&
      y >= 0 &&
      y < this.rows &&
      this.cellsInShape[y][x]
    )
  }

  // Helper to check if a wall exists between two cells
  hasWall(fromX: number, fromY: number, toX: number, toY: number): boolean {
    // Make sure we're moving to an adjacent cell
    if (Math.abs(fromX - toX) + Math.abs(fromY - toY) !== 1) {
      return true
    }

    // Check for walls in each direction
    // Bitwise operations are used here for efficient wall checking:
    // 1. The bitwise AND (&) with a specific bit mask (1, 2, 4, or 8) checks if that bit is set
    // 2. This is more efficient than storing wall information in separate variables or arrays
    // 3. The NOT operator (!) inverts the result because a set bit means a passage (no wall)
    //    while we want to return true if there IS a wall
    if (toX > fromX) {
      // Moving right, check for right wall (bit 1, value 2)
      const hasRightPassage = this.grid[fromY][fromX] & 2
      return !hasRightPassage
    } else if (toX < fromX) {
      // Moving left, check for left wall (bit 3, value 8)
      const hasLeftPassage = this.grid[fromY][fromX] & 8
      return !hasLeftPassage
    } else if (toY > fromY) {
      // Moving down, check for bottom wall (bit 2, value 4)
      const hasBottomPassage = this.grid[fromY][fromX] & 4
      return !hasBottomPassage
    } else {
      // Moving up, check for top wall (bit 0, value 1)
      const hasTopPassage = this.grid[fromY][fromX] & 1
      return !hasTopPassage
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
