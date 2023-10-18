import { isNull, minBy } from "lodash"
import express, { Request, Response } from "express"
import { WhereOptions } from "sequelize"

import {
  RequiresAuth,
  RequiresRoleAdmin,
  RequiresRoleTdUser,
  RequiresRoleTdUserOrAdmin,
} from "@/middleware"
import { UserService } from "@/services"
import { TravelAuthorization, TravelDeskPassengerNameRecordDocument } from "@/models"

import dbLegacy from "@/db/db-client-legacy"

export const travelDeskRouter = express.Router()
const userService = new UserService()

travelDeskRouter.get("/", RequiresAuth, async function (req: Request, res: Response) {
  const travelRequests = await dbLegacy("travelDeskTravelRequest").select("*").whereNot({
    status: "draft",
  })

  for (const travelRequest of travelRequests) {
    const requestID = travelRequest.requestID
    const TAID = travelRequest.TAID

    const form = await TravelAuthorization.findOne({
      where: { id: TAID },
      include: ["stops"],
    })
    travelRequest.form = form

    const flightRequests = await dbLegacy("travelDeskFlightRequest")
      .select("*")
      .where("requestID", requestID)
    travelRequest.flightRequests = flightRequests

    const rentalCars = await dbLegacy("travelDeskRentalCar")
      .select("*")
      .where("requestID", requestID)
    travelRequest.rentalCars = rentalCars

    const hotels = await dbLegacy("travelDeskHotel").select("*").where("requestID", requestID)
    travelRequest.hotels = hotels

    const otherTransportations = await dbLegacy("travelDeskOtherTransportation")
      .select("*")
      .where("requestID", requestID)
    travelRequest.otherTransportation = otherTransportations

    const questions = await dbLegacy("travelDeskQuestion").select("*").where("requestID", requestID)
    for (const question of questions) {
      question.state = { questionErr: false, responseErr: false }
    }
    travelRequest.questions = questions

    const travelDeskPnrDocument = await TravelDeskPassengerNameRecordDocument.findOne({
      attributes: ["invoiceNumber"],
      where: { travelDeskTravelRequestId: requestID },
    })
    travelRequest.invoiceNumber = travelDeskPnrDocument?.invoiceNumber || ""
  }

  res.status(200).json(travelRequests)
})

travelDeskRouter.get(
  "/authorized-travels/",
  RequiresAuth,
  async function (req: Request, res: Response) {
    const adminScoping: WhereOptions<TravelAuthorization> = {}
    if (req?.user?.roles?.includes("Admin")) {
      // No additional conditions for Admin, selects all records
    } else if (req?.user?.roles?.includes("DeptAdmin")) {
      adminScoping.department = req.user.department
    } else {
      adminScoping.userId = req.user.id
    }

    try {
      const forms = await TravelAuthorization.findAll({
        where: adminScoping,
        include: ["stops"],
      })

      for (const form of forms) {
        const stops = form.stops
        const earliestStop = minBy(stops, (stop) => {
          return `${stop.departureDate} ${stop.departureTime}`
        })
        // @ts-ignore - this code is deprecated so not worth fixing the type issues
        form.departureDate = earliestStop?.departureDate || "Unknown"
        // @ts-ignore - this code is deprecated so not worth fixing the type issues
        form.departureTime = earliestStop?.departureTime || "Unknown"

        // @ts-ignore - isn't worth fixing at this time
        form.travelRequest = await dbLegacy("travelDeskTravelRequest")
          .select("*")
          .where("TAID", form.id)
          .first()

        // @ts-ignore - isn't worth fixing at this time
        const requestID = form.travelRequest?.requestID
        if (requestID) {
          const travelDeskPnrDocument = await TravelDeskPassengerNameRecordDocument.findOne({
            attributes: ["invoiceNumber"],
            where: { travelDeskTravelRequestId: requestID },
          })

          // @ts-ignore - isn't worth fixing at this time
          form.travelRequest.invoiceNumber = travelDeskPnrDocument?.invoiceNumber || ""
        }
      }
      res.status(200).json(forms)
    } catch (error: any) {
      console.log(error)
      res.status(500).json("Internal Server Error")
    }
  }
)

