import http from "@/api/http-client"

/** @typedef {import('@/api/base-api.js').Policy} Policy */
/** @typedef {import('@/api/base-api.js').ModelOrder} ModelOrder */

/** Keep in sync with api/src/models/travel-desk-hotel.ts */
export const TRAVEL_DESK_HOTEL_STATUSES = Object.freeze({
  REQUESTED: "Requested",
  // TODO: confirm this is correct.
  RESERVED: "Reserved", // Uncofirmed, but seems likely.
})

/** @typedef {TRAVEL_DESK_HOTEL_STATUSES[keyof TRAVEL_DESK_HOTEL_STATUSES]} TravelDeskHotelStatuses */

/**
 * @typedef {{
 *   id: number
 *   travelRequestId: number
 *   city: string
 *   isDedicatedConferenceHotelAvailable: boolean
 *   conferenceName: string | null
 *   conferenceHotelName: string | null
 *   checkIn: string
 *   checkOut: string
 *   additionalInformation: string | null
 *   status: string
 *   reservedHotelInfo: string | null
 *   booking: string | null
 *   createdAt: string
 *   updatedAt: string
 * }} TravelDeskHotel
 */

/**
 * @typedef {{
 *   id?: number
 *   travelRequestId?: number
 *   city?: string
 *   isDedicatedConferenceHotelAvailable?: boolean
 *   conferenceName?: string
 *   conferenceHotelName?: string
 *   checkIn?: string
 *   checkOut?: string
 *   status?: TravelDeskHotelStatuses
 *   booking?: string
 * }} TravelDeskHotelWhereOptions
 */

/**
 * // match with model scopes signatures
 * @typedef {{
 * }} TravelDeskHotelFiltersOptions
 */

/**
 * @typedef {{
 *   where?: TravelDeskHotelWhereOptions;
 *   filters?: TravelDeskHotelFiltersOptions;
 *   order?: ModelOrder[];
 *   page?: number;
 *   perPage?: number
 * }} TravelDeskHotelsQueryOptions
 */

export const travelDeskHotelsApi = {
  /**
   * @param {TravelDeskHotelsQueryOptions} [params={}]
   * @returns {Promise<{
   *   travelDeskHotels: TravelDeskHotel[];
   *   totalCount: number;
   * }>}
   */
  async list(params = {}) {
    const { data } = await http.get("/api/travel-desk-hotels", {
      params,
    })
    return data
  },
  // TODO: build back-end endpoint
  /**
   * @param {number} travelDeskHotelId
   * @returns {Promise<{
   *   travelDeskHotel: TravelDeskHotel;
   *   policy: Policy;
   * }>}
   */
  async get(travelDeskHotelId) {
    const { data } = await http.get(`/api/travel-desk-hotels/${travelDeskHotelId}`)
    return data
  },
  /**
   * @param {Partial<TravelDeskHotel>} attributes
   * @returns {Promise<{
   *   travelDeskHotel: TravelDeskHotel;
   *   policy: Policy;
   * }>}
   */
  async create(attributes) {
    const { data } = await http.post("/api/travel-desk-hotels", attributes)
    return data
  },
  /**
   * @param {number} travelDeskHotelId
   * @param {Partial<TravelDeskHotel>} attributes
   * @returns {Promise<{
   *   travelDeskHotel: TravelDeskHotel;
   *   policy: Policy;
   * }>}
   */
  async update(travelDeskHotelId, attributes) {
    const { data } = await http.patch(`/api/travel-desk-hotels/${travelDeskHotelId}`, attributes)
    return data
  },
  /**
   * @param {number} travelDeskHotelId
   * @returns {Promise<void>}
   */
  async delete(travelDeskHotelId) {
    const { data } = await http.delete(`/api/travel-desk-hotels/${travelDeskHotelId}`)
    return data
  },
}

export default travelDeskHotelsApi
