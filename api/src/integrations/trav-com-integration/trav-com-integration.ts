import {
  type QueryOptions,
  ArInvoicesController,
} from "@/integrations/trav-com-integration/controllers"
import { type ArInvoice } from "@/integrations/trav-com-integration/models"

export const travComIntegration = {
  async fetchArInvoices(params: QueryOptions = {}): Promise<{
    arInvoices: ArInvoice[]
    totalCount: number
  }> {
    return ArInvoicesController.index(params)
  },

}

export default travComIntegration