travelDeskRouter.get(
  "/flight-options/:flightRequestId",
  RequiresAuth,
  async function (req: Request, res: Response) {
    const flightSegmentState = {
      flightErr: false,
      departDateErr: false,
      departTimeErr: false,
      departLocationErr: false,
      arriveDateErr: false,
      arriveTimeErr: false,
      arriveLocationErr: false,
      durationErr: false,
      classErr: false,
      statusErr: false,
    }

    const flightRequestID = Number(req.params.flightRequestId)
    let tmpId = 2000

    const flightOptions = await dbLegacy("travelDeskFlightOption")
      .select("*")
      .where("flightRequestID", flightRequestID)
    for (const flightOption of flightOptions) {
      const flightSegments = await dbLegacy("travelDeskFlightSegment")
        .select("*")
        .where("flightOptionID", flightOption.flightOptionID)
      for (const flightSegment of flightSegments) {
        flightSegment.state = flightSegmentState
        flightSegment.tmpId = tmpId
        flightSegment.departDay = flightSegment.departDate.substring(0, 10)
        flightSegment.departTime = flightSegment.departDate.substring(11, 16)
        flightSegment.arriveDay = flightSegment.arriveDate.substring(0, 10)
        flightSegment.arriveTime = flightSegment.arriveDate.substring(11, 16)
        tmpId++
      }
      flightOption.flightSegments = flightSegments
      flightOption.state = { costErr: false, legErr: false }
    }

    res.status(200).json(flightOptions)
  }
)

travelDeskRouter.post(
  "/flight-options/:requestID",
  RequiresAuth,
  async function (req: Request, res: Response) {
    try {
      await dbLegacy.transaction(async (trx) => {
        const requestID = Number(req.params.requestID)
        const newFlightOptions = req.body
        //console.log(newFlightOptions)
        if (newFlightOptions.length < 1 || !requestID)
          return res.status(500).json("Empty Payload for Flight Options")

        const flightRequestQuery = await await dbLegacy("travelDeskFlightRequest")
          .select("flightRequestID")
          .where("requestID", requestID)
        const flightRequestIDs = flightRequestQuery.map((req) => req.flightRequestID)
        // console.log(flightRequestIDs)
        await dbLegacy("travelDeskFlightOption")
          .delete()
          .whereIn("flightRequestID", flightRequestIDs)

        for (const newFlightOption of newFlightOptions) {
          delete newFlightOption.state

          const flightSegments = newFlightOption.flightSegments
          delete newFlightOption.flightSegments

          const id = await dbLegacy("travelDeskFlightOption").insert(
            newFlightOption,
            "flightOptionID"
          )

          for (const flightSegment of flightSegments) {
            // console.log(flightSegment)
            delete flightSegment.tmpId
            delete flightSegment.state
            delete flightSegment.departDay
            delete flightSegment.departTime
            delete flightSegment.arriveDay
            delete flightSegment.arriveTime
            flightSegment.flightOptionID = id[0].flightOptionID
            await dbLegacy("travelDeskFlightSegment").insert(flightSegment)
          }
        }
        res.status(200).json("Successful")
      })
    } catch (error: any) {
      console.log(error)
      res.status(500).json("Saving the Flight Options failed")
    }
  }
)

travelDeskRouter.delete(
  "/flight-options/:requestID",
  RequiresAuth,
  RequiresRoleTdUser,
  async function (req: Request, res: Response) {
    try {
      const requestID = Number(req.params.requestID)
      // console.log(flightRequestIDs)
      await dbLegacy.transaction(async (trx) => {
        const flightRequestQuery = await await dbLegacy("travelDeskFlightRequest")
          .select("flightRequestID")
          .where("requestID", requestID)
        const flightRequestIDs = flightRequestQuery.map((req) => req.flightRequestID)

        await dbLegacy("travelDeskFlightOption")
          .delete()
          .whereIn("flightRequestID", flightRequestIDs)
          .transacting(trx)
        res.status(200).json("Delete Successful")
      })
    } catch (error: any) {
      console.log(error)
      res.status(500).json("Delete failed")
    }
  }
)

travelDeskRouter.get(
  "/flight-request/:requestID",
  RequiresAuth,
  async function (req: Request, res: Response) {
    const flightSegmentState = {
      flightErr: false,
      departDateErr: false,
      departTimeErr: false,
      departLocationErr: false,
      arriveDateErr: false,
      arriveTimeErr: false,
      arriveLocationErr: false,
      durationErr: false,
      classErr: false,
      statusErr: false,
    }

    const requestID = Number(req.params.requestID)

    if (requestID) {
      let tmpId = 3000

      const flightRequests = await dbLegacy("travelDeskFlightRequest")
        .select("*")
        .where("requestID", requestID)
      for (const flightRequest of flightRequests) {
        const flightOptions = await dbLegacy("travelDeskFlightOption")
          .select("*")
          .where("flightRequestID", flightRequest.flightRequestID)
        for (const flightOption of flightOptions) {
          const flightSegments = await dbLegacy("travelDeskFlightSegment")
            .select("*")
            .where("flightOptionID", flightOption.flightOptionID)
          for (const flightSegment of flightSegments) {
            flightSegment.state = flightSegmentState
            flightSegment.tmpId = tmpId
            flightSegment.departDay = flightSegment.departDate.substring(0, 10)
            flightSegment.departTime = flightSegment.departDate.substring(11, 16)
            flightSegment.arriveDay = flightSegment.arriveDate.substring(0, 10)
            flightSegment.arriveTime = flightSegment.arriveDate.substring(11, 16)
            tmpId++
          }
          flightOption.flightSegments = flightSegments
          flightOption.state = { costErr: false, legErr: false }
        }
        flightRequest.flightOptions = flightOptions
      }
      res.status(200).json(flightRequests)
    } else res.status(500).json("Missing all parameters!")
  }
)

