import Phaser from 'phaser'

const GRID_SIZE = 16
const COLOR_BG = 0xf8f9fa // Very light grey
// No base hue - we'll use the full color spectrum

export class GridScene extends Phaser.Scene {
  private gridColor: number = 0xc7d6e6 // Initial color will be randomized
  private graphics!: Phaser.GameObjects.Graphics
  constructor() {
    super({ key: 'GridScene' })
  }

  init() {
    // Initialize graphics object
    this.graphics = this.add.graphics()
    // Generate a new random color each time the scene is initialized
    this.generateRandomGridColor()
    this.drawGrid()
  }

  generateRandomGridColor(useTween = false) {
    // Generate a completely random hue (0-359)
    const hue = Phaser.Math.Between(0, 359)

    // Vary saturation and lightness, keeping colors on the lighter side
    const saturation = Phaser.Math.FloatBetween(0.3, 0.7) // 30-70% saturation
    const lightness = Phaser.Math.FloatBetween(0.5, 0.9) // 50-90% lightness for better visibility

    // HSL to RGB conversion
    const c = (1 - Math.abs(2 * lightness - 1)) * saturation
    const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
    const m = lightness - c / 2

    let r: number, g: number, b: number
    if (hue < 60) {
      ;[r, g, b] = [c, x, 0]
    } else if (hue < 120) {
      ;[r, g, b] = [x, c, 0]
    } else if (hue < 180) {
      ;[r, g, b] = [0, c, x]
    } else if (hue < 240) {
      ;[r, g, b] = [0, x, c]
    } else if (hue < 300) {
      ;[r, g, b] = [x, 0, c]
    } else {
      ;[r, g, b] = [c, 0, x]
    }

    // Convert to 0-255 range and then to hex
    const rHex = Math.floor((r + m) * 255)
    const gHex = Math.floor((g + m) * 255)
    const bHex = Math.floor((b + m) * 255)

    // Convert to 0xRRGGBB format
    // Bitwise operations are used here for efficient color composition:
    // 1. (rHex << 16) shifts the red component to the leftmost 8 bits
    // 2. (gHex << 8) shifts the green component to the middle 8 bits
    // 3. The bitwise OR (|) combines these with the blue component
    // This is more efficient than string manipulation and parseInt/toString conversions
    const newColor = (rHex << 16) | (gHex << 8) | bHex

    if (useTween) {
      // Use tweening to transition to the new color
      this.tweenToNewColor(newColor)
    } else {
      // Immediately set the new color
      this.gridColor = newColor
      // Redraw the grid with the new color
      this.drawGrid()
    }
  }

  drawGrid() {
    const width = this.scale.width
    const height = this.scale.height
    const camera = this.cameras.main
    camera.setZoom(1)
    camera.setScroll(0, 0)

    this.graphics.clear() // Clear the existing graphics
    this.graphics.fillStyle(COLOR_BG, 1)
    this.graphics.fillRect(0, 0, width, height)
    this.graphics.lineStyle(1, this.gridColor, 1)
    // Draw only lines that are fully within the canvas
    for (let x = 0; x < width; x += GRID_SIZE) {
      this.graphics.beginPath()
      this.graphics.moveTo(x, 0)
      this.graphics.lineTo(x, height)
      this.graphics.strokePath()
    }
    for (let y = 0; y < height; y += GRID_SIZE) {
      this.graphics.beginPath()
      this.graphics.moveTo(0, y)
      this.graphics.lineTo(width, y)
      this.graphics.strokePath()
    }
    // Draw the right and bottom border if not already drawn
    if (width % GRID_SIZE === 0) {
      this.graphics.beginPath()
      this.graphics.moveTo(width - 1, 0)
      this.graphics.lineTo(width - 1, height)
      this.graphics.strokePath()
    }
    if (height % GRID_SIZE === 0) {
      this.graphics.beginPath()
      this.graphics.moveTo(0, height - 1)
      this.graphics.lineTo(width, height - 1)
      this.graphics.strokePath()
    }
  }

  create() {
    // Start the MazeScene which will overlay on top of this scene
    this.scene.launch('MazeScene')
  }

  // Helper method to extract RGB components from a color
  private hexToRgb(hex: number): { r: number; g: number; b: number } {
    // Bitwise operations are used here for efficient color decomposition:
    // 1. (hex >> 16) shifts the red component from the leftmost 8 bits to the rightmost position
    // 2. (hex >> 8) shifts the green component from the middle 8 bits to the rightmost position
    // 3. The bitwise AND (&) with 0xff (255) masks out all but the lowest 8 bits
    // This is significantly more efficient than string manipulation methods like hex.toString(16)
    // and then parsing substrings, especially for real-time animations
    return {
      r: (hex >> 16) & 0xff,
      g: (hex >> 8) & 0xff,
      b: hex & 0xff
    }
  }

  // Tween from current color to a new color
  tweenToNewColor(targetColor: number) {
    // Get RGB components of current and target colors
    const currentRgb = this.hexToRgb(this.gridColor)
    const targetRgb = this.hexToRgb(targetColor)

    // Create an object to tween
    const colorObject = {
      r: currentRgb.r,
      g: currentRgb.g,
      b: currentRgb.b
    }

    // Create the tween
    this.tweens.add({
      targets: colorObject,
      r: targetRgb.r,
      g: targetRgb.g,
      b: targetRgb.b,
      duration: 1000, // 1 second duration
      ease: 'Linear',
      onUpdate: () => {
        // Update the grid color during the tween
        // Bitwise operations are used here for the same reason as in color composition:
        // 1. Shifting and combining with OR creates a compact color representation
        // 2. This is more performant than string-based hex color creation, which is
        //    critical in this animation loop that runs many times per second
        this.gridColor =
          (Math.floor(colorObject.r) << 16) |
          (Math.floor(colorObject.g) << 8) |
          Math.floor(colorObject.b)
        this.drawGrid()
      },
      onComplete: () => {
        // Ensure we end with exactly the target color
        this.gridColor = targetColor
        this.drawGrid()
      }
    })
  }
}
