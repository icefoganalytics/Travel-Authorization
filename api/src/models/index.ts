import db from "@/db/db-client"

import Stop from "./stop"
import Expense from "./expense"
import TravelAuthorization from "./travel-authorization"
import TravelDeskPassengerNameRecordDocument from "./travel-desk-passenger-name-record-document"

Stop.establishAssociations()
Expense.establishAssociations()
TravelAuthorization.establishAssociations()
TravelDeskPassengerNameRecordDocument.establishAssociations()

export * from "./auth"
export * from "./distance-matrix"
export * from "./expense"
export * from "./location"
export * from "./per-diem"
export * from "./preapproved-traveler"
export * from "./preapproved"
export * from "./stop"
export * from "./travel-authorization"
export * from "./travel-desk-passenger-name-record-document"
export * from "./travel-purpose"
export * from "./user"

// special db instance that has access to all models.
export default db
