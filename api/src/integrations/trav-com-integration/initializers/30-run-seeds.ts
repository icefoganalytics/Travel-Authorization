import logger from "@/utils/logger"
import travComDbClient from "@/integrations/trav-com-integration/db/trav-com-db-client"

export async function runSeeds(force = false): Promise<void> {
  if (process.env.SKIP_SEEDING_UNLESS_EMPTY === "true" && force !== true) {
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

// Run via `dev ts-node ./src/integrations/trav-com-integration/initializers/30-run-seeds.ts`
if (require.main === module) {
  ;(async () => {
    try {
      await runSeeds(true)
    } catch {
      logger.error("Failed to complete initialization!")
    }

    process.exit(0)
  })()
}
