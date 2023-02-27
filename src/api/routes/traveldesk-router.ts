import express, { Request, Response } from "express";
import { RequiresAuth, RequiresRolePatAdminOrAdmin, RequiresRoleTdUser } from "../middleware";
import { DB_CONFIG } from "../config";
import knex from "knex";
import { UserService } from "../services";

const db = knex(DB_CONFIG);

export const travelDeskRouter = express.Router();
const userService = new UserService();

travelDeskRouter.get("/", RequiresAuth, async function (req: Request, res: Response) {
  
  const travelRequests = await db("travelDeskTravelRequest").select("*").whereNot({
    status: 'draft'
  });

  for(const travelRequest of travelRequests){
    const requestID = travelRequest.requestID
    const TAID = travelRequest.TAID

    const form = await db("forms").select("*").where("id", TAID).first();
    form.stops = await db("stops").select("*").where("taid", TAID);
    travelRequest.form=form

    const flightRequests = await db("travelDeskFlightRequest").select("*").where("requestID", requestID);
    travelRequest.flightRequests=flightRequests

    const rentalCars = await db("travelDeskRentalCar").select("*").where("requestID", requestID);
    travelRequest.rentalCars=rentalCars

    const hotels = await db("travelDeskHotel").select("*").where("requestID", requestID);
    travelRequest.hotels=hotels

    const otherTransportations = await db("travelDeskOtherTransportation").select("*").where("requestID", requestID);
    travelRequest.otherTransportation=otherTransportations

  }

  res.status(200).json(travelRequests);
});


travelDeskRouter.get("/flight-options/:flightRequestId", RequiresAuth, async function (req: Request, res: Response) {
  
  const flightSegmentState={
    flightErr:false,
    departDateErr:false,
    departTimeErr:false,
    departLocationErr:false,
    arriveDateErr:false,
    arriveTimeErr:false,
    arriveLocationErr:false,
    durationErr:false,
    classErr:false,
    statusErr:false,
  };

  const flightRequestID = Number(req.params.flightRequestId);
  let tmpId=2000;

  const flightOptions = await db("travelDeskFlightOption").select("*").where("flightRequestID", flightRequestID);
  for(const flightOption of flightOptions){
    const flightSegments = await db("travelDeskFlightSegment").select("*").where("flightOptionID",flightOption.flightOptionID)
    for(const flightSegment of flightSegments){
      flightSegment.state = flightSegmentState;
      flightSegment.tmpId = tmpId;          
      flightSegment.departDay=flightSegment.departDate.substring(0,10);
      flightSegment.departTime=flightSegment.departDate.substring(11,16);
      flightSegment.arriveDay=flightSegment.arriveDate.substring(0,10);
      flightSegment.arriveTime=flightSegment.arriveDate.substring(11,16);
      tmpId++;
    }
    flightOption.flightSegments=flightSegments;
    flightOption.state={costErr:false};
  } 

  res.status(200).json(flightOptions);
});

