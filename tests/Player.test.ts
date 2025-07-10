import type { Maze } from '@/game/Maze'
import { MOVE_THROTTLE_MS } from '@/game/constants'
import type { GameManager as GameManagerType } from '@/game/GameManager'

// Mock Phaser to avoid initializing the full engine during tests
jest.mock('phaser', () => ({
  default: { GameObjects: { Rectangle: class { setOrigin() {}; setDepth() {}; destroy() {}; setPosition() {}; x = 0; y = 0 } } },
  Events: { EventEmitter: class { emit() {}; on() {}; removeListener() {} } }
}))

jest.useFakeTimers()

describe('Player movement', () => {
  let scene: any
  let maze: jest.Mocked<Maze>
  let incrementSteps: jest.Mock
  let player: any
  let PlayerCtor: any

  beforeEach(async () => {
    scene = {
      scale: { width: 64, height: 64 },
      add: {
        rectangle: jest.fn().mockReturnValue({
          setOrigin: jest.fn(),
          setDepth: jest.fn(),
          destroy: jest.fn(),
          setPosition: jest.fn(),
          x: 0,
          y: 0
        })
      },
      tweens: { add: jest.fn() },
      time: { delayedCall: jest.fn() },
      scene: { get: jest.fn(), restart: jest.fn() }
    }

    maze = {
      isMoveAllowed: jest.fn().mockReturnValue(true),
      getEnd: jest.fn().mockReturnValue({ x: 99, y: 99 })
    } as unknown as jest.Mocked<Maze>

    incrementSteps = jest.fn()
    const gm = { incrementSteps } as unknown as GameManagerType
    jest.spyOn((await import('@/game/GameManager')).GameManager, 'getInstance').mockReturnValue(gm)

    const mod = await import('@/game/Player')
    PlayerCtor = mod.Player
    player = new PlayerCtor(scene)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('moves when allowed and increments steps', () => {
    expect(player.cell).toEqual({ x: 2, y: 2 })

    player.moveBy(1, 0, maze)

    expect(player.cell).toEqual({ x: 3, y: 2 })
    expect(incrementSteps).toHaveBeenCalled()
  })

  it('throttles rapid movement', () => {
    let now = MOVE_THROTTLE_MS
    jest.spyOn(Date, 'now').mockImplementation(() => now)

    player.moveBy(1, 0, maze)
    expect(player.cell).toEqual({ x: 3, y: 2 })

    now += MOVE_THROTTLE_MS - 10
    player.moveBy(1, 0, maze)
    // Cell should remain unchanged because of throttle
    expect(player.cell).toEqual({ x: 3, y: 2 })

    now += 20
    player.moveBy(1, 0, maze)
    expect(player.cell).toEqual({ x: 4, y: 2 })
  })
})
