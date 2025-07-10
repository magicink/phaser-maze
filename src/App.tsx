import React, { useRef, useState, useEffect } from 'react'
import { IRefPhaserGame, PhaserGame } from './game/PhaserGame'
import { EventBus } from './lib/shared/EventBus'
import {
  EVENT_STEP_COUNT_UPDATED,
  EVENT_LEVEL_UPDATED
} from './lib/shared/EventBusEvents'
import { GameManager } from './game/GameManager'

function App() {
  const phaserRef = useRef<IRefPhaserGame | null>(null)
  const [stepCount, setStepCount] = useState<number>(0)
  const [level, setLevel] = useState<number>(1)

  useEffect(() => {
    // Listen for step count updates from the game
    const handleStepCountUpdate = (count: number) => {
      setStepCount(count)
    }

    // Listen for level updates from the game
    const handleLevelUpdate = (level: number) => {
      setLevel(level)
    }

    EventBus.on(EVENT_STEP_COUNT_UPDATED, handleStepCountUpdate)
    EventBus.on(EVENT_LEVEL_UPDATED, handleLevelUpdate)

    // Clean up the event listeners when component unmounts
    return () => {
      EventBus.removeListener(EVENT_STEP_COUNT_UPDATED, handleStepCountUpdate)
      EventBus.removeListener(EVENT_LEVEL_UPDATED, handleLevelUpdate)
    }
  }, [])

  const handleReset = () => {
    const gameManager = GameManager.getInstance()
    gameManager.resetLevel()
    gameManager.resetSteps()

    const game = phaserRef.current?.game
    if (game) {
      const gridScene = game.scene.getScene('GridScene') as any
      if (
        gridScene &&
        typeof gridScene.generateRandomGridColor === 'function'
      ) {
        gridScene.generateRandomGridColor(true)
      }

      game.scene.stop('MazeScene')
      game.scene.start('MazeScene')
    }
  }

  return (
    <div id='app'>
      <div className='game-stats absolute top-2.5 left-2.5 flex items-center gap-4 p-2.5 bg-neutral-900/80 text-white rounded font-sans z-50'>
        <div className='level-counter'>Level: {level}</div>
        <div className='step-counter'>Steps: {stepCount}</div>
        <button
          className='reset-button bg-gray-700 text-white border-none rounded px-2 py-0.5 cursor-pointer'
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
      <PhaserGame ref={phaserRef} />
    </div>
  )
}

export default App
