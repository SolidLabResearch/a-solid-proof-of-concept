import { getReasonPhrase } from 'http-status-codes'
import { session, login } from './session'
import { logger } from './logger'
import type { IAgent, IAgentConfiguration, ITaskConfiguration } from './types'

abstract class Agent implements IAgent {

  private readonly name: string
  private readonly email: string
  private readonly idp: string
  private readonly password: string
  private readonly reasoner: string

  constructor(args: IAgentConfiguration) {
    this.name = args.name
    this.email = args.email
    this.idp = args.idp
    this.password = args.password
    this.reasoner = args.reasoner
    logger.info(`Orchestrator "${this.name}"`)
  }

  protected async request(url: string, init?: RequestInit, acceptStatus = 200): Promise<string> {
    if (!session.info.isLoggedIn) {
      await login(this.idp, this.email, this.password, this.name)
    }
    logger.info(`${init?.method ?? 'GET'} ${url}`)
    const response: Response = await session.fetch(url, init)
    if (response.status !== acceptStatus) {
      throw new Error(`Error sending ${init?.method ?? 'GET'} to ${url}: ${response.status} ${getReasonPhrase(response.status)}`)
    }
    return await response.text()
  }

  protected async reason(data: string, rules: string): Promise<string> {
    logger.info(`Send reasoning request to: ${this.reasoner}`)
    logger.debug('Reasoning data:', data)
    logger.debug('Reasoning rules:', rules)
    const result: string = await this.request(this.reasoner, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ data: [ data ], query: [ rules ], pass: false })
    })
    logger.debug('Reasoning result:', result)
    return result
  }

  public abstract execute(task: ITaskConfiguration): Promise<void>
}

export { Agent }
