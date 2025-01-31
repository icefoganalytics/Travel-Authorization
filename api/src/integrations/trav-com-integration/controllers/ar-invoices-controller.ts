import { isNil } from "lodash"

import logger from "@/utils/logger"

import { ArInvoice } from "@/integrations/trav-com-integration/models"
import { ArInvoicesPolicy } from "@/integrations/trav-com-integration/policies"
import BaseController from "@/controllers/base-controller"

export class ArInvoicesController extends BaseController<ArInvoice> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder()

      const scopedArInvoices = ArInvoicesPolicy.applyScope(scopes, this.currentUser)

      const totalCount = await scopedArInvoices.count({ where })
      const arInvoices = await scopedArInvoices.findAll({
        where,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
        order,
        // include: ["details", "segments"],
      })
      return this.response.status(200).json({
        arInvoices,
        totalCount,
      })
    } catch (error) {
      logger.error(`Error fetching AR invoices: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve AR invoices: ${error}`,
      })
    }
  }

  async show() {
    try {
      const arInvoice = await this.loadArInvoice()
      if (isNil(arInvoice)) {
        return this.response.status(404).json({
          message: "AR invoice not found.",
        })
      }

      const policy = this.buildPolicy(arInvoice)
      if (!policy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to view this AR invoice.",
        })
      }

      return this.response.status(200).json({
        arInvoice,
        policy,
      })
    } catch (error) {
      logger.error(`Error fetching AR invoice: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve AR invoice: ${error}`,
      })
    }
  }

  private async loadArInvoice() {
    return await ArInvoice.findByPk(this.params.arInvoiceId)
  }

  private buildPolicy(arInvoice: ArInvoice = ArInvoice.build()) {
    return new ArInvoicesPolicy(this.currentUser, arInvoice)
  }
}

export default ArInvoicesController
