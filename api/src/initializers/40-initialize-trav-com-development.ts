import { NODE_ENV, TRAV_COM_INITIALIZER_PATH } from "@/config"
import logger from "@/utils/logger"
import importAndExecuteInitializers from "@/utils/import-and-execute-initializers"

// NOTE: TravCom initializer is only run in non-production environments.
// This is because its an external service, but we still need to access a fake version in development.
export async function initializeTravComDevelopment(): Promise<void> {
  if (NODE_ENV === "production") return

  await importAndExecuteInitializers(TRAV_COM_INITIALIZER_PATH)
}

export default initializeTravComDevelopment


// Run via `dev ts-node ./src/initializers/40-initialize-trav-com-development.ts`
if (require.main === module) {
  ;(async () => {
    try {
      await initializeTravComDevelopment()
    } catch {
      logger.error("Failed to complete initialization!")
    }

    process.exit(0)
  })()
}
