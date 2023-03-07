import { Logger } from 'tslog'

const logLevel: Record<string, number> = {
  silly: 0,
  trace: 1,
  debug: 2,
  info: 3,
  warn: 4,
  error: 5,
  fatal: 6
}

const logger = new Logger()

logger.settings.minLevel =  logLevel.info
logger.settings.type = 'pretty'
logger.settings.name = 'DefaultLog'

export { logger, logLevel }
