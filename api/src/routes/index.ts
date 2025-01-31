import { Router, Request, Response, NextFunction, ErrorRequestHandler } from "express"
import { DatabaseError } from "sequelize"

import logger from "@/utils/logger"
import { GIT_COMMIT_HASH, RELEASE_TAG } from "@/config"
import { TravComIntegration } from "@/integrations"
import { databaseHealthCheckMiddleware, jwtMiddleware, authorizationMiddleware } from "@/middleware"
import { healthCheckRouter } from "@/routes/healthcheck-router"
import {
  CurrentUserController,
  Expenses,
  ExpensesController,
  GeneralLedgerCodingsController,
  LocationsController,
  PerDiemsController,
  Qa,
  StopsController,
  TravelAllowancesController,
  TravelAuthorizationActionLogsController,
  TravelAuthorizationPreApprovalProfilesController,
  TravelAuthorizationPreApprovalsController,
  TravelAuthorizations,
  TravelAuthorizationsController,
  TravelDeskFlightOptions,
  TravelDeskFlightOptionsController,
  TravelDeskFlightRequestsController,
  TravelDeskFlightSegmentsController,
  TravelDeskHotelsController,
  TravelDeskOtherTransportationsController,
  TravelDeskQuestionsController,
  TravelDeskRentalCarsController,
  TravelDeskTravelAgenciesController,
  TravelDeskTravelRequests,
  TravelDeskTravelRequestsController,
  TravelPurposesController,
  Users,
  UsersController,
} from "@/controllers"

//// START LEGACY IMPORTS
import { migrateRouter } from "./migrate-router"
import { formRouter } from "./form-router"
import { userRouter } from "./users-router"
import { preapprovedRouter } from "./preapproved-router"
import { travelDeskRouter } from "./traveldesk-router"
import { travComRouter } from "./travCom-router"
import { reconcileRouter } from "./reconcile-router"
import { lookupRouter } from "./lookup-router"
import { lookupTableRouter } from "./lookup-tables-router"
//// END LEGACY IMPORTS

export const router = Router()

// non-api (no authentication is required) routes
router.route("/_status").get((_req: Request, res: Response) => {
  return res.json({
    RELEASE_TAG,
    GIT_COMMIT_HASH,
  })
})

// TODO: move all route actions into controllers
// TODO: convert all routes to use the router.route(/path).action(...).action(...) syntax
//// START LEGACY ROUTES
router.use("/migrate", databaseHealthCheckMiddleware)
router.use(migrateRouter)

router.use("/api/lookup", databaseHealthCheckMiddleware, lookupRouter)
router.use("/api/lookup-tables", databaseHealthCheckMiddleware, lookupTableRouter)
//// END LEGACY ROUTES

// api routes
router.use("/api", databaseHealthCheckMiddleware, jwtMiddleware, authorizationMiddleware)

//// START MORE LEGACY ROUTES
router.use("/api/form", formRouter)
router.use("/api/user", userRouter)
router.use("/api/preapproved", preapprovedRouter)
router.use("/api/traveldesk", travelDeskRouter)

router.use("/api/travCom", travComRouter)
router.use("/api/reconcile", reconcileRouter)
//// END MORE LEGACY ROUTES

router.route("/api/current-user").get(CurrentUserController.show)

router.route("/api/expenses").get(ExpensesController.index).post(ExpensesController.create)
router
  .route("/api/expenses/:expenseId")
  .patch(ExpensesController.update)
  .delete(ExpensesController.destroy)
router
  .route("/api/expenses/:expenseId/upload")
  .get(Expenses.UploadController.show)
  .post(Expenses.UploadController.create)

router.route("/api/per-diems").get(PerDiemsController.index)
router
  .route("/api/per-diems/:perDiemId")
  .get(PerDiemsController.show)
  .patch(PerDiemsController.update)

router.route("/api/stops").get(StopsController.index)

router.route("/api/travel-allowances").get(TravelAllowancesController.index)
router
  .route("/api/travel-allowances/:travelAllowanceId")
  .get(TravelAllowancesController.show)
  .patch(TravelAllowancesController.update)

router
  .route("/api/travel-authorizations")
  .get(TravelAuthorizationsController.index)
  .post(TravelAuthorizationsController.create)
router
  .route("/api/travel-authorizations/:travelAuthorizationId")
  .get(TravelAuthorizationsController.show)
  .patch(TravelAuthorizationsController.update)
  .delete(TravelAuthorizationsController.destroy)

