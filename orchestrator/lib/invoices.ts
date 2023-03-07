import { logger } from './logger'
import { select, update, selectOne } from './engine'
import { Agent } from './agent'
import { getSocialTariffEligibilityData } from './common'
import type { IAgent, ITaskConfiguration } from './types'

interface ICustomerInvoice {
  customer: string
  invoice: string
  value: string
}

interface IAgentInbox {
  agent: string
  inbox: string
}

class InvoiceGenerationAgent extends Agent implements IAgent {

  private async getCustomerSpecificDataFromInvoice(invoice: string, fromReasoner = false): Promise<ICustomerInvoice[]> {
    logger.debug('Invoice:', invoice)

    const customerInvoiceValuesQuery = fromReasoner ? `
      PREFIX social: <https://a-solid.ilabt.imec.be/vocabulary#>
      PREFIX schema: <http://schema.org/>

      SELECT ?customer ?value ?invoice WHERE {
        ?s a schema:Invoice, social:SubInvoice ;
          schema:customer ?customer ;
          schema:totalPaymentDue [
            a schema:MonetaryAmount ;
              schema:value ?value
          ] ;
          social:paysPartOfInvoice ?invoice .
      }
    ` : `
      PREFIX schema: <http://schema.org/>

      SELECT ?customer ?value ?invoice WHERE {
        ?invoice a schema:Invoice ;
          schema:customer ?customer ;
          schema:totalPaymentDue [
            a schema:MonetaryAmount ;
              schema:value ?value
          ] ;
      }
    `

    const customerSpecificData: ICustomerInvoice[] = await select<ICustomerInvoice>(invoice, customerInvoiceValuesQuery)
    logger.debug('Customer specific data:', customerSpecificData)

    return customerSpecificData
  }

  private async storeInvoiceForCustomer(invoice: ICustomerInvoice, targetTemplate: string): Promise<string> {
    const customer = invoice.customer.match(/.*\/webid\/([a-z]+)#me/)?.[1] as string
    const url = targetTemplate.replace('{customer}', customer)
    const invoiceIri = new URL('#invoice', url).href

    const customerInvoiceStoreQuery = `
      PREFIX social: <https://a-solid.ilabt.imec.be/vocabulary#>
      PREFIX schema: <http://schema.org/>

      INSERT DATA {
        <${invoiceIri}> a schema:Invoice, social:SubInvoice ;
          schema:customer <${invoice.customer}> ;
          schema:totalPaymentDue [
            a schema:MonetaryAmount ;
              schema:value ${invoice.value}
          ] ;
          social:paysPartOfInvoice <${invoice.invoice}> .
      }
    `
    logger.info(`Saving invoice for <${invoice.customer}> at <${invoiceIri}>`)
    await update(url, customerInvoiceStoreQuery)

    return invoiceIri
  }

  private async sendInboxNotification(customer: string, invoice: string): Promise<void> {
    const inboxQuery = `
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      PREFIX ldp: <http://www.w3.org/ns/ldp#>
    
      SELECT ?agent ?inbox WHERE {
        ?agent a ?type ;
          ldp:inbox ?inbox .

        VALUES ?type { foaf:Person foaf:Organization } .
      } LIMIT 1
    `
    const agentInbox: IAgentInbox | undefined = await selectOne<IAgentInbox>(customer, inboxQuery)

    if (!agentInbox) {
      throw new Error(`Agent <${customer}> must have an inbox defined`)
    }

    const messageQuery = `
      PREFIX social: <https://a-solid.ilabt.imec.be/vocabulary#>

      INSERT DATA {
        <${customer}> social:hasInvoiceAvailable <${invoice}>
      }
    `
    logger.info(`Sending notification to ${agentInbox.inbox}`)

    // The 'patchSparqlUpdate' here is mandatory, so that Comunica directly sends a write
    // to the inbox without trying to query it first, because it cannot be queried and
    // consequently Comunica will refuse to update unless explicitly told to
    await update(agentInbox.inbox, messageQuery, 'patchSparqlUpdate')
  }

  public async execute(task: ITaskConfiguration): Promise<void> {
    const rules = await this.request(task.rules)

    // The invoice is fetched as raw turtle so the #identifier needs to be changed to full IRI
    const invoice = (await this.request(task.input)).replaceAll('<#', `<${task.input}#`)

    // The customer needs to be determined from the invoice, and their social tariff eligibility data fetched for use
    const customerWebId = (await this.getCustomerSpecificDataFromInvoice(invoice))[0].customer
    const socialTariffEligibilityData = await getSocialTariffEligibilityData(customerWebId)

    // Assuming the invoice already includes the necessary prefixes for the social tariff eligibility,
    // all prefixes can be stripped from the eligibility data itself and that can then be added after the invoice
    const reasonerInputData = invoice + '\n' + socialTariffEligibilityData.replace(/(@.*)\n/g, '')

    // The reasoner will output the final invoices for citizen and optionally government
    const invoiceTurtle = await this.reason(reasonerInputData, rules)

    // Those invoices need to be split per-customer from the single Turtle response
    const customerInvoices = await this.getCustomerSpecificDataFromInvoice(invoiceTurtle, true)

    // ...and then saved to their corresponding locations, and a notification sent
    for (const customerInvoice of customerInvoices) {
      const invoiceIri = await this.storeInvoiceForCustomer(customerInvoice, task.output)
      await this.sendInboxNotification(customerInvoice.customer, invoiceIri)
    }
  }
}

export { InvoiceGenerationAgent }
