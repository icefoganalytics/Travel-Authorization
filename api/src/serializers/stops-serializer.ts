import { isNil } from "lodash"

import { Stop } from "@/models"

import BaseSerializer from "./base-serializer"

export type StopDetailedView = Partial<Stop>

export class StopsSerializer extends BaseSerializer<Stop> {
  static asDetailed(stop: Stop): StopDetailedView {
    const serializer = new StopsSerializer(stop)
    return serializer.asDetailed()
  }

  asDetailed(): StopDetailedView {
    return {
      ...this.record.dataValues,
      departureTime: this.formatTimeToHHmm(),
    }
  }

  formatTimeToHHmm(): string | null {
    const timeString = this.record.departureTime
    if (isNil(timeString)) return null

    return timeString.split(":").slice(0, 2).join(":")
  }
}

export default StopsSerializer
