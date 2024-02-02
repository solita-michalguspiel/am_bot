import { readFile, writeFile } from 'fs/promises'
import { BotConfig } from './datatypes'

export async function loadConfigFromFile(filepath: string){
  const botConfigBuf = await readFile(filepath)
  return JSON.parse(botConfigBuf.toString()) as BotConfig
}

export async function saveConfigToFile(filepath: string, config: BotConfig){
  await writeFile(filepath, JSON.stringify(config, null, 2))
}

export function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}