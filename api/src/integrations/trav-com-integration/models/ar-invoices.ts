export type ArInvoiceNoHealthRaw = {
  InvoiceID: number
  InvoiceNumber: string
  ProfileNumber: string | null
  ProfileName: string | null
  Department: string | null
  BookingDate: string | null
  SystemDate: string | null
  Description: string | null
  InvoiceRemarks: string | null
}

export type ArInvoice = {
  invoiceID: number
  invoiceNumber: string
  profileNumber: string | null
  profileName: string | null
  department: string | null
  bookingDate: string | null
  systemDate: string | null
  description: string | null
  invoiceRemarks: string | null
}
