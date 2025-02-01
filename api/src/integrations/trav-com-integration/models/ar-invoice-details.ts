export type ArInvoiceDetailNoHealthRaw = {
  InvoiceDetailID: number
  InvoiceID: number
  TransactionType: number
  VendorNumber: string
  VendorName: string
  ProductCode: number
  PassengerName: string
  TicketNumber: string
  PublishedFare: number
  SellingFare: number
  ReferenceFare: number
  LowFare: number
  Tax1: number
  GrossAmount: number
  CommissionAmount: number
  VatOnCommission: number
  FreeFieldA: string | null
  TravelDate: string | null
  ReturnDate: string | null
  NumberOfDays: number | null
  CityCode: string | null
  ProfileNumber: string | null
  AddedBy: number
}

export type ArInvoiceDetail = {
  invoiceDetailId: number
  invoiceId: number
  transactionType: number
  vendorNumber: string
  vendorName: string
  productCode: number
  passengerName: string
  ticketNumber: string
  publishedFare: number
  sellingFare: number
  referenceFare: number
  lowFare: number
  tax1: number
  grossAmount: number
  commissionAmount: number
  vatOnCommission: number
  freeFieldA: string | null
  travelDate: string | null
  returnDate: string | null
  numberOfDays: number | null
  cityCode: string | null
  profileNumber: string | null
  addedBy: number
}
