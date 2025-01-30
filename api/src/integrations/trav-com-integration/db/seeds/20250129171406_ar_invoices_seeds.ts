import fs from "fs"
import { isNil } from "lodash"
import { Knex } from "knex"
import Papa from "papaparse"

import { APP_ROOT } from "@/config"
import dbTravComClient from "@/integrations/trav-com-integration/db/trav-com-db-client"
import { type ArInvoiceNoHealthRaw } from "@/integrations/trav-com-integration/models"

export async function seed(_knex: Knex): Promise<void> {
  const fileName = `${APP_ROOT}/integrations/trav-com-integration/db/seeds/data/ar-invoices-no-health.csv`
  const fileContent = fs.readFileSync(fileName, "utf8")
  const { data: arInvoices } = Papa.parse<ArInvoiceNoHealthRaw>(fileContent, {
    header: true,
    skipEmptyLines: true,
  })

  for (const arInvoice of arInvoices) {
    const existingInvoice = await dbTravComClient<ArInvoiceNoHealthRaw>("ARInvoicesNoHealth")
      .where({
        InvoiceID: arInvoice.InvoiceID,
      })
      .first()

    if (isNil(existingInvoice)) {
      await dbTravComClient<ArInvoiceNoHealthRaw>("ARInvoicesNoHealth").insert(arInvoice)
    } else {
      await dbTravComClient<ArInvoiceNoHealthRaw>("ARInvoicesNoHealth")
        .where({
          InvoiceID: arInvoice.InvoiceID,
        })
        .update(arInvoice)
    }
  }
}
