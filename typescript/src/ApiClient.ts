import { ConnectionError, HttpException } from './exceptions'
import { Direction, GameState } from './datatypes'
export interface RegisterResponse {
  username: string,
  playerId: string
}

export interface ApiClientConfig {
  username: string,
  playerId: string,
  serverUrl: string
}

export class ApiClient{
  constructor(config: ApiClientConfig){
    this.config = config
  }
  config: ApiClientConfig
  static async makeRequest(method: string, url: string,  body: string) {
    let res: Response | null
    try{
      res = await fetch(url, {
        headers: { 'Content-Type': 'application/json'},
        method,
        body
      })
    }
    catch(e: unknown){
      if(e instanceof Error){
        throw new ConnectionError(`Unable to send request to url ${url}. ${e.message}`)
      }
      else{
        throw new ConnectionError(`Unable to send register request to url ${url}.`)
      }
    }
    return res
  }
  static async register(username: string, registerUrl: string){
    const body = JSON.stringify({
      username: username,
    })
    const res = await this.makeRequest('POST', registerUrl, body)
    if(res.status >= 400){
      throw new HttpException("Error when registering user", await res.text(), res.url, res.status)
    }
    return await res.json() as RegisterResponse
  }

  async continue(){
    let res = await ApiClient.makeRequest('POST', `${this.config.serverUrl}/continue`, JSON.stringify({
      playerId: this.config.playerId
    }))
    if(res.status >= 400){
      throw new HttpException("Error when trying to continue", await res.text(), res.url, res.status)
    }
  }

  async move(direction: Direction){
    const url = this.config.serverUrl
    const playerId = this.config.playerId
    let res = await ApiClient.makeRequest('POST', `${url}/move`, JSON.stringify({
      playerId,
      direction
    }))
    if(res.status >= 400){
      throw new HttpException("Error when moving user", await res.text(), res.url, res.status)
    }
    return await res.json() as GameState
  }
  async testConnection(){
    let gameState: GameState
    try{
      gameState = await this.move(Direction.StopSteering)
    }
    catch(e){
      const errorMsg = `Unable to connect to ${this.config.serverUrl} using playerId ${this.config.playerId} (${this.config.username})`
      if(e instanceof HttpException){
        throw new HttpException(errorMsg, e.body, e.url, e.code)
      }
      throw new ConnectionError(errorMsg)
    }
    return gameState
  }
}