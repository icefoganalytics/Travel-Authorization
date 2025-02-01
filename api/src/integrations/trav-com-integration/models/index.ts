import db from "@/integrations/trav-com-integration/db/db-client"

export { type ArInvoiceNoHealthRaw } from "./ar-invoice"
export { type ArInvoiceDetail, type ArInvoiceDetailNoHealthRaw } from "./ar-invoice-details"
export { type Segment, type SegmentNoHealthRaw } from "./segments"

import ArInvoice from "./ar-invoice"

ArInvoice.establishAssociations()

export {
  ArInvoice,
  // add additional models as needed
}

export default db
