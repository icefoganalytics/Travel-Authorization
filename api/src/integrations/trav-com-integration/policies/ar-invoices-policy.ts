import { Attributes, FindOptions } from "sequelize"

import { Path } from "@/utils/deep-pick"
import { User } from "@/models"
import { ArInvoice } from "@/integrations/trav-com-integration/models"
import PolicyFactory from "@/policies/policy-factory"
import { allRecordsScope, noRecordsScope } from "@/policies/base-policy"

export class ArInvoicesPolicy extends PolicyFactory(ArInvoice) {
  show(): boolean {
    if (this.user.isTravelDeskUser || this.user.isAdmin) return true

    return false
  }

  create(): boolean {
    return false
  }

  update(): boolean {
    return false
  }

  destroy(): boolean {
    return false
  }

  permittedAttributes(): Path[] {
    return []
  }

  permittedAttributesForCreate(): Path[] {
    return [...this.permittedAttributes()]
  }

  static policyScope(user: User): FindOptions<Attributes<ArInvoice>> {
    if (user.isTravelDeskUser || user.isAdmin) {
      return allRecordsScope
    }

    return noRecordsScope
  }
}

export default ArInvoicesPolicy
