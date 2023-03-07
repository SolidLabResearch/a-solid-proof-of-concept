interface IToken {
  id: string
  secret: string
  email: string
  idp: string
}

interface IAgentConfiguration {
  name: string
  email: string
  password: string
  idp: string
  reasoner: string
}

interface ITaskConfiguration {
  input: string
  output: string
  rules: string
}

interface IBenefitTaskConfiguration extends ITaskConfiguration {
  webid: string
}

interface IConfiguration {
  agent: string
  config: IAgentConfiguration
  tasks: ITaskConfiguration[]
}

interface IAgent {
  execute(task: ITaskConfiguration): Promise<void>
}

export type { IToken, IAgentConfiguration, ITaskConfiguration, IBenefitTaskConfiguration, IConfiguration, IAgent }
