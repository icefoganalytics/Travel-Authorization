import fs from "fs"
import { isNil } from "lodash"
import { Knex } from "knex"
import Papa from "papaparse"

import { APP_ROOT } from "@/config"
import convertAmbiguousNullToActualNull from "@/utils/convert-ambiguous-null-to-actual-null"
import dbTravComClient from "@/integrations/trav-com-integration/db/trav-com-db-client"
import { type ArInvoiceDetailNoHealthRaw } from "@/integrations/trav-com-integration/models"

export async function seed(_knex: Knex): Promise<void> {
  const fileName = `${APP_ROOT}/integrations/trav-com-integration/db/seeds/data/ar-invoice-details-no-health.csv`
  const fileContent = fs.readFileSync(fileName, "utf8")
  const { data: arInvoiceDetailsAttributes } = Papa.parse<ArInvoiceDetailNoHealthRaw>(fileContent, {
    header: true,
    skipEmptyLines: true,
  })

  for (const arInvoiceDetailAttributes of arInvoiceDetailsAttributes) {
    arInvoiceDetailAttributes.TravelDate = convertAmbiguousNullToActualNull(
      arInvoiceDetailAttributes.TravelDate
    )
    arInvoiceDetailAttributes.ReturnDate = convertAmbiguousNullToActualNull(
      arInvoiceDetailAttributes.ReturnDate
    )

    const existingInvoice = await dbTravComClient<ArInvoiceDetailNoHealthRaw>(
      "ARInvoiceDetailsNoHealth"
    )
      .where({
        InvoiceDetailID: arInvoiceDetailAttributes.InvoiceDetailID,
      })
      .first()

    if (isNil(existingInvoice)) {
      await dbTravComClient<ArInvoiceDetailNoHealthRaw>("ARInvoiceDetailsNoHealth").insert(
        arInvoiceDetailAttributes
      )
    } else {
      await dbTravComClient<ArInvoiceDetailNoHealthRaw>("ARInvoiceDetailsNoHealth")
        .where({
          InvoiceDetailID: arInvoiceDetailAttributes.InvoiceDetailID,
        })
        .update(arInvoiceDetailAttributes)
    }
  }
}
