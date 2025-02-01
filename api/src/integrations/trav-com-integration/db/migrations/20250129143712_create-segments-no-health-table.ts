import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("segmentsNoHealth", (table) => {
    table.decimal("segmentID", 18, 0).notNullable()
    table.decimal("invoiceID", 18, 0).notNullable()
    table.decimal("invoiceDetailID", 18, 0).notNullable()
    table.tinyint("LegNumber").notNullable()
    table.string("DepartureCityCode", 5).nullable()
    table.datetime("DepartureInfo").nullable()
    table.string("ArrivalCityCode", 5).nullable()
    table.datetime("ArrivalInfo").nullable()
    table.string("AirlineCode", 3).nullable()
    table.string("FlightNumber", 5).nullable()
    table.string("ClassOfService", 2).nullable()
    table.string("FareBasis", 15).nullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("segmentsNoHealth")
}
