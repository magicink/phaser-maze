/**
 * MazeShapes.ts
 *
 * A library for generating different shapes for mazes.
 */

export class MazeShapes {
  // Shape type constants
  static readonly SHAPE_BLOB = 'blob'
  static readonly SHAPE_PARABOLA = 'parabola'
  static readonly SHAPE_HEART = 'heart'
  static readonly SHAPE_SPIRAL = 'spiral'
  static readonly SHAPE_RANDOM = 'random'
  static readonly SHAPE_DONUT = 'donut'
  /**
   * Generate a blob-like shape (irregular circle)
   * @param rows Number of rows in the grid
   * @param cols Number of columns in the grid
   * @param centerX Center X coordinate
   * @param centerY Center Y coordinate
   * @param radius Radius of the shape
   * @returns A 2D boolean array representing the shape
   */
  static generateBlobShape(
    rows: number,
    cols: number,
    centerX: number,
    centerY: number,
    radius: number
  ): boolean[][] {
    const cellsInShape = Array.from({ length: rows }, () =>
      Array(cols).fill(false)
    )

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        // Calculate distance from the center with some noise
        const dx = x - centerX
        const dy = y - centerY
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Add some noise to create an irregular blob
        const noise = Math.random() * radius * 0.3

        // Include cell if it's within a noisy radius
        if (distance <= radius + noise) {
          cellsInShape[y][x] = true
        }
      }
    }

    return cellsInShape
  }

  /**
   * Generate a parabola shape
   * @param rows Number of rows in the grid
   * @param cols Number of columns in the grid
   * @param centerX Center X coordinate
   * @param centerY Center Y coordinate
   * @param radius Radius of the shape
   * @returns A 2D boolean array representing the shape
   */
  static generateParabolaShape(
    rows: number,
    cols: number,
    centerX: number,
    centerY: number,
    radius: number
  ): boolean[][] {
    const cellsInShape = Array.from({ length: rows }, () =>
      Array(cols).fill(false)
    )
    const a = 1 / (2 * radius) // Parabola coefficient

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        // Parabola equation: y = a(x - h)² + k
        // We're using an inverted parabola: y = -a(x - h)² + k + 2*radius
        const dx = x - centerX
        const expectedY = -a * dx * dx + centerY + radius

        // Include cells that are below the parabola curve
        if (y >= centerY - radius && y <= expectedY) {
          cellsInShape[y][x] = true
        }
      }
    }

    return cellsInShape
  }

  /**
   * Generate a heart shape
   * @param rows Number of rows in the grid
   * @param cols Number of columns in the grid
   * @param centerX Center X coordinate
   * @param centerY Center Y coordinate
   * @param radius Radius of the shape
   * @returns A 2D boolean array representing the shape
   */
  static generateHeartShape(
    rows: number,
    cols: number,
    centerX: number,
    centerY: number,
    radius: number
  ): boolean[][] {
    const cellsInShape = Array.from({ length: rows }, () =>
      Array(cols).fill(false)
    )
    const scale = radius / 2

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        // Normalize coordinates to [-2, 2] range
        const nx = (x - centerX) / scale
        const ny = (y - centerY) / scale

        // Heart curve equation: (x²+y²-1)³ - x²y³ < 0
        if (
          Math.pow(nx * nx + ny * ny - 1, 3) - nx * nx * Math.pow(ny, 3) <
          0
        ) {
          cellsInShape[y][x] = true
        }
      }
    }

    return cellsInShape
  }

  /**
   * Generate a spiral shape
   * @param rows Number of rows in the grid
   * @param cols Number of columns in the grid
   * @param centerX Center X coordinate
   * @param centerY Center Y coordinate
   * @param radius Radius of the shape
   * @returns A 2D boolean array representing the shape
   */
  static generateSpiralShape(
    rows: number,
    cols: number,
    centerX: number,
    centerY: number,
    radius: number
  ): boolean[][] {
    const cellsInShape = Array.from({ length: rows }, () =>
      Array(cols).fill(false)
    )
    const maxRadius = radius
    const turns = 2 // Number of spiral turns

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const dx = x - centerX
        const dy = y - centerY

        // Convert to polar coordinates
        const distance = Math.sqrt(dx * dx + dy * dy)
        let angle = Math.atan2(dy, dx)
        if (angle < 0) angle += 2 * Math.PI

        // Spiral equation: r = a + bθ
        const a = 0
        const b = maxRadius / (2 * Math.PI * turns)
        const spiralRadius = a + b * angle

        // Include cell if it's close to the spiral curve
        const tolerance = (b * Math.PI) / 4
        if (
          Math.abs(distance - spiralRadius) <= tolerance &&
          distance <= maxRadius
        ) {
          cellsInShape[y][x] = true
        }
      }
    }

    return cellsInShape
  }

  /**
   * Generate a random shape
   * @param rows Number of rows in the grid
   * @param cols Number of columns in the grid
   * @param centerX Center X coordinate
   * @param centerY Center Y coordinate
   * @param radius Radius of the shape
   * @returns A 2D boolean array representing the shape
   */
  static generateRandomShape(
    rows: number,
    cols: number,
    centerX: number,
    centerY: number,
    radius: number
  ): boolean[][] {
    const cellsInShape = Array.from({ length: rows }, () =>
      Array(cols).fill(false)
    )

    // Start with a circle
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const dx = x - centerX
        const dy = y - centerY
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance <= radius) {
          cellsInShape[y][x] = true
        }
      }
    }

    // Add random protrusions
    const numProtrusions = Math.floor(Math.random() * 5) + 3
    for (let i = 0; i < numProtrusions; i++) {
      const angle = Math.random() * 2 * Math.PI
      const protrusionLength = radius * (Math.random() * 0.5 + 0.5)
      const protrusionWidth = radius * (Math.random() * 0.3 + 0.1)

      const dirX = Math.cos(angle)
      const dirY = Math.sin(angle)

      for (let j = 0; j < protrusionLength; j++) {
        const x = Math.floor(centerX + dirX * j)
        const y = Math.floor(centerY + dirY * j)

        if (x >= 0 && x < cols && y >= 0 && y < rows) {
          // Add cells around the protrusion line
          for (let dx = -protrusionWidth; dx <= protrusionWidth; dx++) {
            for (let dy = -protrusionWidth; dy <= protrusionWidth; dy++) {
              const nx = Math.floor(x + dx)
              const ny = Math.floor(y + dy)

              if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                const distToLine = Math.abs(dx * dirY - dy * dirX)
                if (distToLine <= protrusionWidth) {
                  cellsInShape[ny][nx] = true
                }
              }
            }
          }
        }
      }
    }

    return cellsInShape
  }

  /**
   * Generate a donut shape
   * @param rows Number of rows in the grid
   * @param cols Number of columns in the grid
   * @param centerX Center X coordinate
   * @param centerY Center Y coordinate
   * @param radius Radius of the shape
   * @returns A 2D boolean array representing the shape
   */
  static generateDonutShape(
    rows: number,
    cols: number,
    centerX: number,
    centerY: number,
    radius: number
  ): boolean[][] {
    const cellsInShape = Array.from({ length: rows }, () =>
      Array(cols).fill(false)
    )

    // The outer radius is the provided radius
    const outerRadius = radius
    // The inner radius is a fraction of the outer radius
    const innerRadius = radius * 0.4

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        // Calculate distance from the center
        const dx = x - centerX
        const dy = y - centerY
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Add some noise to create an irregular donut
        const outerNoise = Math.random() * radius * 0.2
        const innerNoise = Math.random() * innerRadius * 0.2

        // Include cell if it's between the inner and outer radius (with noise)
        if (
          distance <= outerRadius + outerNoise &&
          distance >= innerRadius - innerNoise
        ) {
          cellsInShape[y][x] = true
        }
      }
    }

    return cellsInShape
  }

  /**
   * Expands the given shape by adding cells to it until the target cell count is reached.
   *
   * This method works by identifying the border cells of the current shape and adding
   * new cells to the shape from the border. If no border cells are found, it will attempt
   * to add cells in a spiral pattern around the existing shape.
   *
   * @param cellsInShape A 2D boolean array representing the current shape. `true` indicates
   *                     that the cell is part of the shape, and `false` indicates it is not.
   * @param rows The total number of rows in the grid.
   * @param cols The total number of columns in the grid.
   * @param targetCellCount The desired number of cells in the shape. The method will expand
   *                        the shape until this count is reached.
   * @returns A new 2D boolean array representing the expanded shape.
   */
  static expandShape(
    cellsInShape: boolean[][],
    rows: number,
    cols: number,
    targetCellCount: number
  ): boolean[][] {
    // Create a copy of the input array to avoid modifying the original
    const result = cellsInShape.map(row => [...row])

    const DX = [0, 1, 0, -1, 1, 1, -1, -1]
    const DY = [-1, 0, 1, 0, -1, 1, 1, -1]

    // Count current cells in shape
    const countCellsInShape = (): number => {
      let count = 0
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (result[y][x]) {
            count++
          }
        }
      }
      return count
    }

    // If there are no cells in the shape, add at least one
    if (countCellsInShape() === 0) {
      const centerX = Math.floor(cols / 2)
      const centerY = Math.floor(rows / 2)
      result[centerY][centerX] = true
    }

    while (countCellsInShape() < targetCellCount) {
      const borderCells: [number, number][] = []

      // Find cells at the border of the shape
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (!result[y][x]) {
            // Check if this cell is adjacent to a shape cell
            for (let dir = 0; dir < 8; dir++) {
              const nx = x + DX[dir]
              const ny = y + DY[dir]

              if (
                nx >= 0 &&
                nx < cols &&
                ny >= 0 &&
                ny < rows &&
                result[ny][nx]
              ) {
                borderCells.push([x, y])
                break
              }
            }
          }
        }
      }

      // If no border cells found but we still need more cells,
      // add cells in a spiral pattern around existing cells
      if (borderCells.length === 0) {
        // Find any existing cell
        let existingCellFound = false
        let existingX = 0,
          existingY = 0

        for (let y = 0; y < rows && !existingCellFound; y++) {
          for (let x = 0; x < cols && !existingCellFound; x++) {
            if (result[y][x]) {
              existingX = x
              existingY = y
              existingCellFound = true
              break
            }
          }
        }

        // Add a cell adjacent to the existing one
        for (let dir = 0; dir < 8 && borderCells.length === 0; dir++) {
          const nx = existingX + DX[dir]
          const ny = existingY + DY[dir]

          if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && !result[ny][nx]) {
            borderCells.push([nx, ny])
          }
        }

        // If still no border cells, just add cells in a spiral pattern from center
        if (borderCells.length === 0) {
          const centerX = Math.floor(cols / 2)
          const centerY = Math.floor(rows / 2)

          // Simple spiral pattern
          for (
            let radius = 1;
            radius < Math.max(rows, cols) && borderCells.length === 0;
            radius++
          ) {
            for (
              let dx = -radius;
              dx <= radius && borderCells.length === 0;
              dx++
            ) {
              for (
                let dy = -radius;
                dy <= radius && borderCells.length === 0;
                dy++
              ) {
                // Only consider cells on the perimeter of the square
                if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
                  const nx = centerX + dx
                  const ny = centerY + dy

                  if (
                    nx >= 0 &&
                    nx < cols &&
                    ny >= 0 &&
                    ny < rows &&
                    !result[ny][nx]
                  ) {
                    borderCells.push([nx, ny])
                  }
                }
              }
            }
          }
        }
      }

      if (borderCells.length === 0) break

      // Add a random border cell to the shape
      const idx = Math.floor(Math.random() * borderCells.length)
      const [x, y] = borderCells[idx]
      result[y][x] = true

      // Stop if we've added enough cells
      if (countCellsInShape() >= targetCellCount) break
    }

    return result
  }
}
