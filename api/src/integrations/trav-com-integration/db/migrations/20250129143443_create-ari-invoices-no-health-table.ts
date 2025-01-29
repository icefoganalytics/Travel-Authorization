import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("ARInvoicesNoHealth", (table) => {
    table.decimal("InvoiceID", 18, 0).notNullable()
    table.string("InvoiceNumber", 10).notNullable()
    table.string("ProfileNumber", 10).nullable()
    table.string("ProfileName", 50).nullable()
    table.string("Department", 30).nullable()
    table.datetime("BookingDate").nullable()
    table.datetime("SystemDate").nullable()
    table.string("Description", 50).nullable()
    table.text("InvoiceRemarks").nullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("ARInvoicesNoHealth")
}
