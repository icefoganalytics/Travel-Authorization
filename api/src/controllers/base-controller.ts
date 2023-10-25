import { NextFunction, Request, Response } from "express"

import User from "@/models/user"

export type Actions = "index" | "show" | "new" | "edit" | "create" | "update" | "destroy"

// See https://guides.rubyonrails.org/routing.html#crud-verbs-and-actions
export class BaseController {
  protected request: Request
  protected response: Response
  protected next: NextFunction

  constructor(req: Request, res: Response, next: NextFunction) {
    this.request = req
    this.response = res
    this.next = next
  }

  static get index() {
    return (req: Request, res: Response, next: NextFunction) => {
      const controllerInstance = new this(req, res, next)
      return controllerInstance.index()
    }
  }

  // Usage app.post("/api/users", UsersController.create)
  // maps /api/users to UsersController#create()
  static get create() {
    return (req: Request, res: Response, next: NextFunction) => {
      const controllerInstance = new this(req, res, next)
      return controllerInstance.create()
    }
  }

  static get show() {
    return (req: Request, res: Response, next: NextFunction) => {
      const controllerInstance = new this(req, res, next)
      return controllerInstance.show()
    }
  }

  static get update() {
    return (req: Request, res: Response, next: NextFunction) => {
      const controllerInstance = new this(req, res, next)
      return controllerInstance.update()
    }
  }

  static get destroy() {
    return (req: Request, res: Response, next: NextFunction) => {
      const controllerInstance = new this(req, res, next)
      return controllerInstance.destroy()
    }
  }

  index() {
    throw new Error("Not Implemented")
  }

  create() {
    throw new Error("Not Implemented")
  }

  show() {
    throw new Error("Not Implemented")
  }

  update() {
    throw new Error("Not Implemented")
  }

  destroy() {
    throw new Error("Not Implemented")
  }

  // Internal helpers

  // This should have been loaded in the authorization middleware
  // Currently assuming that authorization happens before this controller gets called.
  // Child controllers that are on an non-authorizable route should override this method
  // and return undefined
  get currentUser(): User {
    // TODO: fix this upstream so that this.request.user is a valid user, and
    // doesn't need to be hacked together here.
    const legacyUserDataFormat = this.request.user
    const user = User.build({
      id: legacyUserDataFormat.id,
      sub: legacyUserDataFormat.sub,
      email: legacyUserDataFormat.email,
      status: legacyUserDataFormat.status,
      firstName: legacyUserDataFormat.first_name,
      lastName: legacyUserDataFormat.last_name,
      roles: legacyUserDataFormat.roles.join(","),
      department: legacyUserDataFormat.department,
      createDate: new Date(legacyUserDataFormat.create_date),
    })
    return user
  }

  get params() {
    return this.request.params
  }

  get query() {
    return this.request.query
  }

  get pagination() {
    const page = parseInt(this.query.page?.toString() || "") || 1
    const perPage = parseInt(this.query.perPage?.toString() || "") || 10
    const limit = perPage === -1 ? 1000 : perPage // restrict max limit to 1000 for safety
    const offset = (page - 1) * limit
    return {
      page,
      perPage,
      limit,
      offset,
    }
  }
}

export default BaseController
