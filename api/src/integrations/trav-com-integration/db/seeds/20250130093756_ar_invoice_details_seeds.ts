import fs from "fs"
import { isEmpty, isNil } from "lodash"
import { Knex } from "knex"
import Papa from "papaparse"

import { APP_ROOT } from "@/config"
import dbTravComClient from "@/integrations/trav-com-integration/db/trav-com-db-client"
import { type ArInvoiceDetailNoHealthRaw } from "@/integrations/trav-com-integration/models"

/**
 * Convert "NULL" or empty values to actual null for SQL compatibility
 */
function convertAmbiguousNullToActualNull<T>(value: T | null | undefined): T | null {
  if (value === "NULL" || isNil(value) || isEmpty(value)) {
    return null
  }

  return value
}

export async function seed(_knex: Knex): Promise<void> {
  const fileName = `${APP_ROOT}/integrations/trav-com-integration/db/seeds/data/ar-invoice-details-no-health.csv`
  const fileContent = fs.readFileSync(fileName, "utf8")
  const { data: arInvoiceDetails } = Papa.parse<ArInvoiceDetailNoHealthRaw>(fileContent, {
    header: true,
    skipEmptyLines: true,
  })

  for (const arInvoiceDetail of arInvoiceDetails) {
    arInvoiceDetail.TravelDate = convertAmbiguousNullToActualNull(arInvoiceDetail.TravelDate)
    arInvoiceDetail.ReturnDate = convertAmbiguousNullToActualNull(arInvoiceDetail.ReturnDate)

    const existingInvoice = await dbTravComClient<ArInvoiceDetailNoHealthRaw>(
      "ARInvoiceDetailsNoHealth"
    )
      .where({
        InvoiceDetailID: arInvoiceDetail.InvoiceDetailID,
      })
      .first()

    if (isNil(existingInvoice)) {
      await dbTravComClient<ArInvoiceDetailNoHealthRaw>("ARInvoiceDetailsNoHealth").insert(
        arInvoiceDetail
      )
    } else {
      await dbTravComClient<ArInvoiceDetailNoHealthRaw>("ARInvoiceDetailsNoHealth")
        .where({
          InvoiceDetailID: arInvoiceDetail.InvoiceDetailID,
        })
        .update(arInvoiceDetail)
    }
  }
}
