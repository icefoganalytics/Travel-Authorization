import travComDbClient from "@/integrations/trav-com-integration/db/trav-com-db-client"

import {
  type ArInvoice,
  type ArInvoiceNoHealthRaw,
} from "@/integrations/trav-com-integration/models"
import { type QueryOptions } from "@/integrations/trav-com-integration/controllers/base"

export const ArInvoicesController = {
  async index({ page = 1, perPage = 10 }: QueryOptions = {}): Promise<{
    arInvoices: ArInvoice[]
    totalCount: number
  }> {
    const totalCount = await travComDbClient("ARInvoicesNoHealth")
      .count({ count: "*" })
      .then((r) => Number(r[0].count || "0"))

    const arInvoicesNoHealthRaw = await travComDbClient<ArInvoiceNoHealthRaw>(
      "ARInvoicesNoHealth"
    )
      .limit(perPage)
      .offset((page - 1) * perPage)
      .select()

    const arInvoices = arInvoicesNoHealthRaw.map((r) => ({
      invoiceID: r.InvoiceID,
      invoiceNumber: r.InvoiceNumber,
      profileNumber: r.ProfileNumber,
      profileName: r.ProfileName,
      department: r.Department,
      bookingDate: r.BookingDate,
      systemDate: r.SystemDate,
      description: r.Description,
      invoiceRemarks: r.InvoiceRemarks,
    }))

    return {
      arInvoices,
      totalCount,
    }
  },
}

export default ArInvoicesController
