import { isEmpty, isNil, last, first, pick } from "lodash"

import { Expense, Stop, TravelAuthorization, TravelDeskTravelRequest, User } from "@/models"

import BaseSerializer from "./base-serializer"
import StopsSerializer, { StopDetailedView } from "./stops-serializer"
import UsersSerializer, { UserDetailedView } from "./users-serializer"

export type TravelAuthorizationDetailedView = Omit<
  Partial<TravelAuthorization>,
  "stops" | "user"
> & {
  stops: StopDetailedView[]
  user: UserDetailedView
}

export class TravelAuthorizationsSerializer extends BaseSerializer<TravelAuthorization> {
  static asTable(travelAuthorizations: TravelAuthorization[]) {
    return travelAuthorizations.map((travelAuthorization) => {
      const serializer = new this(travelAuthorization)
      return serializer.asTableRow()
    })
  }

  static asDetailed(record: TravelAuthorization): TravelAuthorizationDetailedView {
    const serializer = new this(record)
    return serializer.asDetailed()
  }

  private firstStop: Stop | undefined
  private lastStop: Stop | undefined
  private currentDate: Date
  private user: User

  constructor(record: TravelAuthorization) {
    super(record)
    this.firstStop = first(this.record.stops)
    this.lastStop = last(this.record.stops)
    this.currentDate = new Date()
    this.user = record.user
  }

  asDetailed(): TravelAuthorizationDetailedView {
    return {
      ...this.record.dataValues,
      user: UsersSerializer.asDetailed(this.user),
      stops: this.record.stops?.map(StopsSerializer.asDetailed) || [],
    }
  }

  asTableRow() {
    return {
      ...pick(this.record, ["id", "eventName"]),
      finalDestination: this.lastStop?.location,
      departingAt: this.firstStop?.departureAt,
      returningAt: this.lastStop?.departureAt,
      phase: this.determinePhase(),
      status: this.determineStatus(),
      action: this.determineAction(),
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      department: this.user.department,
      branch: this.user.branch,
    }
  }

  // TODO: double check the order of these conditions
  determinePhase() {
    if (this.isDraft() || this.awaitingDirectorApproval()) {
      return "travel_approval"
    } else if (this.beforeTravelling() && (this.isApproved() || this.isBooked())) {
      return "travel_planning"
    } else if (this.isTravelling()) {
      return "travelling"
    } else if (this.travellingComplete()) {
      return "travel_complete"
    } else if (this.hasExpenses()) {
      return "expensing"
    } else if (this.isExpensed()) {
      return "expensed"
    } else {
      return undefined
    }
  }

  determineStatus() {
    if (this.isTravelling() && this.isApproved()) {
      return "travelling"
    } else {
      return this.record.status
    }
  }

  // TODO: double check the order of these conditions
  determineAction() {
    if (this.isApproved() && this.anyTransportTypeIsAircraft()) {
      return ["submit_travel_desk_request"]
    } else if (this.travellingComplete()) {
      return ["submit_expense_claim"]
    } else if (this.travelDeskRequestIsComplete()) {
      return ["view_itinerary"]
    } else if (this.isApproved() && this.isTravelling()) {
      return ["add_expense"]
    } else if (this.isApproved() && this.anyTransportTypeIsPoolVehicle()) {
      return ["submit_pool_vehicle_request"]
    } else {
      return []
    }
  }

  isBooked() {
    return this.record.status === TravelAuthorization.Statuses.BOOKED
  }

  isDraft() {
    return this.record.status === TravelAuthorization.Statuses.DRAFT
  }

  isExpensed() {
    return this.record.status === TravelAuthorization.Statuses.EXPENSED
  }

  isApproved() {
    return this.record.status === TravelAuthorization.Statuses.APPROVED
  }

  awaitingDirectorApproval() {
    return this.record.status === TravelAuthorization.Statuses.AWAITING_DIRECTOR_APPROVAL
  }

  beforeTravelling() {
    if (isNil(this.firstStop) || isNil(this.firstStop.departureAt)) {
      return false
    }

    if (this.currentDate < this.firstStop.departureAt) {
      return true
    }

    return false
  }

  isTravelling() {
    if (
      isNil(this.firstStop) ||
      isNil(this.lastStop) ||
      isNil(this.firstStop.departureAt) ||
      isNil(this.lastStop.departureAt)
    ) {
      return false
    }

    if (
      this.firstStop.departureAt <= this.currentDate &&
      this.currentDate <= this.lastStop.departureAt
    ) {
      return true
    }

    return false
  }

  travellingComplete() {
    if (isNil(this.lastStop) || isNil(this.lastStop.departureAt)) {
      return false
    }

    if (this.currentDate > this.lastStop.departureAt) {
      return true
    }

    return false
  }

  hasExpenses() {
    const expenses = this.record.expenses?.filter(
      (expense) => expense.type === Expense.Types.EXPENSE
    )
    return !isEmpty(expenses)
  }

  anyTransportTypeIsAircraft() {
    return this.record.stops?.some((stop) => stop.transport === Stop.TravelMethods.AIRCRAFT)
  }

  anyTransportTypeIsPoolVehicle() {
    return this.record.stops?.some((stop) => stop.transport === Stop.TravelMethods.POOL_VEHICLE)
  }

  travelDeskRequestIsComplete() {
    return this.record.travelDeskTravelRequest?.status === TravelDeskTravelRequest.Statuses.BOOKED
  }
}

export default TravelAuthorizationsSerializer
