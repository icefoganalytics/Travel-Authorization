import http from "@/api/http-client"

/** @typedef {import('@/api/base-api.js').Policy} Policy */
/** @typedef {import("@/api/base-api").ModelOrder} ModelOrder */

/**
 * Keep in sync with api/src/integrations/trav-com-integration/models/ar-invoice.ts
 * @typedef {{
 *   id: number;
 *   invoiceNumber: string;
 *   profileNumber: string | null;
 *   profileName: string | null;
 *   department: string | null;
 *   bookingDate: string | null;
 *   systemDate: string | null;
 *   description: string | null;
 *   invoiceRemarks: string | null;
 * }} ArInvoice
 */

/**
 * @typedef {{
 *   id?: number;
 *   invoiceNumber?: string;
 *   profileNumber?: string | null;
 *   profileName?: string | null;
 *   department?: string | null;
 *   bookingDate?: string | null;
 *   systemDate?: string | null;
 *   description?: string | null;
 *   invoiceRemarks?: string | null;
 * }} ArInvoiceWhereOptions
 */

/**
 * // match with model scopes signatures
 * @typedef {{
 *   between?: [string, string];
 * }} ArInvoiceFiltersOptions
 */

/**
 * @typedef {{
 *   where?: ArInvoiceWhereOptions;
 *   filters?: ArInvoiceFiltersOptions;
 *   order?: ModelOrder[];
 *   page?: number;
 *   perPage?: number
 * }} ArInvoicesQueryOptions
 */

export const arInvoicesApi = {
  /**
   * @param {ArInvoicesQueryOptions} [params={}]
   * @returns {Promise<{
   *   arInvoices: ArInvoice[];
   *   totalCount: number;
   * }>}
   */
  async list(params = {}) {
    const { data } = await http.get("/api/trav-com/ar-invoices", {
      params,
    })
    return data
  },

  /**
   * @param {number} arInvoiceId
   * @returns {Promise<{
   *   arInvoice: ArInvoice;
   *   policy: Policy;
   * }>}
   */
  async get(arInvoiceId) {
    const { data } = await http.get(`/api/trav-com/ar-invoices/${arInvoiceId}`)
    return data
  },
}

export default arInvoicesApi
