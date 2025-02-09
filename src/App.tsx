import React, { useRef, useState } from 'react'
import { IRefPhaserGame, PhaserGame } from './game/PhaserGame'
import { MainMenu } from './game/scenes/MainMenu'

function App() {
  // The sprite can only be moved in the MainMenu Scene
  const [canMoveSprite, setCanMoveSprite] = useState(true)

  //  References to the PhaserGame component (game and scene are exposed)
  const phaserRef = useRef<IRefPhaserGame | null>(null)
  const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 })

  const changeScene = () => {
    if (phaserRef.current) {
      const scene = phaserRef.current.scene as MainMenu

      if (scene) {
        scene.changeScene()
      }
    }
  }

  const moveSprite = () => {
    if (phaserRef.current) {
      const scene = phaserRef.current.scene as MainMenu

      if (scene && scene.scene.key === 'MainMenu') {
        // Get the update logo position
        scene.moveLogo(({ x, y }) => {
          setSpritePosition({ x, y })
        })
      }
    }
  }

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (phaserRef.current) {
        const scene = phaserRef.current.scene as MainMenu
        if (
          scene &&
          scene.handleKeyDown &&
          scene.scene.key === 'MainMenu' &&
          scene.cursorKeys
        ) {
          if (event.key === 'ArrowRight') {
            scene.handleKeyDown(scene.cursorKeys.right)
          }
          if (event.key === 'ArrowLeft') {
            scene.handleKeyDown(scene.cursorKeys.left)
          }
          if (event.key === 'ArrowUp') {
            scene.handleKeyDown(scene.cursorKeys.up)
          }
          if (event.key === 'ArrowDown') {
            scene.handleKeyDown(scene.cursorKeys.down)
          }
        }
      }
    }
    const handleKeyUp = (event: KeyboardEvent) => {
      if (phaserRef.current) {
        const scene = phaserRef.current.scene as MainMenu
        if (scene && scene.handleKeyUp && scene.scene.key === 'MainMenu') {
          scene.handleKeyUp()
        }
      }
    }
    // add event listener to handle keydown
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    return () => {
      // remove event listener on cleanup
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const addSprite = () => {
    if (phaserRef.current) {
      const scene = phaserRef.current.scene

      if (scene) {
        // Add more stars
        const x = Phaser.Math.Between(64, scene.scale.width - 64)
        const y = Phaser.Math.Between(64, scene.scale.height - 64)

        //  `add.sprite` is a Phaser GameObjectFactory method and it returns a Sprite Game Object instance
        const star = scene.add.sprite(x, y, 'star')

        //  ... which you can then act upon. Here we create a Phaser Tween to fade the star sprite in and out.
        //  You could, of course, do this from within the Phaser Scene code, but this is just an example
        //  showing that Phaser objects and systems can be acted upon from outside of Phaser itself.
        scene.add.tween({
          targets: star,
          duration: 500 + Math.random() * 1000,
          alpha: 0,
          yoyo: true,
          repeat: -1
        })
      }
    }
  }

  // Event emitted from the PhaserGame component
  const currentScene = (scene: Phaser.Scene) => {
    setCanMoveSprite(scene.scene.key !== 'MainMenu')
  }

  return (
    <div id='app'>
      <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
      <div>
        <div>
          <button className='button' onClick={changeScene}>
            Change Scene
          </button>
        </div>
        <div className='spritePosition'>
          Sprite Position:
          <pre>{`{\n  x: ${spritePosition.x}\n  y: ${spritePosition.y}\n}`}</pre>
        </div>
        <div>
          <button className='button' onClick={addSprite}>
            Add New Sprite
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
