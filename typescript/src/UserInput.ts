import { createInterface, Interface } from 'readline/promises'

export class UserInput{
  constructor(){
    this.source = createInterface({
      input: process.stdin,
      output: process.stdout
    })
  }
  source: Interface
  close(){
    this.source.close()
  }
  async getLine(question: string){
    return await this.source.question(question)
  }
}