export const lessThanDate =
  (b, { referenceFieldLabel }) =>
  (a) =>
    new Date(a) < new Date(b) || `This field must be less than ${b || referenceFieldLabel}`

export default lessThanDate
