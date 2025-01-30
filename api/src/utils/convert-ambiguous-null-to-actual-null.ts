import { isNil, isEmpty } from "lodash"

/**
 * Convert "NULL" or empty values to actual null for SQL compatibility
 */
export function convertAmbiguousNullToActualNull<T>(value: T | null | undefined): T | null {
  if (value === "NULL" || isNil(value) || isEmpty(value)) {
    return null
  }

  return value
}

export default convertAmbiguousNullToActualNull