// Stateful routes for travel authorizations
router
  .route("/api/travel-authorizations/:travelAuthorizationId/submit")
  .post(TravelAuthorizations.SubmitController.create)
router
  .route("/api/travel-authorizations/:travelAuthorizationId/revert-to-draft")
  .post(TravelAuthorizations.RevertToDraftController.create)
router
  .route("/api/travel-authorizations/:travelAuthorizationId/approve")
  .post(TravelAuthorizations.ApproveController.create)
router
  .route("/api/travel-authorizations/:travelAuthorizationId/approve-expense-claim")
  .post(TravelAuthorizations.ApproveExpenseClaimController.create)
router
  .route("/api/travel-authorizations/:travelAuthorizationId/deny")
  .post(TravelAuthorizations.DenyController.create)
router
  .route("/api/travel-authorizations/:travelAuthorizationId/expense-claim")
  .post(TravelAuthorizations.ExpenseClaimController.create)

router
  .route("/api/travel-authorizations/:travelAuthorizationId/estimates/generate")
  .post(TravelAuthorizations.Estimates.GenerateController.create)
router
  .route("/api/travel-authorizations/:travelAuthorizationId/expenses/prefill")
  .post(TravelAuthorizations.Expenses.PrefillController.create)

router
  .route("/api/travel-desk-flight-options")
  .get(TravelDeskFlightOptionsController.index)
  .post(TravelDeskFlightOptionsController.create)
router
  .route("/api/travel-desk-flight-options/:travelDeskFlightOptionId")
  .get(TravelDeskFlightOptionsController.show)
  .patch(TravelDeskFlightOptionsController.update)
  .delete(TravelDeskFlightOptionsController.destroy)

router
  .route("/api/travel-desk-flight-options/:travelDeskFlightOptionId/re-order-flight-segments")
  .post(TravelDeskFlightOptions.ReOrderFlightSegmentsController.create)

router
  .route("/api/travel-desk-flight-requests")
  .get(TravelDeskFlightRequestsController.index)
  .post(TravelDeskFlightRequestsController.create)
router
  .route("/api/travel-desk-flight-requests/:travelDeskFlightRequestId")
  .get(TravelDeskFlightRequestsController.show)
  .patch(TravelDeskFlightRequestsController.update)
  .delete(TravelDeskFlightRequestsController.destroy)

router
  .route("/api/travel-desk-flight-segments")
  .get(TravelDeskFlightSegmentsController.index)
  .post(TravelDeskFlightSegmentsController.create)
router
  .route("/api/travel-desk-flight-segments/:travelDeskFlightSegmentId")
  .get(TravelDeskFlightSegmentsController.show)
  .patch(TravelDeskFlightSegmentsController.update)
  .delete(TravelDeskFlightSegmentsController.destroy)

router
  .route("/api/travel-desk-hotels")
  .get(TravelDeskHotelsController.index)
  .post(TravelDeskHotelsController.create)
router
  .route("/api/travel-desk-hotels/:travelDeskHotelId")
  .get(TravelDeskHotelsController.show)
  .patch(TravelDeskHotelsController.update)
  .delete(TravelDeskHotelsController.destroy)

router
  .route("/api/travel-desk-other-transportations")
  .get(TravelDeskOtherTransportationsController.index)
  .post(TravelDeskOtherTransportationsController.create)
router
  .route("/api/travel-desk-other-transportations/:travelDeskOtherTransportationId")
  .patch(TravelDeskOtherTransportationsController.update)
  .delete(TravelDeskOtherTransportationsController.destroy)

router
  .route("/api/travel-desk-questions")
  .get(TravelDeskQuestionsController.index)
  .post(TravelDeskQuestionsController.create)
router
  .route("/api/travel-desk-questions/:travelDeskQuestionId")
  .get(TravelDeskQuestionsController.show)
  .patch(TravelDeskQuestionsController.update)
  .delete(TravelDeskQuestionsController.destroy)

router
  .route("/api/travel-desk-rental-cars")
  .get(TravelDeskRentalCarsController.index)
  .post(TravelDeskRentalCarsController.create)
router
  .route("/api/travel-desk-rental-cars/:travelDeskRentalCarId")
  .patch(TravelDeskRentalCarsController.update)
  .delete(TravelDeskRentalCarsController.destroy)