travelDeskRouter.post(
  "/flight-request/:requestID",
  RequiresAuth,
  async function (req: Request, res: Response) {
    try {
      await dbLegacy.transaction(async (trx) => {
        const requestID = Number(req.params.requestID)
        const flightRequests = req.body
        // console.log(flightRequests)

        if (requestID) {
          await dbLegacy("travelDeskFlightRequest").delete().where("requestID", requestID)

          for (const flightRequest of flightRequests) {
            const newFlightOptions = flightRequest.flightOptions
            delete flightRequest.flightOptions
            delete flightRequest.tmpId
            if (flightRequest.flightRequestID == null) delete flightRequest.flightRequestID

            flightRequest.requestID = requestID

            const flightId = await dbLegacy("travelDeskFlightRequest").insert(
              flightRequest,
              "flightRequestID"
            )
            const flightRequestID = flightId[0].flightRequestID

            await dbLegacy("travelDeskFlightOption")
              .delete()
              .where("flightRequestID", flightRequestID)

            for (const newFlightOption of newFlightOptions) {
              delete newFlightOption.state

              const flightSegments = newFlightOption.flightSegments
              delete newFlightOption.flightSegments

              newFlightOption.flightRequestID = flightRequestID

              const id = await dbLegacy("travelDeskFlightOption").insert(
                newFlightOption,
                "flightOptionID"
              )

              for (const flightSegment of flightSegments) {
                // console.log(flightSegment)
                delete flightSegment.tmpId
                delete flightSegment.state
                delete flightSegment.departDay
                delete flightSegment.departTime
                delete flightSegment.arriveDay
                delete flightSegment.arriveTime
                flightSegment.flightOptionID = id[0].flightOptionID
                await dbLegacy("travelDeskFlightSegment").insert(flightSegment)
              }
            }
          }
          res.status(200).json("Successful")
        } else {
          res.status(500).json("Required fields in submission are blank")
        }
      })
    } catch (error: any) {
      console.log(error)
      res.status(500).json("Saving the Flight Request failed")
    }
  }
)

travelDeskRouter.get(
  "/travel-request/:taid",
  RequiresAuth,
  async function (req: Request, res: Response) {
    const flightSegmentState = {
      flightErr: false,
      departDateErr: false,
      departTimeErr: false,
      departLocationErr: false,
      arriveDateErr: false,
      arriveTimeErr: false,
      arriveLocationErr: false,
      durationErr: false,
      classErr: false,
      statusErr: false,
    }

    const travelRequest = await dbLegacy("travelDeskTravelRequest")
      .select("*")
      .where({
        TAID: req.params.taid,
      })
      .first()

    if (travelRequest) {
      const requestID = travelRequest.requestID

      let tmpId = 1000

      const flightRequests = await dbLegacy("travelDeskFlightRequest")
        .select("*")
        .where("requestID", requestID)
      for (const flightRequest of flightRequests) {
        const flightOptions = await dbLegacy("travelDeskFlightOption")
          .select("*")
          .where("flightRequestID", flightRequest.flightRequestID)
        for (const flightOption of flightOptions) {
          const flightSegments = await dbLegacy("travelDeskFlightSegment")
            .select("*")
            .where("flightOptionID", flightOption.flightOptionID)
          for (const flightSegment of flightSegments) {
            flightSegment.state = flightSegmentState
            flightSegment.tmpId = tmpId
            flightSegment.departDay = flightSegment.departDate.substring(0, 10)
            flightSegment.departTime = flightSegment.departDate.substring(11, 16)
            flightSegment.arriveDay = flightSegment.arriveDate.substring(0, 10)
            flightSegment.arriveTime = flightSegment.arriveDate.substring(11, 16)
            tmpId++
          }
          flightOption.flightSegments = flightSegments
          flightOption.state = { costErr: false, legErr: false }
        }
        flightRequest.flightOptions = flightOptions
      }
      travelRequest.flightRequests = flightRequests

      const rentalCars = await dbLegacy("travelDeskRentalCar")
        .select("*")
        .where("requestID", requestID)
      travelRequest.rentalCars = rentalCars

      const hotels = await dbLegacy("travelDeskHotel").select("*").where("requestID", requestID)
      travelRequest.hotels = hotels

      const otherTransportation = await dbLegacy("travelDeskOtherTransportation")
        .select("*")
        .where("requestID", requestID)
      travelRequest.otherTransportation = otherTransportation

      const questions = await dbLegacy("travelDeskQuestion")
        .select("*")
        .where("requestID", requestID)
      for (const question of questions) {
        question.state = { questionErr: false, responseErr: false }
      }
      travelRequest.questions = questions

      const travelDeskPnrDocument = await TravelDeskPassengerNameRecordDocument.findOne({
        attributes: ["invoiceNumber"],
        where: { travelDeskTravelRequestId: requestID },
      })
      travelRequest.invoiceNumber = travelDeskPnrDocument?.invoiceNumber || ""
    }

    res.status(200).json(travelRequest)
  }
)

