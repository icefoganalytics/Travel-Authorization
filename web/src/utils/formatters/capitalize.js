import { startCase, toLower, isEmpty, isNil } from "lodash"

export function capitalize(text) {
  if (isNil(text) || isEmpty(text)) return text

  return startCase(toLower(text))
}

export default capitalize
