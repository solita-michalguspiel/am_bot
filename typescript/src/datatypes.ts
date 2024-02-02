export interface BotConfig {
  username: string,
  playerId: string,
  serverUrl: string
}

export interface Position {
  x: number,
  y: number
}

type PlayerStatus = 'normal' | 'immune'

export interface GameState {
  playerId: string,
  direction: Direction,
  position: Position,
  playerStatus: PlayerStatus,
  obstaclesX: number[],
  collectiblesX: number[]
  scene: Scene
}

export enum Direction {
  Right = "R",
  Left = "L",
  Up = "U",
  Down = "D",
  StopSteering = "S"
}

export enum Scene {
  Preload = "preload",
  Race = "race",
  End = "end"
}