travelDeskRouter.post(
  "/travel-request/:taid",
  RequiresAuth,
  async function (req: Request, res: Response) {
    try {
      await dbLegacy.transaction(async (trx) => {
        const TAID = Number(req.params.taid)
        const newTravelRequest = req.body
        // console.log(newTravelRequest)

        if (TAID) {
          delete newTravelRequest.invoiceNumber

          const flightRequests = newTravelRequest.flightRequests
          delete newTravelRequest.flightRequests

          const rentalCars = newTravelRequest.rentalCars
          delete newTravelRequest.rentalCars

          const hotels = newTravelRequest.hotels
          delete newTravelRequest.hotels

          const otherTransportations = newTravelRequest.otherTransportation
          delete newTravelRequest.otherTransportation

          const questions = newTravelRequest.questions
          delete newTravelRequest.questions

          let id = null
          const travelRequestQuery = await dbLegacy("travelDeskTravelRequest")
            .select("*")
            .where("TAID", TAID)

          if (travelRequestQuery.length == 1) {
            id = await dbLegacy("travelDeskTravelRequest")
              .update(newTravelRequest, "requestID")
              .where("TAID", TAID)
          } else if (travelRequestQuery.length == 0) {
            id = await dbLegacy("travelDeskTravelRequest").insert(newTravelRequest, "requestID")
          } else {
            return res.status(500).json("Multiple Travel Request Records!")
          }

          //FlightRequests
          await dbLegacy("travelDeskFlightRequest").delete().where("requestID", id[0].requestID)

          for (const flightRequest of flightRequests) {
            const newFlightOptions = flightRequest.flightOptions
            delete flightRequest.flightOptions
            delete flightRequest.tmpId
            if (flightRequest.flightRequestID == null) delete flightRequest.flightRequestID

            flightRequest.requestID = id[0].requestID

            const flightId = await dbLegacy("travelDeskFlightRequest").insert(
              flightRequest,
              "flightRequestID"
            )
            const flightRequestID = flightId[0].flightRequestID

            await dbLegacy("travelDeskFlightOption")
              .delete()
              .where("flightRequestID", flightRequestID)

            for (const newFlightOption of newFlightOptions) {
              delete newFlightOption.state

              const flightSegments = newFlightOption.flightSegments
              delete newFlightOption.flightSegments

              newFlightOption.flightRequestID = flightRequestID

              const id = await dbLegacy("travelDeskFlightOption").insert(
                newFlightOption,
                "flightOptionID"
              )

              for (const flightSegment of flightSegments) {
                // console.log(flightSegment)
                delete flightSegment.tmpId
                delete flightSegment.state
                delete flightSegment.departDay
                delete flightSegment.departTime
                delete flightSegment.arriveDay
                delete flightSegment.arriveTime
                flightSegment.flightOptionID = id[0].flightOptionID
                await dbLegacy("travelDeskFlightSegment").insert(flightSegment)
              }
            }
          }

          //RentalCars
          await dbLegacy("travelDeskRentalCar").delete().where("requestID", id[0].requestID)

          for (const rentalCar of rentalCars) {
            delete rentalCar.tmpId
            if (rentalCar.rentalVehicleID == null) delete rentalCar.rentalVehicleID
            rentalCar.requestID = id[0].requestID
            await dbLegacy("travelDeskRentalCar").insert(rentalCar)
          }

          //Hotels
          await dbLegacy("travelDeskHotel").delete().where("requestID", id[0].requestID)

          for (const hotel of hotels) {
            delete hotel.tmpId
            if (hotel.hotelID == null) delete hotel.hotelID
            hotel.requestID = id[0].requestID
            await dbLegacy("travelDeskHotel").insert(hotel)
          }

          //Other Transportations
          await dbLegacy("travelDeskOtherTransportation")
            .delete()
            .where("requestID", id[0].requestID)

          for (const otherTransportation of otherTransportations) {
            delete otherTransportation.tmpId
            if (otherTransportation.transportationID == null)
              delete otherTransportation.transportationID
            otherTransportation.requestID = id[0].requestID
            await dbLegacy("travelDeskOtherTransportation").insert(otherTransportation)
          }

          //Questions
          await dbLegacy("travelDeskQuestion").delete().where("requestID", id[0].requestID)

          for (const question of questions) {
            delete question.tmpId
            delete question.state
            if (question.questionID == null) delete question.questionID
            question.requestID = id[0].requestID
            await dbLegacy("travelDeskQuestion").insert(question)
          }

          res.status(200).json("Successful")
        } else {
          res.status(500).json("Required fields in submission are blank")
        }
      })
    } catch (error: any) {
      console.log(error)
      res.status(500).json("Saving the Travel Request failed")
    }
  }
)

