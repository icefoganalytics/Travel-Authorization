import { isEmpty, isNil } from "lodash"
import { DateTime } from "luxon"

export function formatDate(date, format = "MMM d yyyy") {
  if (isNil(date) || isEmpty(date)) {
    return ""
  }

  const datetime = DateTime.fromISO(date)
  if (datetime.isValid) {
    return datetime.toFormat(format)
  }

  return ""
}

export default formatDate
