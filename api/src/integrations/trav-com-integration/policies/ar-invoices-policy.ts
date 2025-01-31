import { Attributes, FindOptions } from "sequelize"

import { Path } from "@/utils/deep-pick"
import { User } from "@/models"
import { ArInvoice } from "@/integrations/trav-com-integration/models"
import PolicyFactory from "@/policies/policy-factory"
import { allRecordsScope, noRecordsScope } from "@/policies/base-policy"

export class ArInvoicesPolicy extends PolicyFactory(ArInvoice) {
  // TODO: add ability for traveller to create/read/update/delete their own data
  // Might need to add travelerId to a bunch of models?
  show(): boolean {
    if (this.user.isTravelDeskUser || this.user.isAdmin) return true

    return false
  }

  create(): boolean {
    if (this.user.isTravelDeskUser || this.user.isAdmin) return true

    return false
  }

  update(): boolean {
    if (this.user.isTravelDeskUser || this.user.isAdmin) return true

    return false
  }

  destroy(): boolean {
    if (this.user.isTravelDeskUser || this.user.isAdmin) return true

    return false
  }

  permittedAttributes(): Path[] {
    if (this.user.isTravelDeskUser || this.user.isAdmin) {
      return []
    }

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
