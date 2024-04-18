import { isNil, isUndefined } from "lodash"

import db, {
  TravelAuthorization,
  TravelAuthorizationActionLog,
  TravelDeskTravelRequest,
  TravelPurpose,
  TravelSegment,
  User,
} from "@/models"

import BaseService from "@/services/base-service"

export class ApproveService extends BaseService {
  private travelAuthorization: TravelAuthorization
  private approver: User

  constructor(travelAuthorization: TravelAuthorization, approver: User) {
    super()
    this.travelAuthorization = travelAuthorization
    this.approver = approver
  }

  async perform(): Promise<TravelAuthorization> {
    if (this.travelAuthorization.status !== TravelAuthorization.Statuses.SUBMITTED) {
      throw new Error("Travel authorization must be in submitted state to approve.")
    }

    const { travelSegments, user, purpose } = this.travelAuthorization
    if (isUndefined(travelSegments)) {
      throw new Error("Travel authorization expected to have travel segments association.")
    }

    if (isUndefined(user)) {
      throw new Error("Travel authorization expected to have user association.")
    }

    if (isUndefined(purpose)) {
      throw new Error("Travel authorization expected to have purpose association.")
    }

    await db.transaction(async () => {
      await this.travelAuthorization.update({
        status: TravelAuthorization.Statuses.APPROVED,
      })

      if (this.isTravelingByAir(travelSegments)) {
        await this.createTravelDeskTravelRequest(user, purpose)
      }

      await TravelAuthorizationActionLog.create({
        travelAuthorizationId: this.travelAuthorization.id,
        actorId: this.approver.id,
        assigneeId: this.travelAuthorization.userId,
        action: TravelAuthorizationActionLog.Actions.APPROVED,
      })
    })

    return this.travelAuthorization.reload({ include: ["expenses", "stops", "purpose", "user"] })
  }

  private isTravelingByAir(travelSegments: TravelSegment[]): boolean {
    return travelSegments.some(
      (segment) => segment.modeOfTransport === TravelSegment.TravelMethods.AIRCRAFT
    )
  }

  private async createTravelDeskTravelRequest(
    user: User,
    purpose: TravelPurpose
  ): Promise<TravelDeskTravelRequest> {
    const { firstName, lastName, email } = user
    if (isNil(firstName)) {
      throw new Error("User expected to have first name.")
    }

    if (isNil(lastName)) {
      throw new Error("User expected to have last name.")
    }

    // TODO: decide how to handle these fields
    // Either make fields nullable, or ensure values are set before
    // getting to this point.
    return TravelDeskTravelRequest.create({
      travelAuthorizationId: this.travelAuthorization.id,
      legalFirstName: firstName,
      legalLastName: lastName,
      strAddress: "TODO",
      city: "TODO",
      province: "TODO",
      postalCode: "TODO",
      busPhone: "TODO",
      busEmail: "TODO",
      travelPurpose: purpose.purpose,
      status: TravelDeskTravelRequest.Statuses.DRAFT,
    })
  }
}

export default ApproveService
