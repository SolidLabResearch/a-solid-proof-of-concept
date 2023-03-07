import { QueryEngineFactory } from '@comunica/query-sparql-link-traversal-solid'
import { IQueryEngine, IDataSource, IDataDestination, BindingsStream, Bindings, QueryStringContext } from '@comunica/types'
import { ActorHttpInruptSolidClientAuthn } from '@comunica/actor-http-inrupt-solid-client-authn'
import { join } from 'node:path'
import { session } from './session'
import { logger } from './logger'

type IDataSourceList = [IDataSource, ...IDataSource[]]

const factory: QueryEngineFactory = new QueryEngineFactory()
let factoryCreatedEngine: IQueryEngine | undefined

function createContext(source: string | string[], type?: string): QueryStringContext {
  const contextSources = (Array.isArray(source) ? source : [source,]).map((s) => s.startsWith('http')
    ? s
    : { type: 'stringSource', value: s, mediaType: 'text/turtle' })
  const contextDestination: IDataDestination | undefined = type && typeof source === 'string' ? { type, value: source } : undefined
  const context: QueryStringContext = {
    sources: contextSources as IDataSourceList,
    lenient: true,
    destination: contextDestination,
    [ActorHttpInruptSolidClientAuthn.CONTEXT_KEY_SESSION.name]: session
  }
  return context as QueryStringContext
}

async function getEngine(): Promise<IQueryEngine> {
  if (!factoryCreatedEngine) {
    factoryCreatedEngine = await factory.create({ configPath: join('config', 'engine.json') })
  }
  return factoryCreatedEngine
}

async function update(destination: string, query: string, type?: string): Promise<void> {
  const engine = await getEngine()
  const context = createContext(destination, type)
  logger.debug('Update:', { destination: context.destination, sources: context.sources, query: query })
  await engine.queryVoid(query, context)
}

async function query(source: string | string[], query: string): Promise<Bindings[]> {
  const engine = await getEngine()
  const bindingsStream: BindingsStream = await engine.queryBindings(query, createContext(source))
  const bindingsArray: Bindings[] = await bindingsStream.toArray()
  return bindingsArray
}

async function select<T>(source: string | string[], query: string): Promise<T[]> {
  logger.debug('Select:', { source: source, query: query })
  const results: T[] = []
  return new Promise<T[]>((resolve, reject) => getEngine().then((engine) => engine.queryBindings(query, createContext(source))
    .then((bindingsStream: BindingsStream) => bindingsStream
      .on('data', (bindings: Bindings) => {
        const output: Record<string, string> = {}
        bindings.forEach((value, key) => output[key.value] = value.value)
        logger.debug('Select output:', output)
        results.push(output as T)
      })
      .on('error', reject)
      .on('end', () => resolve(results)))
    .catch(reject)
  ).catch(reject))
}

async function selectOne<T>(source: string | string[], query: string): Promise<T | undefined> {
  return (await select<T>(source, query)).at(0)
}

export { select, update, selectOne, query }
