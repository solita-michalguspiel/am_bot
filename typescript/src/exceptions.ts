import { Logger } from './Logger'
export class ConnectionError extends Error{
  constructor(msg: string) {
    super(msg)
    Object.setPrototypeOf(this, ConnectionError.prototype);
  }
}

export class HttpException extends Error{
  constructor(msg: string, body: string, url: string, code: number) {
    super(msg)
    this.body = body
    this.code = code
    this.url = url
    Object.setPrototypeOf(this, HttpException.prototype);
  }
  body: string
  code: number
  url: string
}

export function handleExceptions(e: unknown, logger: Logger){
  if(e instanceof Error){
    switch(e.constructor){
      case ConnectionError:
        logger.error(e.stack)
        break
      case HttpException: {
        logger.error(`${e.message}. Url: ${(e as HttpException).url}. Http Code ${(e as HttpException).code}. Server response: `)
        logger.error((e as HttpException).body)
        break
      }
      default:
        throw e
    }
  }
}