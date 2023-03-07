import { selectOne } from './engine'
import { logger } from './logger'

interface IEligibilityStatus {
  id: string
  eligible?: string
}

async function findEligibilityStatus(source: string): Promise<IEligibilityStatus | undefined> {
  const query = `
    PREFIX social: <https://a-solid.ilabt.imec.be/vocabulary#>

    SELECT ?id ?eligible WHERE {
      ?id social:isSocialTariffEligible ?eligible .
    } LIMIT 1
  `
  return await selectOne<IEligibilityStatus>(source, query)
}

async function getSocialTariffEligibilityData(customerWebId: string): Promise<string> {
  const data = await findEligibilityStatus(customerWebId)
  if (!data) {
    logger.warn(`Unable to find eligibility data for <${customerWebId}>, assuming not eligible`)
  }
  const turtle = `
    @prefix social: <https://a-solid.ilabt.imec.be/vocabulary#>.

    <${data?.id ?? customerWebId}> social:isSocialTariffEligible ${data?.eligible ?? 'false'}.
  `
  return turtle
}

export { findEligibilityStatus, getSocialTariffEligibilityData, type IEligibilityStatus }
