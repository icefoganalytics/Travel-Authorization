import { reactive, toRefs, ref, unref, watch } from "vue"

import arInvoicesApi from "@/api/trav-com/ar-invoices-api"

/**
 * @template [T=any]
 * @typedef {import('vue').Ref<T>} Ref
 */
/** @typedef {import('@/api/trav-com/ar-invoices-api.js').ArInvoice} ArInvoice */
/** @typedef {import('@/api/trav-com/ar-invoices-api.js').ArInvoicesQueryOptions} ArInvoicesQueryOptions */

/**
 * Provides reactive state management for Trav Com AR invoices with API integration.
 *
 * @param {ArInvoicesQueryOptions} [options=ref({})] - Configuration options containing filters and pagination settings for fetching AR invoices.
 * @param {Object} [{ skipWatchIf = () => false }={}] - Configuration to conditionally skip API calls.
 * @param {Function} [skipWatchIf] - Function that returns a boolean to determine if fetching should be skipped.
 * @returns {{
 *   arInvoices: Ref<ArInvoice[]>,
 *   totalCount: Ref<number>,
 *   isLoading: Ref<boolean>,
 *   isErrored: Ref<boolean>,
 *   fetch: () => Promise<ArInvoice[]>,
 *   refresh: () => Promise<ArInvoice[]>
 * }}
 */
export function useArInvoices(options = ref({}), { skipWatchIf = () => false } = {}) {
  const state = reactive({
    arInvoices: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch() {
    state.isLoading = true
    try {
      const { arInvoices, totalCount } = await arInvoicesApi.list(unref(options))
      state.isErrored = false
      state.arInvoices = arInvoices
      state.totalCount = totalCount
      return arInvoices
    } catch (error) {
      console.error("Failed to fetch AR invoices:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => [skipWatchIf(), unref(options)],
    async ([skip]) => {
      if (skip) return

      await fetch()
    },
    { deep: true, immediate: true }
  )

  return {
    ...toRefs(state),
    fetch,
    refresh: fetch,
  }
}

export default useArInvoices
