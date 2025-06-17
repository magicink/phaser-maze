import React, { useRef, useState, useEffect } from 'react'
import { IRefPhaserGame, PhaserGame } from './game/PhaserGame'
import { EventBus } from './lib/shared/EventBus'

function App() {
  const phaserRef = useRef<IRefPhaserGame | null>(null)
  const [stepCount, setStepCount] = useState<number>(0)

  useEffect(() => {
    // Listen for step count updates from the game
    const handleStepCountUpdate = (count: number) => {
      setStepCount(count)
    }

    EventBus.on('step-count-updated', handleStepCountUpdate)

    // Clean up the event listener when component unmounts
    return () => {
      EventBus.removeListener('step-count-updated', handleStepCountUpdate)
    }
  }, [])

  return (
    <div id='app'>
      <div
        className='step-counter'
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          padding: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          borderRadius: '5px',
          fontFamily: 'Arial, sans-serif',
          zIndex: 100
        }}
      >
        Steps: {stepCount}
      </div>
      <PhaserGame ref={phaserRef} />
    </div>
  )
}

export default App
