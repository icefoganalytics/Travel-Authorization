import { logger } from "@/utils/logger"
import * as fs from "fs/promises"
import * as path from "path"

const NON_INITIALIZER_REGEX = /^index\.(ts|js)$/

export async function importAndExecuteInitializers(initializersPath: string) {
  const files = await fs.readdir(initializersPath)

  for (const file of files) {
    if (NON_INITIALIZER_REGEX.test(file)) continue

    const modulePath = path.join(initializersPath, file)
    logger.info(`Running initializer: ${modulePath}`)

    try {
      const { default: initializerAction } = await require(modulePath)
      await initializerAction()
    } catch (error) {
      logger.error(`Failed to run initializer: ${modulePath} -> ${error}`, { error })
      throw error
    }
  }

  return true
}

export default importAndExecuteInitializers
