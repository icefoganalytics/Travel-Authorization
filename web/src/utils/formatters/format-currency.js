import { isNil } from "lodash"

export function formatCurrency(amount, currency = "CAD") {
  if (isNil(amount)) {
    return ""
  }

  const minimumFractionDigits = amount > 1 ? 2 : 3
  const maximumFractionDigits = amount > 1 ? 2 : 3
  const formatter = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  })
  return formatter.format(amount)
}

export default formatCurrency