router
  .route("/api/travel-desk-travel-agencies")
  .get(TravelDeskTravelAgenciesController.index)
  .post(TravelDeskTravelAgenciesController.create)
router
  .route("/api/travel-desk-travel-agencies/:travelDeskTravelAgencyId")
  .get(TravelDeskTravelAgenciesController.show)
  .patch(TravelDeskTravelAgenciesController.update)
  .delete(TravelDeskTravelAgenciesController.destroy)

router.route("/api/travel-desk-travel-requests").get(TravelDeskTravelRequestsController.index)
router
  .route("/api/travel-desk-travel-requests/:travelDeskTravelRequestId")
  .get(TravelDeskTravelRequestsController.show)
  .patch(TravelDeskTravelRequestsController.update)
router
  .route("/api/travel-desk-travel-requests/:travelDeskTravelRequestId/submit")
  .post(TravelDeskTravelRequests.SubmitController.create)
router
  .route("/api/travel-desk-travel-requests/:travelDeskTravelRequestId/book")
  .post(TravelDeskTravelRequests.BookController.create)
router
  .route("/api/travel-desk-travel-requests/:travelDeskTravelRequestId/options-provided")
  .post(TravelDeskTravelRequests.OptionsProvidedController.create)
router
  .route("/api/travel-desk-travel-requests/:travelDeskTravelRequestId/options-ranked")
  .post(TravelDeskTravelRequests.OptionsRankedController.create)

router.route("/api/locations").get(LocationsController.index)
router.route("/api/locations/:locationId").get(LocationsController.show)

router
  .route("/api/travel-authorization-pre-approval-profiles")
  .get(TravelAuthorizationPreApprovalProfilesController.index)
router
  .route("/api/travel-authorization-pre-approval-profiles/:id")
  .get(TravelAuthorizationPreApprovalProfilesController.show)

router
  .route("/api/travel-authorization-pre-approvals")
  .get(TravelAuthorizationPreApprovalsController.index)

router.route("/api/users").get(UsersController.index).post(UsersController.create)
router.route("/api/users/:userId").get(UsersController.show)
router
  .route("/api/users/:userId/yg-government-directory-sync")
  .post(Users.YgGovernmentDirectorySyncController.create)
router.route("/api/travel-purposes").get(TravelPurposesController.index)

router
  .route("/api/general-ledger-codings")
  .get(GeneralLedgerCodingsController.index)
  .post(GeneralLedgerCodingsController.create)
router
  .route("/api/general-ledger-codings/:generalLedgerCodingId")
  .get(GeneralLedgerCodingsController.show)
  .patch(GeneralLedgerCodingsController.update)
  .delete(GeneralLedgerCodingsController.destroy)

router
  .route("/api/travel-authorization-action-logs")
  .get(TravelAuthorizationActionLogsController.index)

router
  .route("/api/trav-com/ar-invoices")
  .get(TravComIntegration.Controllers.ArInvoicesController.index)
router
  .route("/api/trav-com/ar-invoices/:arInvoiceId")
  .get(TravComIntegration.Controllers.ArInvoicesController.show)

// QA testing scenarios
router.route("/api/qa/scenarios").get(Qa.ScenariosController.index)
router
  .route(`/api/qa/scenarios/${Qa.ScenarioTypes.MY_TRAVEL_REQUESTS}`)
  .post(Qa.Scenarios.MyTravelRequestsController.create)
router
  .route(`/api/qa/scenarios/${Qa.ScenarioTypes.BECOME_ADMIN_ROLE}`)
  .post(Qa.Scenarios.BecomeAdminRoleController.create)
router
  .route(`/api/qa/scenarios/${Qa.ScenarioTypes.BECOME_USER_ROLE}`)
  .post(Qa.Scenarios.BecomeUserRoleController.create)

router.use("/api/health-check", healthCheckRouter)

// if no other routes match, return a 404
router.use("/api", (_req: Request, res: Response) => {
  return res.status(404).json({ message: "Not Found" })
})

// Special error handler for all api errors
// See https://expressjs.com/en/guide/error-handling.html#writing-error-handlers
router.use("/api", (err: ErrorRequestHandler, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err)
  }

  if (err instanceof DatabaseError) {
    logger.error(err)
    return res.status(422).json({ message: "Invalid query against database." })
  }

  logger.error(err)
  return res.status(500).json({ message: "Internal Server Error" })
})

export default router
