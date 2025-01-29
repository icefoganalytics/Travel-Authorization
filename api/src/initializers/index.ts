import logger from "@/utils/logger"
import importAndExecuteInitializers from "@/utils/import-and-execute-initializers"

if (require.main === module) {
  // TODO: add some kind of middleware that 503s? if initialization failed?
  ;(async () => {
    try {
      await importAndExecuteInitializers(__dirname)
    } catch {
      logger.error("Failed to complete initialization!")
    }

    process.exit(0)
  })()
}
