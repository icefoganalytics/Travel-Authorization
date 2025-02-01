import { Sequelize, Options } from "sequelize"
import { createNamespace } from "cls-hooked"

import {
  TRAVCOM_DB_NAME,
  TRAVCOM_DB_USER,
  TRAVCOM_DB_PASS,
  TRAVCOM_DB_HOST,
  TRAVCOM_DB_PORT,
  NODE_ENV,
} from "@/config"

export const transactionManager = createNamespace("transaction-manager-trav-com")
Sequelize.useCLS(transactionManager)

if (TRAVCOM_DB_NAME === undefined) throw new Error("database name is unset.")
if (TRAVCOM_DB_USER === undefined) throw new Error("database username is unset.")
if (TRAVCOM_DB_PASS === undefined) throw new Error("database password is unset.")
if (TRAVCOM_DB_HOST === undefined) throw new Error("database host is unset.")
if (TRAVCOM_DB_PORT === undefined) throw new Error("database port is unset.")

export const SEQUELIZE_CONFIG: Options = {
  username: TRAVCOM_DB_USER,
  password: TRAVCOM_DB_PASS,
  database: TRAVCOM_DB_NAME,
  dialect: "mssql",
  host: TRAVCOM_DB_HOST,
  port: TRAVCOM_DB_PORT,
  schema: "dbo",
  logging: NODE_ENV === "development" ? console.log : false,
  // Non-standard tables must now declare their customizations
  // If possible, standardize new tables, rather than customizing them.
  define: {
    underscored: true,
    timestamps: true, // This is actually the default, but making it explicit for clarity.
    paranoid: true,
    whereMergeStrategy: "and", // where fields will be merged using the and operator (instead of overwriting each other)
  },
}

export const db = new Sequelize(SEQUELIZE_CONFIG)

export default db
