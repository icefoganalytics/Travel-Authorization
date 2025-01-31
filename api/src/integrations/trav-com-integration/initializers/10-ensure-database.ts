import knex, { type Knex } from "knex"

import { TRAVCOM_DB_NAME } from "@/config"
import logger from "@/utils/logger"
import { isCredentialFailure } from "@/utils/db-error-helpers"
import { buildKnexConfig } from "@/integrations/trav-com-integration/db/db-migration-client"

async function databaseExists(dbMigrationClient: Knex, databaseName: string): Promise<boolean> {
  const result = await dbMigrationClient.raw("SELECT 1 FROM sys.databases WHERE name = ?", [
    databaseName,
  ])

  return result.length > 0
}

async function createDatabase(): Promise<true> {
  logger.info("Attempting direct to database connection to determine if database exists...")
  const databaseConfig = buildKnexConfig()
  let dbMigrationClient = knex(databaseConfig)
  let isCredentialFailureError = false

  try {
    if (await databaseExists(dbMigrationClient, TRAVCOM_DB_NAME)) {
      return true
    }
  } catch (error) {
    if (isCredentialFailure(error)) {
      isCredentialFailureError = true
      logger.info("Database connection failed due to invalid credential, retrying...")
    } else {
      logger.error(`Unknown connection failure, could not determine if database exists: ${error}`, {
        error,
      })
      throw error
    }
  }

  if (isCredentialFailureError) {
    logger.info("Attempting server-level connection to determine if database exists...")
    const serverLevelConfig = buildKnexConfig({ connection: { database: "" } })
    dbMigrationClient = knex(serverLevelConfig)
    try {
      if (await databaseExists(dbMigrationClient, TRAVCOM_DB_NAME)) {
        return true
      }
    } catch (error) {
      logger.error(
        `Could not determine if database exists database with server-level connection: ${error}`,
        { error }
      )
      throw error
    }
  }

  logger.info(`Database ${TRAVCOM_DB_NAME} does not exist: creating...`)
  try {
    await dbMigrationClient.raw(`CREATE DATABASE ${TRAVCOM_DB_NAME}`)
  } catch (error) {
    logger.error(`Failed to create database: ${error}`, { error })
    throw error
  }

  return true
}

export default createDatabase
