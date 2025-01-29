import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("ARInvoiceDetailsNoHealth", (table) => {
    table.decimal("InvoiceDetailID", 18, 0).notNullable()
    table.decimal("InvoiceID", 18, 0).notNullable()
    table.tinyint("TransactionType").notNullable()
    table.string("VendorNumber", 8).notNullable()
    table.string("VendorName", 50).notNullable()
    table.tinyint("ProductCode").notNullable()
    table.string("PassengerName", 50).notNullable()
    table.string("TicketNumber", 20).notNullable()
    table.specificType("PublishedFare", "money").notNullable()
    table.specificType("SellingFare", "money").notNullable()
    table.specificType("ReferenceFare", "money").notNullable()
    table.specificType("LowFare", "money").notNullable()
    table.specificType("Tax1", "money").notNullable()
    table.specificType("GrossAmount", "money").notNullable()
    table.specificType("CommissionAmount", "money").notNullable()
    table.specificType("VatOnCommission", "money").notNullable()
    table.text("FreeFieldA").nullable()
    table.datetime("TravelDate").nullable()
    table.datetime("ReturnDate").nullable()
    table.smallint("NumberOfDays").nullable()
    table.string("CityCode", 5).nullable()
    table.string("ProfileNumber", 10).nullable()
    table.decimal("AddedBy", 18, 0).notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("ARInvoiceDetailsNoHealth")
}
