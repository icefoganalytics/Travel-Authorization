import { isEmpty, isNil } from "lodash"

import db from "@/db/db-client"

import BaseService from "@/services/base-service"
import { Users } from "@/services"
import { TravelAuthorization, TravelAuthorizationActionLog, User } from "@/models"

export class ExpenseClaimService extends BaseService {
  private travelAuthorization: TravelAuthorization
  private supervisorEmail: string
  private currentUser: User

  constructor(
    travelAuthorization: TravelAuthorization,
    supervisorEmail: string,
    currentUser: User
  ) {
    super()
    this.travelAuthorization = travelAuthorization
    this.supervisorEmail = supervisorEmail
    this.currentUser = currentUser
  }

  async perform(): Promise<TravelAuthorization> {
    if (this.travelAuthorization.status !== TravelAuthorization.Statuses.APPROVED) {
      throw new Error(
        "Travel authorization must be in an approved state to submit an expense claim."
      )
    }

    if (isNil(this.supervisorEmail)) {
      throw new Error("Supervisor email is required for expense claim submission.")
    }

    await db.transaction(async () => {
      const supervisor = await Users.EnsureService.perform(
        {
          email: this.supervisorEmail,
        },
        this.currentUser
      ).catch((error) => {
        throw new Error(`Failed to ensure supervisor: ${error}`)
      })

      await this.travelAuthorization.update({
        supervisorEmail: this.supervisorEmail,
        status: TravelAuthorization.Statuses.EXPENSE_CLAIM,
      })
      await TravelAuthorizationActionLog.create({
        travelAuthorizationId: this.travelAuthorization.id,
        actorId: this.currentUser.id,
        assigneeId: supervisor.id,
        action: TravelAuthorizationActionLog.Actions.EXPENSE_CLAIM,
      })
    })

    return this.travelAuthorization.reload({
      include: ["expenses", "stops", "purpose", "user", "travelSegments"],
    })
  }
}

export default ExpenseClaimService