travelDeskRouter.get(
  "/travel-agents/",
  RequiresAuth,
  RequiresRoleTdUserOrAdmin,
  async function (req: Request, res: Response) {
    const travelAgents = await dbLegacy("travelDeskTravelAgent").select("*")
    res.status(200).json(travelAgents)
  }
)

travelDeskRouter.delete(
  "/travel-agents/:agencyID",
  RequiresAuth,
  RequiresRoleAdmin,
  async function (req: Request, res: Response) {
    try {
      const agencyID = Number(req.params.agencyID)

      await dbLegacy.transaction(async (trx) => {
        await dbLegacy("travelDeskTravelAgent")
          .delete()
          .where("agencyID", agencyID)
          .transacting(trx)
        res.status(200).json("Delete Successful")
      })
    } catch (error: any) {
      console.log(error)
      res.status(500).json("Delete failed")
    }
  }
)

travelDeskRouter.post(
  "/travel-agents/:agencyID",
  RequiresAuth,
  RequiresRoleAdmin,
  async function (req: Request, res: Response) {
    try {
      await dbLegacy.transaction(async (trx) => {
        const agencyID = Number(req.params.agencyID)
        const agencyData = req.body
        //console.log(agencyData)
        if (!agencyData.agencyName || !agencyData.agencyInfo)
          return res.status(500).json("Empty Payload for Agency")

        if (agencyID > 0) {
          await dbLegacy("travelDeskTravelAgent")
            .update({ agencyInfo: agencyData.agencyInfo })
            .where("agencyID", agencyID)
        } else {
          await dbLegacy("travelDeskTravelAgent").insert(agencyData)
        }

        res.status(200).json("Successful")
      })
    } catch (error: any) {
      console.log(error)
      res.status(500).json("Saving the Agency Information failed")
    }
  }
)

travelDeskRouter.post(
  "/pnr-document/:requestID",
  RequiresAuth,
  RequiresRoleTdUser,
  async function (req: Request, res: Response) {
    const file = req.body.file
    const requestID = parseInt(req.params.requestID)
    const data = JSON.parse(req.body.data)

    try {
      await dbLegacy.transaction(async (trx) => {
        // TODO: re-add to transaction once travelDeskTravelRequest is in Sequelize
        await TravelDeskPassengerNameRecordDocument.upsert({
          travelDeskTravelRequestId: requestID,
          invoiceNumber: data.invoiceNumber,
          pnrDocument: file,
        })

        if (data.agencyID) {
          await dbLegacy("travelDeskTravelRequest")
            .update({
              agencyID: data.agencyID,
            })
            .where("requestID", requestID)
        }

        res.status(200).json("Successful")
      })
    } catch (error: any) {
      console.log(error)
      res.status(500).json("Insert failed")
    }
  }
)

travelDeskRouter.get(
  "/pnr-document/:requestID",
  RequiresAuth,
  RequiresRoleTdUser,
  async function (req, res) {
    try {
      const requestID = req.params.requestID
      const doc = await TravelDeskPassengerNameRecordDocument.findOne({
        where: { travelDeskTravelRequestId: requestID },
      })

      if (isNull(doc)) {
        return res.status(404).json({ message: "No PNR Document found" })
      }

      res.status(200).send(doc.pnrDocument)
    } catch (error: any) {
      console.log(error)
      res.status(500).json("PDF not Found")
    }
  }
)
