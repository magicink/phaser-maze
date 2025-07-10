import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import type { GameManager as GameManagerType } from '@/game/GameManager'

const mockStop = jest.fn()
const mockStart = jest.fn()
const mockGetScene = jest.fn()
const mockGenerateRandomGridColor = jest.fn()

jest.mock('@/lib/shared/EventBus', () => ({
  EventBus: {
    on: jest.fn(),
    emit: jest.fn(),
    removeListener: jest.fn()
  }
}))

jest.mock('@/game/PhaserGame', () => {
  const React = require('react') as typeof import('react')
  const PhaserGame = React.forwardRef<
    { game: unknown; scene: unknown },
    Record<string, never>
  >(
    (
      _props: unknown,
      ref: React.ForwardedRef<{ game: unknown; scene: unknown }>
    ) => {
      if (typeof ref === 'function') {
        ref({
          game: {
            scene: {
              stop: mockStop,
              start: mockStart,
              getScene: mockGetScene.mockReturnValue({
                generateRandomGridColor: mockGenerateRandomGridColor
              })
            }
          },
          scene: null
        })
      } else if (ref) {
        ref.current = {
          game: {
            scene: {
              stop: mockStop,
              start: mockStart,
              getScene: mockGetScene.mockReturnValue({
                generateRandomGridColor: mockGenerateRandomGridColor
              })
            }
          },
          scene: null
        }
      }
      return React.createElement('div')
    }
  )
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
    } as unknown as GameManagerType)

    const { getByRole } = render(<App />)
    const button = getByRole('button', { name: /reset/i })

    fireEvent.click(button)

    expect(resetLevel).toHaveBeenCalled()
    expect(resetSteps).toHaveBeenCalled()
    expect(mockGetScene).toHaveBeenCalledWith('GridScene')
    expect(mockGenerateRandomGridColor).toHaveBeenCalledWith(true)
    expect(mockStop).toHaveBeenCalledWith('MazeScene')
    expect(mockStart).toHaveBeenCalledWith('MazeScene')
  })
})
