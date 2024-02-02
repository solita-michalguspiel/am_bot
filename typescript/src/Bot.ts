import { Direction, GameState, Scene } from './datatypes'
import { UserInput } from './UserInput'
import { ApiClient } from './ApiClient'
import { Logger } from './Logger'
import { sleep } from './util'

export class Bot {
  constructor(gameState: GameState, apiClient: ApiClient, userInput: UserInput, logger: Logger){
    this.gameState = gameState
    this.running = false
    this.apiClient = apiClient
    this.userInput = userInput
    this.logger = logger
    this.continueDone = false
    this.tickRate = 200
  }
  gameState: GameState
  running: boolean
  apiClient: ApiClient
  userInput: UserInput
  logger: Logger
  continueDone: boolean
  tickRate: number

  async update(){
    //REPLACE WITH YOUR CODE
    //*********************
    await this.move(Direction.Right)
    console.log(this.gameState)
    //*********************
  }

  async start(){
    await this.waitForGameToStart()
    this.logger.log("Game Started! Bot is racing...")
    this.running = true
    while(this.running){
      if(this.gameState.scene === Scene.End && !this.continueDone){
        await this.continueToNextGame()
      }
      else{
        this.continueDone = false
        await this.update()
        await sleep(this.tickRate)
      }
    }
  }
  async waitForGameToStart(){
    this.logger.log("Waiting for game to start...")
    while(this.gameState.scene === Scene.Preload || this.gameState.scene === Scene.End){
      this.gameState = await this.apiClient.move(Direction.StopSteering)
    }
  }

  async continueToNextGame(){
    this.logger.log("Game ended. Adding you to next game...")
    await this.apiClient.continue()
    this.logger.log("Registration to next game ok!")
    this.continueDone = true
    await this.waitForGameToStart()
    this.logger.log("Game Started! Bot is racing...")
  }

  async move(direction: Direction){
    this.gameState = await this.apiClient.move(direction)
  }
}