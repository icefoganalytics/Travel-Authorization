export const greaterThanDate =
  (b, { referenceFieldLabel }) =>
  (a) =>
    new Date(a) > new Date(b) || `This field must be greater than ${b || referenceFieldLabel}`

export default greaterThanDate
