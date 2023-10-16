import express, { Request, Response } from "express";
import { DB_CONFIG } from "../config";
import knex from "knex";
import { ReturnValidationErrors, RequiresRoleAdmin } from "../middleware";
import { param, query } from "express-validator";
import { loadUser, checkJwt } from "../middleware/authz.middleware";
import { UserService } from "../services";
import { RequiresRoleTdUser } from "../middleware";

export const userRouter = express.Router();
const db = knex(DB_CONFIG);
const userService = new UserService();

userRouter.get("/me", async (req: Request, res: Response) => {
  let person = req.user;

  if (person)
    return res.json({
      data: await makeDTO(person)
    });
});

async function makeDTO(userRaw: any) {
  let dto = userRaw;
  dto.display_name = `${userRaw.first_name} ${userRaw.last_name}`;
  //dto.roles = _.split(userRaw.roles, ",").filter(r => r.length > 0);
  //dto.access = await db.getAccessFor(userRaw.email);
  //dto.display_access = _.join(dto.access.map((a: any) => a.level), ", ")

  return dto;
}

userRouter.get("/", async (req: Request, res: Response) => {
  try {
    let users = await userService.getAll();
    res.status(200).json(users);
  } catch (error: any) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
});

userRouter.get("/unit", async (req: Request, res: Response) => {
  try {
    let unit = await userService.getUnit(req.user?.email);
    res.status(200).json(unit);
  } catch (error: any) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
});

userRouter.get("/travel-desk-users", RequiresRoleTdUser, async (req: Request, res: Response) => {
  try {
    const users = await db("user")
      .select("email", "first_name", "last_name")
      .where("status", "=", "Active")
      .andWhereLike("roles", "%TdUser%");

    res.status(200).json(users);
  } catch (error: any) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
});

userRouter.put("/:id/permissions", RequiresRoleAdmin, async (req: Request, res: Response) => {
  try {
    console.log("body", req.body);
    await userService.updateById(req.params.id, { first_name: req.body.first_name, last_name: req.body.last_name });
    await userService.saveDepartmentAccess(req.params.id, req.body.departments);
    await userService.saveRoleAccess(req.params.id, req.body.roles);
    res.status(200).json("Saved permissions");
  } catch (error: any) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
});

userRouter.get("/:id/permissions", async (req: Request, res: Response) => {
  try {
    // let departments = await userService.getDepartmentAccess(req.params.id);
    // let roles = await userService.getRoleAccess(req.params.id);
    const user = await db("user")
      .select("*")
      .where({
        id: req.params.id
      })
      .first();
    console.log(user);
    let permissions = {
      first_name: user.first_name,
      last_name: user.last_name,
      departments: user.department,
      roles: user.roles?.split(",")
    };
    res.status(200).json(permissions);
  } catch (error: any) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
});

userRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    let users = await userService.getById(req.params.id);
    res.status(200).json(users);
  } catch (error: any) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
});
