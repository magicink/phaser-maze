import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react'
import StartGame from './main'

import { EventBus } from '@/lib/shared/EventBus'
import { EVENT_CURRENT_SCENE_READY } from '@/lib/shared/EventBusEvents'

export interface IRefPhaserGame {
  game: Phaser.Game | null
  scene: Phaser.Scene | null
}

export const PhaserGame = forwardRef<
  IRefPhaserGame,
  {
    currentActiveScene?: (scene_instance: Phaser.Scene) => void
  }
>(({ currentActiveScene }, ref) => {
  const game = useRef<Phaser.Game | null>(null!)

  useLayoutEffect(() => {
    if (game.current === null) {
      game.current = StartGame('game-container')

      if (typeof ref === 'function') {
        ref({ game: game.current, scene: null })
      } else if (ref) {
        ref.current = { game: game.current, scene: null }
      }
    }

    return () => {
      if (game.current) {
        game.current.destroy(true)
        if (game.current) {
          game.current = null
        }
      }
    }
  }, [ref])

  useEffect(() => {
    EventBus.on(EVENT_CURRENT_SCENE_READY, (scene_instance: Phaser.Scene) => {
      if (currentActiveScene && typeof currentActiveScene === 'function') {
        currentActiveScene(scene_instance)
      }

      if (typeof ref === 'function') {
        ref({ game: game.current, scene: scene_instance })
      } else if (ref) {
        ref.current = { game: game.current, scene: scene_instance }
      }
    })
    return () => {
      EventBus.removeListener(EVENT_CURRENT_SCENE_READY)
    }
  }, [currentActiveScene, ref])

  return <div id='game-container'></div>
})
