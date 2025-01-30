export type SegmentNoHealthRaw = {
  segmentID: number
  invoiceID: number
  invoiceDetailID: number
  LegNumber: number
  DepartureCityCode: string | null
  DepartureInfo: string | null
  ArrivalCityCode: string | null
  ArrivalInfo: string | null
  AirlineCode: string | null
  FlightNumber: string | null
  ClassOfService: string | null
  FareBasis: string | null
}

export type Segment = {
  segmentId: number
  invoiceId: number
  invoiceDetailId: number
  legNumber: number
  departureCityCode: string | null
  departureInfo: string | null
  arrivalCityCode: string | null
  arrivalInfo: string | null
  airlineCode: string | null
  flightNumber: string | null
  classOfService: string | null
  fareBasis: string | null
}
