import { isNull, minBy } from "lodash"

import { Expense, TravelAuthorization } from "@/models"
import ExpensesService from "./expenses-service"
import StopsService from "./stops-service"

// DEPRECATED: superseded by the TravelAuthorizationsService
export class FormService {
  //returns form
  async getForm(slug: string): Promise<any | undefined> {
    console.warn(
      "This method is deprecated, and will be removed in a future version. Please use Form.findByPK instead, see FormsController#show"
    )
    try {
      const form = await TravelAuthorization.findOne({
        where: { slug },
        include: ["stops"],
      })

      if (isNull(form)) {
        return undefined
      }

      const expenses = await this.getExpenses(form.id)
      const estimates = await this.getEstimates(form.id)

      // @ts-ignore - not worth fixing as code is deprecated
      form.estimates = estimates
      form.expenses = expenses

      const { stops } = form
      const earliestStop = minBy(stops, "departureDate")
      // @ts-ignore - not worth fixing as code is deprecated
      form.departureDate = earliestStop?.departureDate

      return form
    } catch (error: any) {
      console.log(error)
      return undefined
    }
  }

  async saveForm(userId: number, form: any): Promise<any | undefined> {
    console.warn(
      "This method is deprecated, and will be removed in a future version. Please use FormsService#update instead."
    )
    try {
      let stops = form.stops
      let expenses = form.expenses
      let estimates = form.estimates

      delete form.stops
      delete form.expenses
      delete form.estimates
      delete form.departureDate

      form.userId = userId
      form.status = "Draft"

      console.log(form)

      const [returnedForm, _] = await TravelAuthorization.upsert(form, {
        conflictFields: ["slug"],
      })
      const id = returnedForm.id

      await StopsService.bulkReplace(id, stops)
      await this.saveExpenses(id, expenses)
      await this.saveEstimates(id, estimates)

      return true
    } catch (error: any) {
      console.log(error)
      return false
    }
  }

  async getExpenses(travelAuthorizationId: number): Promise<any[] | undefined> {
    try {
      return Expense.findAll({
        where: {
          travelAuthorizationId,
          type: Expense.Types.EXPENSE,
        },
      })
    } catch (error: any) {
      console.log(error)
      return undefined
    }
  }

  async saveExpenses(travelAuthorizationId: number, expenses: any): Promise<Boolean> {
    try {
      await ExpensesService.bulkReplace(travelAuthorizationId, expenses)
      return true
    } catch (error: any) {
      console.log(error)
      return false
    }
  }

  async getEstimates(travelAuthorizationId: number): Promise<any[] | undefined> {
    try {
      return Expense.findAll({
        where: {
          travelAuthorizationId,
          type: Expense.Types.ESTIMATE,
        },
      })
    } catch (error: any) {
      console.log(error)
      return undefined
    }
  }

  async saveEstimates(travelAuthorizationId: number, estimates: any): Promise<Boolean> {
    console.warn("DEPRECATED: use saveEstimates instead.")
    return this.saveExpenses(travelAuthorizationId, estimates)
  }

  async submitForm(userId: number, form: any): Promise<Boolean> {
    console.warn(
      "This method is deprecated, and will be removed in a future version. Please use FormsService#create instead."
    )
    try {
      let stops = form.stops
      delete form.stops

      let expenses = form.expenses
      delete form.expenses

      let estimates = form.estimates
      delete form.estimates

      delete form.departureDate

      // This is where we would check if the form is valid
      if (true) {
        form.userId = userId
        form.status = "Submitted"

        const [returnedForm, _] = await TravelAuthorization.upsert(form, {
          conflictFields: ["slug"],
        })
        const id = returnedForm.id

        await StopsService.bulkReplace(id, stops)
        await this.saveExpenses(id, expenses)
        await this.saveEstimates(id, estimates)
        return true
      } else {
        throw new Error("Form is missing required fields")
      }
    } catch (error: any) {
      console.log(error)
      return false
    }
  }
}

export default FormService
