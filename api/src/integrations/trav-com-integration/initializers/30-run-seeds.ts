import { logger } from "@/utils/logger"
import travComDbClient from "@/integrations/trav-com-integration/db/trav-com-db-client"

export async function runSeeds(): Promise<void> {
  if (process.env.SKIP_SEEDING_UNLESS_EMPTY === "true") {
    const count = await travComDbClient("ARInvoicesNoHealth")
      .count({ count: "*" })
      .then((r) => Number(r[0].count || "0"))

    if (count > 0) {
      logger.warn("Skipping seeding as SKIP_SEEDING_UNLESS_EMPTY set, and data already seeded.")
      return
    }
  }

  try {
    await travComDbClient.seed.run()
  } catch (error) {
    logger.error(`Error running seeds: ${error}`, { error })
    throw error
  }

  return
}

export default runSeeds
