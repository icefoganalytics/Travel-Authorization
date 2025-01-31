import http from "@/api/http-client"

/** @typedef {import("@/api/base-api").Policy} Policy */
/** @typedef {import("@/api/base-api").ModelOrder} ModelOrder */

/** Keep in sync with api/src/models/travel-desk-travel-request.ts */
export const TRAVEL_DESK_TRAVEL_REQUEST_STATUSES = Object.freeze({
  BOOKED: "booked",
  COMPLETE: "complete",
  DRAFT: "draft",
  OPTIONS_PROVIDED: "options_provided",
  OPTIONS_RANKED: "options_ranked",
  SUBMITTED: "submitted",
})

/** @typedef {TRAVEL_DESK_TRAVEL_REQUEST_STATUSES[keyof TRAVEL_DESK_TRAVEL_REQUEST_STATUSES]} TravelDeskTravelRequestStatuses */

/**
 * @typedef {{
 *   id: number;
 *   travelAuthorizationId: number;
 *   travelAgencyId: number | null;
 *   legalFirstName: string;
 *   legalMiddleName: string | null;
 *   legalLastName: string;
 *   birthDate: string | null;
 *   strAddress: string;
 *   city: string;
 *   province: string;
 *   postalCode: string;
 *   passportCountry: string | null;
 *   passportNum: string | null;
 *   travelPurpose: string;
 *   travelLocation: string | null;
 *   travelNotes: string | null;
 *   busPhone: string;
 *   busEmail: string;
 *   travelContact: boolean | null;
 *   travelPhone: string | null;
 *   travelEmail: string | null;
 *   additionalInformation: string | null;
 *   status: TravelDeskTravelRequestStatuses;
 *   travelDeskOfficer: string | null;
 *   isInternationalTravel: boolean;
 *   createdAt: string;
 *   updatedAt: string;
 * }} TravelDeskTravelRequest
 */

/**
 * @typedef {TravelDeskTravelRequest & {
 *    userDisplayName: string;
 *    department: string;
 *    branch: string;
 *    travelStartDate: string;
 *    travelEndDate: string;
 *    locationsTraveled: string;
 *    requestedOptions: string;
 * }} TravelDeskTravelRequestIndexView
 *
 */

/**
 * @typedef {{
 *   id?: number;
 *   travelAuthorizationId?: number;
 *   travelAgencyId?: number | null;
 *   status?: TravelDeskTravelRequestStatuses;
 *   travelContact?: boolean | null;
 *   isInternationalTravel?: boolean;
 * }} TravelDeskTravelRequestWhereOptions
 */

/**
 * // match with model scopes signatures
 * @typedef {{
 * }} TravelDeskTravelRequestFiltersOptions
 */

/**
 * @typedef {{
 *   where?: TravelDeskTravelRequestWhereOptions;
 *   filters?: TravelDeskTravelRequestFiltersOptions;
 *   order?: ModelOrder[];
 *   page?: number;
 *   perPage?: number
 * }} TravelDeskTravelRequestQueryOptions
 */

export const travelDeskTravelRequestsApi = {
  /**
   * @param {TravelDeskTravelRequestQueryOptions} [params={}]
   * @returns {Promise<{
   *   travelDeskTravelRequests: TravelDeskTravelRequestIndexView[];
   *   totalCount: number;
   * }>}
   */
  async list(params = {}) {
    const { data } = await http.get("/api/travel-desk-travel-requests", {
      params,
    })
    return data
  },
  /**
   * @param {number} travelDeskTravelRequestId
   * @returns {Promise<{
   *   travelDeskTravelRequest: TravelDeskTravelRequest;
   *   policy: Policy;
   * }>}
   */
  async get(travelDeskTravelRequestId, params = {}) {
    const { data } = await http.get(
      `/api/travel-desk-travel-requests/${travelDeskTravelRequestId}`,
      { params }
    )
    return data
  },
  /**
   * @param {number} travelDeskTravelRequestId
   * @param {Partial<TravelDeskTravelRequest>} attributes
   * @returns {Promise<{
   *   travelDeskTravelRequest: TravelDeskTravelRequest;
   * }>}
   */
  async update(travelDeskTravelRequestId, attributes) {
    const { data } = await http.patch(
      `/api/travel-desk-travel-requests/${travelDeskTravelRequestId}`,
      attributes
    )
    return data
  },

  // Stateful Actions
  /**
   * @param {number} travelDeskTravelRequestId
   * @param {Partial<TravelDeskTravelRequest>} attributes
   * @returns {Promise<{
   *   travelDeskTravelRequest: TravelDeskTravelRequest;
   * }>}
   */
  async submit(travelDeskTravelRequestId, attributes) {
    const { data } = await http.post(
      `/api/travel-desk-travel-requests/${travelDeskTravelRequestId}/submit`,
      attributes
    )
    return data
  },
  /**
   * @param {number} travelDeskTravelRequestId
   * @param {Partial<TravelDeskTravelRequest>} attributes
   * @returns {Promise<{
   *   travelDeskTravelRequest: TravelDeskTravelRequest;
   * }>}
   */
  async optionsProvided(travelDeskTravelRequestId, attributes) {
    const { data } = await http.post(
      `/api/travel-desk-travel-requests/${travelDeskTravelRequestId}/options-provided`,
      attributes
    )
    return data
  },
  async optionsRanked(travelDeskTravelRequestId) {
    const { data } = await http.post(
      `/api/travel-desk-travel-requests/${travelDeskTravelRequestId}/options-ranked`
    )
    return data
  },
  /**
   * @param {number} travelDeskTravelRequestId
   * @param {Partial<TravelDeskTravelRequest>} attributes
   * @returns {Promise<{
   *   travelDeskTravelRequest: TravelDeskTravelRequest;
   * }>}
   */
  async book(travelDeskTravelRequestId, attributes) {
    const { data } = await http.post(
      `/api/travel-desk-travel-requests/${travelDeskTravelRequestId}/book`,
      attributes
    )
    return data
  },
}

export default travelDeskTravelRequestsApi
