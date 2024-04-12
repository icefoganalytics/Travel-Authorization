import express, { Request, Response } from "express"
import { ModelStatic, Op } from "sequelize"
import { isNil } from "lodash"

import { RequiresAuth, RequiresRolePatAdminOrAdmin } from "@/middleware"
import db, {
  TravelAuthorizationPreApproval,
  TravelAuthorizationPreApprovalDocument,
  TravelAuthorizationPreApprovalSubmission,
  TravelAuthorizationPreApprovalTraveler,
  User,
} from "@/models"

export const preapprovedRouter = express.Router()

preapprovedRouter.get("/submissions", RequiresAuth, async function (req: Request, res: Response) {
  const applyScope = (scope: ModelStatic<TravelAuthorizationPreApprovalSubmission>, user: User) => {
    if (req?.user?.roles?.indexOf(User.Roles.ADMIN) >= 0) {
      return scope
    }

    return scope.scope({
      where: {
        department: req.user.department,
      },
    })
  }

  const scopedSubmissions = applyScope(TravelAuthorizationPreApprovalSubmission, req.user)
  const submissionList = await scopedSubmissions.findAll({
    include: [
      {
        association: "preApproval",
        include: ["travelers"],
      },
    ],
  })

  res.status(200).json(submissionList)
})

preapprovedRouter.get(
  "/submissions/:submissionId",
  RequiresAuth,
  RequiresRolePatAdminOrAdmin,
  async function (req: Request, res: Response) {
    const submissionId = req.params.submissionId
    try {
      const submission = await TravelAuthorizationPreApprovalSubmission.findByPk(submissionId)
      res.status(200).json(submission)
    } catch (error: any) {
      console.log(error)
      res.status(500).json("Record Not Found")
    }
  }
)

preapprovedRouter.post(
  "/submissions/:submissionId",
  RequiresAuth,
  RequiresRolePatAdminOrAdmin,
  async function (req: Request, res: Response) {
    try {
      await db.transaction(async () => {
        const submissionId = Number(req.params.submissionId)
        const preApprovalIds = req.body.preApprovalIds
        delete req.body.preApprovalIds

        const newSubmission = req.body

        if (newSubmission.department && newSubmission.status && preApprovalIds.length > 0) {
          var id = []
          newSubmission.submitter = req.user.displayName

          let submission = await TravelAuthorizationPreApprovalSubmission.findByPk(submissionId)
          if (submission !== null) {
            submission.update(newSubmission)
          } else {
            submission = await TravelAuthorizationPreApprovalSubmission.create(newSubmission)
          }

          await TravelAuthorizationPreApproval.update(
            {
              status: submission.status,
              submissionId: submission.preTSubID,
            },
            {
              where: {
                id: preApprovalIds,
              },
            }
          )
          await TravelAuthorizationPreApproval.update(
            {
              status: null,
              submissionId: null,
            },
            {
              where: {
                submissionId: submission.preTSubID,
                [Op.not]: [{ id: preApprovalIds }],
              },
            }
          )

          res.status(200).json("Successful")
        } else {
          res.status(500).json("Required fields in submission are blank")
        }
      })
    } catch (error: any) {
      console.log(error)
      res.status(500).json("Insert failed")
    }
  }
)

preapprovedRouter.delete(
  "/submissions/:submissionId",
  RequiresAuth,
  RequiresRolePatAdminOrAdmin,
  async function (req: Request, res: Response) {
    try {
      const submissionId = Number(req.params.submissionId)
      const submission = await TravelAuthorizationPreApprovalSubmission.findByPk(submissionId)
      if (isNil(submission)) {
        return res.status(404).json("Submission not found")
      }

      await db.transaction(async () => {
        if (submission.status == "Finished" || submission.approvalDate || submission.approvedBy) {
          res.status(403).json("Cannot delete final records")
        } else {
          await TravelAuthorizationPreApproval.update(
            {
              status: null,
              submissionId: null,
            },
            {
              where: {
                submissionId: submission.preTSubID,
              },
            }
          )
          await submission.destroy()

          res.status(200).json("Delete Successful")
        }
      })
    } catch (error: any) {
      console.log(error)
      res.status(500).json("Delete failed")
    }
  }
)

