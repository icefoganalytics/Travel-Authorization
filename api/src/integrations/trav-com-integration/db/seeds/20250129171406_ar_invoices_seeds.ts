import fs from "fs"
import { isNil } from "lodash"
import { Knex } from "knex"
import Papa from "papaparse"

import { APP_ROOT } from "@/config"
import dbMigrationClient from "@/integrations/trav-com-integration/db/db-migration-client"
import { type ArInvoiceNoHealthRaw } from "@/integrations/trav-com-integration/models"

export async function seed(_knex: Knex): Promise<void> {
  const fileName = `${APP_ROOT}/integrations/trav-com-integration/db/seeds/data/ar-invoices-no-health.csv`
  const fileContent = fs.readFileSync(fileName, "utf8")
  const { data: arInvoicesAttributes } = Papa.parse<ArInvoiceNoHealthRaw>(fileContent, {
    header: true,
    skipEmptyLines: true,
  })

  for (const arInvoiceAttributes of arInvoicesAttributes) {
    const existingInvoice = await dbMigrationClient<ArInvoiceNoHealthRaw>("ARInvoicesNoHealth")
      .where({
        InvoiceID: arInvoiceAttributes.InvoiceID,
      })
      .first()

    if (isNil(existingInvoice)) {
      await dbMigrationClient<ArInvoiceNoHealthRaw>("ARInvoicesNoHealth").insert(arInvoiceAttributes)
    } else {
      await dbMigrationClient<ArInvoiceNoHealthRaw>("ARInvoicesNoHealth")
        .where({
          InvoiceID: arInvoiceAttributes.InvoiceID,
        })
        .update(arInvoiceAttributes)
    }
  }
}
