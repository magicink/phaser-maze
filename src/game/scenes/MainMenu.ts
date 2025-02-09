import { GameObjects, Scene } from 'phaser'

import { EventBus } from '@/lib/shared/EventBus'

export class MainMenu extends Scene {
  background: GameObjects.Image
  logo: GameObjects.Image
  title: GameObjects.Text
  logoTween: Phaser.Tweens.Tween | null
  speed: number = 10
  cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys | null | undefined

  constructor() {
    super('MainMenu')
  }

  create() {
    this.background = this.add.image(512, 384, 'background')

    this.logo = this.add.image(512, 300, 'logo').setDepth(100)

    // create cursor keys
    if (this.input?.keyboard)
      this.cursorKeys = this.input.keyboard.createCursorKeys()

    console.log('this.cursorKeys', this.cursorKeys)

    this.title = this.add
      .text(512, 460, 'Main Menu', {
        fontFamily: 'Arial Black',
        fontSize: 38,
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 8,
        align: 'center'
      })
      .setOrigin(0.5)
      .setDepth(100)

    EventBus.emit('current-scene-ready', this)
  }

  changeScene() {
    if (this.logoTween) {
      this.logoTween.stop()
      this.logoTween = null
    }

    this.scene.start('Game')
  }

  moveLogo(reactCallback: ({ x, y }: { x: number; y: number }) => void) {
    if (this.logoTween) {
      if (this.logoTween.isPlaying()) {
        this.logoTween.pause()
      } else {
        this.logoTween.play()
      }
    } else {
      this.logoTween = this.tweens.add({
        targets: this.logo,
        x: { value: 750, duration: 3000, ease: 'Back.easeInOut' },
        y: { value: 80, duration: 1500, ease: 'Sine.easeOut' },
        yoyo: true,
        repeat: -1,
        onUpdate: () => {
          if (reactCallback) {
            reactCallback({
              x: Math.floor(this.logo.x),
              y: Math.floor(this.logo.y)
            })
          }
        }
      })
    }
  }

  handleKeyDown(cursorKey: Phaser.Input.Keyboard.Key) {
    // handle cursor key press
    if (cursorKey.keyCode === 37) {
      // move left
      this.logo.x -= this.speed
    }
    if (cursorKey.keyCode === 39) {
      // move right
      this.logo.x += this.speed
    }
    if (cursorKey.keyCode === 38) {
      this.logo.y -= this.speed
    }
    if (cursorKey.keyCode === 40) {
      this.logo.y += this.speed
    }
    this.speed += 5
  }
  handleKeyUp() {
    this.speed = 10
  }
}