preapprovedRouter.post(
  "/approval/:submissionId",
  RequiresAuth,
  RequiresRolePatAdminOrAdmin,
  async function (req: Request, res: Response) {
    const file = req.body.file
    const preTSubID = Number(req.params.submissionId)
    const data = JSON.parse(req.body.data)

    try {
      const approvalDoc = await TravelAuthorizationPreApprovalDocument.findOne({
        where: {
          preTSubID,
        },
      })
      if (approvalDoc) {
        return res.status(409).json("File Already Exist!")
      }

      if (
        preTSubID &&
        data.status &&
        data.approvalDate &&
        data.approvedBy &&
        data.preapproved.length > 0
      ) {
        const newDocument = {
          preTSubID,
          approvalDoc: file,
        }
        await db.transaction(async () => {
          await TravelAuthorizationPreApprovalDocument.create(newDocument)
          await TravelAuthorizationPreApprovalSubmission.update(
            {
              status: data.status,
              approvalDate: data.approvalDate,
              approvedBy: data.approvedBy,
            },
            {
              where: {
                preTSubID,
              },
            }
          )

          for (const preApproval of data.preapproved) {
            await TravelAuthorizationPreApproval.update(
              {
                status: preApproval.status,
              },
              {
                where: {
                  id: preApproval.id,
                },
              }
            )
          }

          res.status(200).json("Successful")
        })
      } else {
        res.status(422).json("Required fields in submission are blank")
      }
    } catch (error: any) {
      console.log(error)
      res.status(500).json("Insert failed")
    }
  }
)

preapprovedRouter.get("/document/:submissionId", RequiresAuth, async function (req, res) {
  try {
    const preTSubID = req.params.submissionId
    const document = await TravelAuthorizationPreApprovalDocument.findOne({
      where: {
        preTSubID,
      },
    })
    if (isNil(document)) {
      return res.status(404).json("Document not found")
    }

    res.status(200).send(document.approvalDoc)
  } catch (error: any) {
    console.log(error)
    res.status(500).json("PDF not Found")
  }
})

preapprovedRouter.get("/", RequiresAuth, async function (req: Request, res: Response) {
  const applyScope = (scope: ModelStatic<TravelAuthorizationPreApproval>, user: User) => {
    if (user.roles?.indexOf(User.Roles.ADMIN) >= 0) {
      return scope
    }

    return scope.scope({
      where: {
        department: user.department,
      },
    })
  }

  const scopedPreApprovals = applyScope(TravelAuthorizationPreApproval, req.user)
  const preApprovals = await scopedPreApprovals.findAll({
    include: ["travelers"],
  })

  res.status(200).json(preApprovals)
})

preapprovedRouter.post(
  "/:preApprovalId",
  RequiresAuth,
  async function (req: Request, res: Response) {
    const preApprovalId = Number(req.params.preApprovalId)
    try {
      await db.transaction(async () => {
        const travelers = req.body.travelers
        delete req.body.travelers

        const newPreapproved = req.body

        if (
          newPreapproved.department &&
          newPreapproved.purpose &&
          newPreapproved.isOpenForAnyDate >= 0 &&
          newPreapproved.estimatedCost &&
          newPreapproved.location &&
          newPreapproved.isOpenForAnyTraveler >= 0 &&
          travelers?.length > 0
        ) {
          let preApproval = await TravelAuthorizationPreApproval.findByPk(preApprovalId)
          if (isNil(preApproval)) {
            preApproval = await TravelAuthorizationPreApproval.create(newPreapproved)
          }

          const travelersQuery = await TravelAuthorizationPreApprovalTraveler.findAll({
            attributes: ["travelerID"],
            where: {
              preApprovalId: preApproval.id,
            },
          })

          let travelerIdList = travelersQuery.map((traveler) => traveler.travelerID)

          for (const traveller of travelers) {
            if (traveller.travelerID) {
              travelerIdList = travelerIdList.filter((tid) => tid != traveller.travelerID)
            } else {
              let travellerInfo = {
                preApprovalId: preApproval.id,
                ...traveller,
              }
              await TravelAuthorizationPreApprovalTraveler.create(travellerInfo)
            }
          }

          await TravelAuthorizationPreApprovalTraveler.destroy({
            where: {
              travelerID: travelerIdList,
            },
          })

          res.status(200).json([preApproval])
        } else {
          res.status(500).json("Required fields in submission are blank")
        }
      })
    } catch (error: any) {
      console.log(error)
      res.status(500).json("Insert failed")
    }
  }
)

preapprovedRouter.delete(
  "/:preApprovalId",
  RequiresAuth,
  RequiresRolePatAdminOrAdmin,
  async function (req: Request, res: Response) {
    try {
      const preApprovalId = req.params.preApprovalId
      const preApproval = await TravelAuthorizationPreApproval.findByPk(preApprovalId)
      if (isNil(preApproval)) {
        return res.status(404).json("Pre-approval not found")
      }

      if (preApproval.status == "Approved" || preApproval.status == "Declined") {
        res.status(403).json("Cannot delete final records")
      } else {
        await preApproval.destroy()
        res.status(200).json("Delete Successful")
      }
    } catch (error: any) {
      console.log(error)
      res.status(500).json("Delete failed")
    }
  }
)
