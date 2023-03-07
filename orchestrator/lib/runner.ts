import * as commandLineArgs from 'command-line-args'
import * as commandLineUsage from 'command-line-usage'
import { readJson } from 'fs-extra'
import type { IConfiguration, IAgent, IAgentConfiguration } from './types'
import { logger, logLevel } from './logger'
import { BenefitEligibilityUpdateAgent } from './benefits'
import { InvoiceGenerationAgent } from './invoices'

const options: commandLineUsage.OptionDefinition[] = [
  { name: 'config', alias: 'c', description: 'Path to orchestrator config JSON', type: String },
  { name: 'debug', alias: 'd', description: 'Set log level to debug', type: Boolean },
  { name: 'help', alias: 'h', description: 'Show usage instructions', type: Boolean }
]

const usage: commandLineUsage.Section[] = [
  {
    header: 'A-Solid Orchestrator Runner',
    content: 'Command line utility to run A-Solid orchestrators'
  },
  {
    header: 'Options',
    optionList: options
  }
]

async function loadConfiguration(path: string): Promise<IConfiguration> {
  return await readJson(path)
}


function createAgent(agent: string, config: IAgentConfiguration): IAgent {
  switch(agent) {
    case 'BenefitEligibilityUpdateAgent':
      return new BenefitEligibilityUpdateAgent(config)
    case 'InvoiceGenerationAgent':
      return new InvoiceGenerationAgent(config)
    default:
      throw new Error(`Invalid agent "${agent}"`)
  }
}

async function executeTasksFromConfiguration(path: string): Promise<void> {
  const configuration: IConfiguration = await loadConfiguration(path)
  const agent: IAgent = createAgent(configuration.agent, configuration.config)
  logger.info(`Executing ${configuration.tasks.length} tasks`)
  for (let i=0; i<configuration.tasks.length; i++) {
    logger.info(`Task ${i + 1} / ${configuration.tasks.length}`)
    await agent.execute(configuration.tasks[i])
  }
}

function run(): void {
  const args: Record<string, string> = commandLineArgs(options)
  if (args.debug) {
    logger.settings.minLevel = logLevel.debug
  }
  if (!args.help && args.config) {
    logger.info(`Execute from configuration: ${args.config}`)
    executeTasksFromConfiguration(args.config)
      .then(() => logger.info('Finished'))
      .catch((reason) => logger.fatal(reason))
      .finally(() => process.exit())
  } else {
    const help = commandLineUsage(usage)
    console.log(help)
  }
}

export { run }
