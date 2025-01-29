export type QueryOptions = {
  where?: Record<string, unknown>
  filters?: Record<string, unknown>
  page?: number
  perPage?: number | 1000 | -1
}
