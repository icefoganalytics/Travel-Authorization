import logger from "@/utils/logger"
import travComDbClient from "@/integrations/trav-com-integration/db/trav-com-db-client"

type MigrationInfo = {
  file: string
  directory: string
}

async function runMigrations(): Promise<void> {
  const [_completedMigrations, pendingMigrations]: [MigrationInfo[], MigrationInfo[]] =
    await travComDbClient.migrate.list()

  if (pendingMigrations.length === 0) {
    logger.info("No pending migrations.")
    return
  }

  for (const { file, directory } of pendingMigrations) {
    logger.info(`Running migration: ${directory}/${file}`)
    try {
      await travComDbClient.migrate.up()
    } catch (error) {
      logger.error(`Error running migration: ${error}`, { error })
      throw error
    }
  }

  logger.info("All migrations completed successfully.")
}

export default runMigrations
