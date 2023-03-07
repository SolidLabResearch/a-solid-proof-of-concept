import { Session } from '@inrupt/solid-client-authn-node'
import { logger } from './logger'
import { type IToken } from './types'

const session: Session = new Session()

async function requestToken(idp: string, email: string, password: string, name: string): Promise<IToken> {
  const credentialsUrl: URL = new URL('idp/credentials/', idp)
  const response: Response = await fetch(credentialsUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password, name }) // the name field will be used when generating the ID of the token
  })
  const { id, secret } = await response.json()
  return { email, idp, secret, id }
}

async function login(idp: string, email: string, password: string, name: string): Promise<void> {
  if (!session.info.isLoggedIn) {
    const token: IToken = await requestToken(idp, email, password, name)
    await session.login({ clientId: token.id, clientName: name, clientSecret: token.secret, oidcIssuer: token.idp })
    if (session.info.isLoggedIn) {
      logger.info(`Logged in at ${idp} as ${email}`)
    } else {
      throw new Error(`Failed to log in at ${idp} as ${email}`)
    }
  } else {
    logger.info('Already logged in!')
  }
}

async function logout(): Promise<void> {
  if (session.info.isLoggedIn) {
    await session.logout()
    logger.info('Logged out successfully')
  } else {
    logger.info('Cannot logout, session is not logged in')
  }
}

export { session, login, logout }
