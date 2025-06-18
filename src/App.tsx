import React, { useRef, useState, useEffect } from 'react'
import { IRefPhaserGame, PhaserGame } from './game/PhaserGame'
import { EventBus } from './lib/shared/EventBus'
import {
  EVENT_STEP_COUNT_UPDATED,
  EVENT_LEVEL_UPDATED
} from './lib/shared/EventBusEvents'

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

  return (
    <div id='app'>
      <div
        className='game-stats'
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          padding: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          borderRadius: '5px',
          fontFamily: 'Arial, sans-serif',
          zIndex: 100,
          display: 'flex',
          gap: '15px'
        }}
      >
        <div className='level-counter'>Level: {level}</div>
        <div className='step-counter'>Steps: {stepCount}</div>
      </div>
      <PhaserGame ref={phaserRef} />
    </div>
  )
}

export default App
