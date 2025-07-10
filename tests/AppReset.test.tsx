import React from 'react'
import { render, fireEvent } from '@testing-library/react'

const mockStop = jest.fn()
const mockStart = jest.fn()

jest.mock('@/lib/shared/EventBus', () => ({
  EventBus: {
    on: jest.fn(),
    emit: jest.fn(),
    removeListener: jest.fn()
  }
}))

jest.mock('@/game/PhaserGame', () => {
  const React = require('react')
  const PhaserGame = React.forwardRef((props, ref) => {
    if (typeof ref === 'function') {
      ref({
        game: { scene: { stop: mockStop, start: mockStart } },
        scene: null
      })
    } else if (ref) {
      ref.current = {
        game: { scene: { stop: mockStop, start: mockStart } },
        scene: null
      }
    }
    return React.createElement('div')
  })
  return { PhaserGame, IRefPhaserGame: {} }
})

describe('App reset button', () => {
  it('resets level, steps and restarts scenes', async () => {
    const { default: App } = await import('@/App')
    const { GameManager } = await import('@/game/GameManager')

    const resetLevel = jest.fn()
    const resetSteps = jest.fn()
    jest.spyOn(GameManager, 'getInstance').mockReturnValue({
      resetLevel,
      resetSteps
    } as unknown as InstanceType<typeof GameManager>)

    const { getByRole } = render(<App />)
    const button = getByRole('button', { name: /reset/i })

    fireEvent.click(button)

    expect(resetLevel).toHaveBeenCalled()
    expect(resetSteps).toHaveBeenCalled()
    expect(mockStop).toHaveBeenCalledWith('MazeScene')
    expect(mockStop).toHaveBeenCalledWith('GridScene')
    expect(mockStart).toHaveBeenCalledWith('GridScene')
    expect(mockStart).toHaveBeenCalledWith('MazeScene')
  })
})
