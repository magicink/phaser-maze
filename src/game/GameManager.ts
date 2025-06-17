import { EventBus } from '@/lib/shared/EventBus'

export class GameManager {
  private static instance: GameManager
  private stepCount: number = 0

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  /**
   * Get the singleton instance of GameManager
   */
  public static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager()
    }
    return GameManager.instance
  }

  /**
   * Increment the step count by 1
   */
  public incrementSteps(): void {
    this.stepCount++
    // Emit an event with the updated step count
    EventBus.emit(EVENT_STEP_COUNT_UPDATED, this.stepCount)
  }

  /**
   * Reset the step count to 0
   */
  public resetSteps(): void {
    this.stepCount = 0
    // Emit an event with the reset step count
    EventBus.emit(EVENT_STEP_COUNT_UPDATED, this.stepCount)
  }

  /**
   * Get the current step count
   */
  public getStepCount(): number {
    return this.stepCount
  }
}
