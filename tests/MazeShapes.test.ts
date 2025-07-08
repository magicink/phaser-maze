import { MazeShapes } from '@/lib/maze/MazeShapes'

describe('MazeShapes.expandShape', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('expands shape to the desired cell count', () => {
    const shape = [
      [true, false],
      [false, false]
    ]
    jest.spyOn(Math, 'random').mockReturnValue(0)
    const result = MazeShapes.expandShape(shape, 2, 2, 3)
    const count = result.flat().filter(c => c).length
    expect(count).toBe(3)
  })
})
