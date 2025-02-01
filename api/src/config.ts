import path from "path"
import * as dotenv from "dotenv"

let dotEnvPath
switch (process.env.NODE_ENV) {
  case "test":
    dotEnvPath = path.resolve(__dirname, "../.env.test")
    break
  case "production":
    dotEnvPath = path.resolve(__dirname, "../.env.production")
    break
  default:
    dotEnvPath = path.resolve(__dirname, "../.env.development")
}
dotenv.config({
  path: dotEnvPath,
})

if (process.env.NODE_ENV !== "test") {
  console.log("Loading env: ", dotEnvPath)
}

export const API_PORT = parseInt(process.env.API_PORT || "3000")
export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:8080"
export const AUTH_REDIRECT = process.env.AUTH_REDIRECT || process.env.FRONTEND_URL || ""
export const AUTH0_DOMAIN = (process.env.AUTH0_DOMAIN || "").replace(/\/+$/, "")
export const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE || ""
export const NODE_ENV = process.env.NODE_ENV
export const APP_ROOT = path.resolve(__dirname)

export const DB_NAME = process.env.DB_NAME || ""
export const DB_USER = process.env.DB_USER || ""
export const DB_PASS = process.env.DB_PASS || ""
export const DB_HOST = process.env.DB_HOST || ""
export const DB_PORT = parseInt(process.env.DB_PORT || "1433")

export const AZURE_KEY = process.env.AZURE_KEY || ""

export const DB_CONFIG = {
  client: "postgres",
  connection: {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    port: DB_PORT,
  },
  pool: { min: 0, max: 10, idleTimeoutMillis: 1000 },
  migrations: {
    schemaName: "public",
    tableName: "knex_migrations",
    // TODO: enable once https://github.com/knex/knex/pull/5422 gets merged
    // getNewMigrationName: (name) => {
    //   return `${someDateFormat(...)}-${name}.ts`;
    // }
    directory: path.resolve(__dirname, "./db/migrations"),
  },
  seeds: {
    directory: path.resolve(__dirname, `./db/seeds/${NODE_ENV}`),
  },
}

export const TRAVCOM_DB_NAME = process.env.TRAVCOM_DB_NAME || ""
export const TRAVCOM_DB_USER = process.env.TRAVCOM_DB_USER || ""
export const TRAVCOM_DB_PASS = process.env.TRAVCOM_DB_PASS || ""
export const TRAVCOM_DB_HOST = process.env.TRAVCOM_DB_HOST || ""
export const TRAVCOM_DB_PORT = parseInt(process.env.TRAVCOM_DB_PORT || "1433")

export const TRAVCOM_DB_CONFIG = {
  client: "mssql",
  connection: {
    host: TRAVCOM_DB_HOST,
    user: TRAVCOM_DB_USER,
    password: TRAVCOM_DB_PASS,
    database: TRAVCOM_DB_NAME,
    port: TRAVCOM_DB_PORT,
  },
  pool: { min: 0, max: 10, idleTimeoutMillis: 1000 },
  migrations: {
    schemaName: "dbo",
    tableName: "knex_migrations",
    directory: path.resolve(__dirname, "./integrations/trav-com-integration/db/migrations"),
  },
  seeds: {
    directory: path.resolve(__dirname, "./integrations/trav-com-integration/db/seeds"),
  },
}

export const TRAV_COM_INITIALIZER_PATH = path.join(
  __dirname,
  "integrations/trav-com-integration/initializers"
)

export const RELEASE_TAG = process.env.RELEASE_TAG || ""
export const GIT_COMMIT_HASH = process.env.GIT_COMMIT_HASH || ""

export const AWS_LOGGING_ENABLED = process.env.AWS_LOGGING_ENABLED || "false"
export const AWS_LOGGING_GROUP = process.env.AWS_LOGGING_GROUP || ""
export const AWS_LOGGING_STREAM = process.env.AWS_LOGGING_STREAM || ""
export const AWS_LOGGING_REGION = process.env.AWS_LOGGING_REGION || "ca-central-1"
export const AWS_LOGGING_ACCESS_ID = process.env.AWS_LOGGING_ACCESS_ID || ""
export const AWS_LOGGING_ACCESS_KEY = process.env.AWS_LOGGING_ACCESS_KEY || ""
export const DEFAULT_LOG_LEVEL = process.env.DEFAULT_LOG_LEVEL || "debug"

export const DB_HEALTH_CHECK_INTERVAL_SECONDS = parseInt(
  process.env.DB_HEALTH_CHECK_INTERVAL_SECONDS || "5"
)
export const DB_HEALTH_CHECK_TIMEOUT_SECONDS = parseInt(
  process.env.DB_HEALTH_CHECK_TIMEOUT_SECONDS || "10"
)
export const DB_HEALTH_CHECK_RETRIES = parseInt(process.env.DB_HEALTH_CHECK_RETRIES || "3")
export const DB_HEALTH_CHECK_START_PERIOD_SECONDS = parseInt(
  process.env.DB_HEALTH_CHECK_START_PERIOD_SECONDS || "5"
)
