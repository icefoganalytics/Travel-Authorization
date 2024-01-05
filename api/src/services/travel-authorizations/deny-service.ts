import db from "@/db/db-client"

import BaseService from "@/services/base-service"
import { TravelAuthorization, TravelAuthorizationActionLog, User } from "@/models"

export class DenyService extends BaseService {
  private travelAuthorization: TravelAuthorization
  private denier: User

  constructor(travelAuthorization: TravelAuthorization, denier: User) {
    super()
    this.travelAuthorization = travelAuthorization
    this.denier = denier
  }

  async perform(): Promise<TravelAuthorization> {
    if (this.travelAuthorization.status === TravelAuthorization.Statuses.SUBMITTED) {
      await db.transaction(async () => {
        await this.travelAuthorization.update({
          // TODO: add support for denial reason
          // denialReason: "???",
          status: TravelAuthorization.Statuses.DENIED,
        })
        await TravelAuthorizationActionLog.create({
          travelAuthorizationId: this.travelAuthorization.id,
          actorId: this.denier.id,
          assigneeId: this.travelAuthorization.userId,
          action: TravelAuthorizationActionLog.Actions.DENIED,
        })
      })
    } else if (
      this.travelAuthorization.status === TravelAuthorization.Statuses.EXPENSE_CLAIM_SUBMITTED
    ) {
      await db.transaction(async () => {
        await this.travelAuthorization.update({
          // TODO: add support for denial reason
          // denialReason: "???",
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_DENIED,
        })
        await TravelAuthorizationActionLog.create({
          travelAuthorizationId: this.travelAuthorization.id,
          actorId: this.denier.id,
          assigneeId: this.travelAuthorization.userId,
          action: TravelAuthorizationActionLog.Actions.EXPENSE_CLAIM_DENIED,
        })
      })
    } else {
      throw new Error(
        "Travel authorization must be in submitted or expense claim submitted state to deny."
      )
    }

    return this.travelAuthorization.reload({ include: ["expenses", "stops", "purpose", "user"] })
  }
}

export default DenyService
