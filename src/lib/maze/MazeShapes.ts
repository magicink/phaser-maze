/**
 * MazeShapes.ts
 *
 * A library for generating different shapes for mazes.
 */

export class MazeShapes {
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
        // Calculate distance from center with some noise
        const dx = x - centerX
        const dy = y - centerY
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Add some noise to create an irregular blob
        const noise = Math.random() * radius * 0.3

        // Include cell if it's within the noisy radius
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
      const protrustionLength = radius * (Math.random() * 0.5 + 0.5)
      const protrustionWidth = radius * (Math.random() * 0.3 + 0.1)

      const dirX = Math.cos(angle)
      const dirY = Math.sin(angle)

      for (let j = 0; j < protrustionLength; j++) {
        const x = Math.floor(centerX + dirX * j)
        const y = Math.floor(centerY + dirY * j)

        if (x >= 0 && x < cols && y >= 0 && y < rows) {
          // Add cells around the protrusion line
          for (let dx = -protrustionWidth; dx <= protrustionWidth; dx++) {
            for (let dy = -protrustionWidth; dy <= protrustionWidth; dy++) {
              const nx = Math.floor(x + dx)
              const ny = Math.floor(y + dy)

              if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                const distToLine = Math.abs(dx * dirY - dy * dirX)
                if (distToLine <= protrustionWidth) {
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
}
