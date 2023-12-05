import { faker } from "@faker-js/faker"

import { expenseFactory } from "@/factories"
import { Expense } from "@/models"

import { buildNonTravelStatusDaysCorrectingLine } from "@/services/estimates/bulk-generate"

describe("api/src/services/estimates/bulk-generate/build-non-travel-status-days-correcting-line.ts", () => {
  describe("buildNonTravelStatusDaysCorrectingLine", () => {
    test("when given some estimates and daysOffTravelStatus, it returns an array of correcting lines", () => {
      // Arrange
      const accommodation1 = expenseFactory
        .estimate({ expenseType: Expense.ExpenseTypes.ACCOMODATIONS })
        .build({ cost: 250, date: new Date("2022-06-05") })
      const accommodation2 = expenseFactory
        .estimate({ expenseType: Expense.ExpenseTypes.ACCOMODATIONS })
        .build({ cost: 250, date: new Date("2022-06-06") })
      const transportation1 = expenseFactory
        .estimate({ expenseType: Expense.ExpenseTypes.TRANSPORTATION })
        .build({ cost: 350, date: new Date("2022-06-05") })
      const transportation2 = expenseFactory
        .estimate({ expenseType: Expense.ExpenseTypes.TRANSPORTATION })
        .build({ cost: 350, date: new Date("2022-06-07") })
      const mealsAndIncidentals1 = expenseFactory
        .estimate({ expenseType: Expense.ExpenseTypes.MEALS_AND_INCIDENTALS })
        .build({ cost: 98.45, date: new Date("2022-06-05") })
      const mealsAndIncidentals2 = expenseFactory
        .estimate({ expenseType: Expense.ExpenseTypes.MEALS_AND_INCIDENTALS })
        .build({ cost: 115.75, date: new Date("2022-06-06") })
      const mealsAndIncidentals3 = expenseFactory
        .estimate({ expenseType: Expense.ExpenseTypes.MEALS_AND_INCIDENTALS })
        .build({ cost: 61.35, date: new Date("2022-06-07") })
      const estimates = [
        accommodation1.dataValues,
        accommodation2.dataValues,
        transportation1.dataValues,
        transportation2.dataValues,
        mealsAndIncidentals1.dataValues,
        mealsAndIncidentals2.dataValues,
        mealsAndIncidentals3.dataValues,
      ]
      const daysOffTravelStatus = 2
      const travelAuthorizationId = faker.number.int({ min: 1, max: 1000 })
      const travelEndAt = faker.date.soon({ days: 30 })

      // Act
      const result = buildNonTravelStatusDaysCorrectingLine({
        estimates,
        daysOffTravelStatus,
        travelAuthorizationId,
        travelEndAt,
      })

      // Assert
      expect(result).toEqual({
        type: Expense.Types.ESTIMATE,
        expenseType: Expense.ExpenseTypes.NON_TRAVEL_STATUS,
        travelAuthorizationId,
        currency: "CAD",
        cost: -677.1,
        description: `2 day @ non-travel status per diem = -177.10 and 2 day @ non-travel status accomodation = -500.00`,
        date: travelEndAt,
      })
    })
  })
})
