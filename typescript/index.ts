import { BotConfig } from './src/datatypes'
import { loadConfigFromFile, saveConfigToFile } from './src/util'
import { handleExceptions } from './src/exceptions'
import { Bot } from './src/Bot'
import { UserInput } from './src/UserInput'
import { ApiClient } from './src/ApiClient'
import { Logger } from './src/Logger'

const userNameRegex = /^[a-zA-Z0-9_]{2,12}$/
const configFilePath = "botconfig.json"
const input = new UserInput()
const logger = new Logger()

async function initBot(){
  let config: BotConfig | null = null
  let newRegistration = false
  try{
    config = await loadConfigFromFile(configFilePath)
    logger.log(`Player ID found! Starting with username ${config.username}`)
  }
  catch(e: unknown){
    logger.log('Player ID not found. Registering...')
    const serverUrl = await input.getLine("Enter server (base) url: ")
    const username = await getUsername()
    config = await registerPlayer(serverUrl, username)
    newRegistration = true
  }
  const apiClient = new ApiClient(config)
  logger.log("Testing connection...")
  const gameState = await apiClient.testConnection()
  logger.log("Connection ok!")
  if(newRegistration){
    try{
      await saveConfigToFile(configFilePath, config)
    }
    catch(e: unknown) {
      if (e instanceof Error) {
        logger.error(e.message)
      }
      logger.log("Could not save config to file. Save this info to botconfig.json manually to play without having to register again: ")
      logger.log(config)
    }
  }
  return new Bot(gameState, apiClient, input, logger)
}

async function getUsername(){
  let validUsername = false
  const query = "Enter username: "
  let username = await input.getLine(query)
  while(!validUsername){
    if(userNameRegex.test(username)){
      validUsername = true
    }
    else{
      logger.log("Invalid username. Username must be between 2-12 characters and only contain characters a-z, A-Z, 0-9")
      username = await input.getLine(query)
    }
  }
  return username
}

async function registerPlayer(serverUrl: string, username: string){
  const response = await ApiClient.register(username, `${serverUrl}/register`)
  const clientConfig: BotConfig = {
    ...response,
    serverUrl
  }
  return clientConfig
}

initBot()
  .then(bot => bot.start())
  .catch(e => handleExceptions(e, logger))
  .finally(() => input.close())

