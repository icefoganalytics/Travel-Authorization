import { reactive, toRefs, unref, watch } from "vue"

import travelDeskTravelRequestsApi from "@/api/travel-desk-travel-requests-api"

/**
 * TODO: add other fields
 * @typedef {Object} TravelDeskTravelRequest
 * @property {number} id
 */

/**
 * Provides reactive state management for travelDeskTravelRequest with API integration.
 *
 * @param {import('vue').Ref<TravelDeskTravelRequest["id"]>} travelDeskTravelRequestId
 * @param {Object} [{ skipWatchIf = () => false }={}] - Configuration to conditionally skip API calls.
 * @param {Function} [skipWatchIf] - Function that returns a boolean to determine if fetching should be skipped.
 * @returns {{
 *   travelDeskTravelRequest: import('vue').Ref<TravelDeskTravelRequest>,
 *   isLoading: import('vue').Ref<boolean>,
 *   isErrored: import('vue').Ref<boolean>,
 *   fetch: () => Promise<TravelDeskTravelRequest>,
 *   refresh: () => Promise<TravelDeskTravelRequest>
 * }}
 */
export function useTravelDeskTravelRequests(
  travelDeskTravelRequestId,
  { skipWatchIf = () => false } = {}
) {
  const state = reactive({
    travelDeskTravelRequest: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch() {
    state.isLoading = true
    try {
      const { travelDeskTravelRequest } = await travelDeskTravelRequestsApi.get(
        unref(travelDeskTravelRequestId)
      )
      state.isErrored = false
      state.travelDeskTravelRequest = travelDeskTravelRequest
      return travelDeskTravelRequest
    } catch (error) {
      console.error("Failed to fetch travelDeskTravelRequest:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => unref(travelDeskTravelRequestId),
    async () => {
      if (skipWatchIf()) return

      await fetch()
    },
    { immediate: true }
  )

  return {
    ...toRefs(state),
    fetch,
    refresh: fetch,
  }
}

export default useTravelDeskTravelRequests
