import { EventBus } from '@/lib/shared/EventBus'
import {
  EVENT_STEP_COUNT_UPDATED,
  EVENT_LEVEL_UPDATED
} from '@/lib/shared/EventBusEvents'

export class GameManager {
  private static instance: GameManager
  private stepCount: number = 0
  private level: number = 1

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

  /**
   * Get the current level
   */
  public getLevel(): number {
    return this.level
  }

  /**
   * Increment the level by 1 when a maze is completed
   */
  public incrementLevel(): void {
    this.level++
    // Emit an event with the updated level
    EventBus.emit(EVENT_LEVEL_UPDATED, this.level)
  }

  /**
   * Reset the level back to 1 (e.g., when restarting the game)
   */
  public resetLevel(): void {
    this.level = 1
    // Emit an event with the reset level
    EventBus.emit(EVENT_LEVEL_UPDATED, this.level)
  }
}