travelDeskRouter.post("/flight-options/:flightRequestId", RequiresAuth, async function (req: Request, res: Response) {
  
  try {
    
    await db.transaction(async trx => {
      const flightRequestID = Number(req.params.flightRequestId);
      const newFlightOptions = req.body;
      // console.log(newFlightOptions)
      if(newFlightOptions.length>0){
        await db("travelDeskFlightOption").delete().where("flightRequestID", flightRequestID);
        
        for(const newFlightOption of newFlightOptions){
          
          delete newFlightOption.state

          const flightSegments = newFlightOption.flightSegments
          delete newFlightOption.flightSegments

          newFlightOption.flightRequestID = flightRequestID

          const id = await db("travelDeskFlightOption").insert(newFlightOption, "flightOptionID");

          for(const flightSegment of flightSegments){
            // console.log(flightSegment)
            delete flightSegment.tmpId
            delete flightSegment.state
            delete flightSegment.departDay
            delete flightSegment.departTime
            delete flightSegment.arriveDay
            delete flightSegment.arriveTime
            flightSegment.flightOptionID=id[0].flightOptionID          
            await db("travelDeskFlightSegment").insert(flightSegment);
          }

        }
        res.status(200).json("Successful");
      }else{      
        res.status(500).json("Empty Payload for Flight Options");
      }
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json("Saving the Flight Options failed");
  }
});


travelDeskRouter.delete("/flight-options/:flightRequestId", RequiresAuth, RequiresRoleTdUser, async function (req: Request, res: Response) {  
  
  try {
    const flightRequestId = Number(req.params.flightRequestId);
    await db.transaction(async trx => {      
      await db("travelDeskFlightOption").delete().where("flightRequestID", flightRequestId).transacting(trx);
      res.status(200).json("Delete Successful");      
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json("Delete failed");
  }
});


travelDeskRouter.get("/travel-request/:taid", RequiresAuth, async function (req: Request, res: Response) {
  
  const flightSegmentState={
    flightErr:false,
    departDateErr:false,
    departTimeErr:false,
    departLocationErr:false,
    arriveDateErr:false,
    arriveTimeErr:false,
    arriveLocationErr:false,
    durationErr:false,
    classErr:false,
    statusErr:false,
  };

  const travelRequest = await db("travelDeskTravelRequest").select("*").where({
    TAID: req.params.taid
  }).first();


  if(travelRequest){
    const requestID = travelRequest.requestID

    let tmpId=1000;

    const flightRequests = await db("travelDeskFlightRequest").select("*").where("requestID", requestID);
    for(const flightRequest of flightRequests){
      const flightOptions = await db("travelDeskFlightOption").select("*").where("flightRequestID", flightRequest.flightRequestID);
      for(const flightOption of flightOptions){
        const flightSegments = await db("travelDeskFlightSegment").select("*").where("flightOptionID",flightOption.flightOptionID)
        for(const flightSegment of flightSegments){
          flightSegment.state = flightSegmentState;
          flightSegment.tmpId = tmpId;          
          flightSegment.departDay=flightSegment.departDate.substring(0,10);
          flightSegment.departTime=flightSegment.departDate.substring(11,16);
          flightSegment.arriveDay=flightSegment.arriveDate.substring(0,10);
          flightSegment.arriveTime=flightSegment.arriveDate.substring(11,16);
          tmpId++;
        }
        flightOption.flightSegments=flightSegments;
        flightOption.state={costErr:false};

      }
      flightRequest.flightOptions=flightOptions
    }
    travelRequest.flightRequests=flightRequests

    const rentalCars = await db("travelDeskRentalCar").select("*").where("requestID", requestID);
    travelRequest.rentalCars=rentalCars

    const hotels = await db("travelDeskHotel").select("*").where("requestID", requestID);
    travelRequest.hotels=hotels

    const otherTransportation = await db("travelDeskOtherTransportation").select("*").where("requestID", requestID);
    travelRequest.otherTransportation=otherTransportation

    const questions = await db("travelDeskQuestion").select("*").where("requestID", requestID);
    travelRequest.questions=questions
  }

  res.status(200).json(travelRequest);
});


travelDeskRouter.post("/travel-request/:taid", RequiresAuth, async function (req: Request, res: Response) {
  try {
    
    await db.transaction(async trx => {
      const TAID = Number(req.params.taid);
      const newTravelRequest = req.body;
      console.log(newTravelRequest)

      if (TAID) {

        const flightRequests = newTravelRequest.flightRequests
        delete newTravelRequest.flightRequests

        const rentalCars = newTravelRequest.rentalCars
        delete newTravelRequest.rentalCars

        const hotels = newTravelRequest.hotels
        delete newTravelRequest.hotels

        const otherTransportations = newTravelRequest.otherTransportation
        delete newTravelRequest.otherTransportation


        let id = null
        const travelRequestQuery = await db("travelDeskTravelRequest").select("*").where("TAID", TAID);
        
        if (travelRequestQuery.length == 1) {
          id = await db("travelDeskTravelRequest").update(newTravelRequest, "requestID").where("TAID", TAID);
        } 
        else if (travelRequestQuery.length == 0){          
          id = await db("travelDeskTravelRequest").insert(newTravelRequest, "requestID");
        } 
        else {
          return res.status(500).json("Multiple Travel Request Records!");
        }

        //FlightRequests
        await db("travelDeskFlightRequest").delete().where("requestID", id[0].requestID);
        
        for(const flightRequest of flightRequests){
          delete flightRequest.tmpId
          if(flightRequest.flightRequestID==null) delete flightRequest.flightRequestID
          flightRequest.requestID=id[0].requestID          
          await db("travelDeskFlightRequest").insert(flightRequest);
        }

        //RentalCars
        await db("travelDeskRentalCar").delete().where("requestID", id[0].requestID);
        
        for(const rentalCar of rentalCars){
          delete rentalCar.tmpId
          if(rentalCar.rentalVehicleID==null) delete rentalCar.rentalVehicleID
          rentalCar.requestID=id[0].requestID          
          await db("travelDeskRentalCar").insert(rentalCar);
        }

        //Hotels
        await db("travelDeskHotel").delete().where("requestID", id[0].requestID);
        
        for(const hotel of hotels){
          delete hotel.tmpId
          if(hotel.hotelID==null) delete hotel.hotelID
          hotel.requestID=id[0].requestID          
          await db("travelDeskHotel").insert(hotel);
        }

        //Other Transportations
        await db("travelDeskOtherTransportation").delete().where("requestID", id[0].requestID);
        
        for(const otherTransportation of otherTransportations){
          delete otherTransportation.tmpId
          if(otherTransportation.transportationID==null) delete otherTransportation.transportationID
          otherTransportation.requestID=id[0].requestID          
          await db("travelDeskOtherTransportation").insert(otherTransportation);
        }

        res.status(200).json("Successful");
      } else {
        res.status(500).json("Required fields in submission are blank");
      }
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json("Saving the Travel Request failed");
  }
});
