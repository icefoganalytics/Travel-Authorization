import travComDbClient from "@/integrations/trav-com-integration/db/trav-com-db-client"

type QueryOptions = {
  where?: Record<string, unknown>
  filters?: Record<string, unknown>
  page: number
  perPage: number | 1000 | -1
}

export const travComIntegration = {
  ariInvoicesNoHealth: {
    async index(params: QueryOptions) {
      const totalCount = await travComDbClient("ARInvoicesNoHealth")
        .count({ count: "*" })
        .then((r) => Number(r[0].count || "0"))

      const ariInvoicesNoHealth = await travComDbClient("ARInvoicesNoHealth")
        .limit(params.perPage)
        .offset(params.page)
        .select()

      return {
        ariInvoicesNoHealth,
        totalCount,
      }
    },
  },
}

export default travComIntegration
