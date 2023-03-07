import { Agent } from './agent'
import { update } from './engine'
import { logger } from './logger'
import { type IEligibilityStatus, findEligibilityStatus } from './common'
import type { IAgent, IBenefitTaskConfiguration } from './types'

class BenefitEligibilityUpdateAgent extends Agent implements IAgent {
  private async updateEligibilityStatus(current: IEligibilityStatus, target: IEligibilityStatus, location: string): Promise<void> {

    const queries: string[] = []

    if (current.eligible) {
      queries.push(`
        PREFIX social: <https://a-solid.ilabt.imec.be/vocabulary#>

        DELETE DATA {
          <${current.id}> social:isSocialTariffEligible ${current.eligible} .
        }
      `)
    }

    queries.push(`
      PREFIX social: <https://a-solid.ilabt.imec.be/vocabulary#>

      INSERT DATA {
        <${current.id}> social:isSocialTariffEligible ${target.eligible} .
      }
    `)

    for (const query of queries) {
      await update(location, query)
    }
  }

  public async execute(task: IBenefitTaskConfiguration): Promise<void> {
    const rules = await this.request(task.rules)
    const data = await this.request(task.input)
    const reasoningResult = await this.reason(data, rules)

    const targetStatus = await findEligibilityStatus(reasoningResult) ?? { id: task.webid }
    targetStatus.eligible = targetStatus.eligible ?? 'false' // target should never be undefined!

    const currentStatus = await findEligibilityStatus(task.output) ?? { id: targetStatus.id }

    logger.info(`Current eligibility: <${currentStatus.id}> ${currentStatus.eligible}`)
    logger.info(`Target eligibility: <${targetStatus.id}> ${targetStatus.eligible}`)

    if (targetStatus.eligible !== currentStatus.eligible) {
      logger.info(`Update: <${currentStatus.id}> ${currentStatus.eligible} -> ${targetStatus.eligible}`)
      await this.updateEligibilityStatus(currentStatus, targetStatus, task.output)
    } else {
      logger.info('No update needed')
    }
  }
}

export { BenefitEligibilityUpdateAgent }
