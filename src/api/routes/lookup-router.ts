import express, { Request, Response } from 'express';
import { ReturnValidationErrors } from '../middleware';
import { DB_CONFIG, AZURE_KEY } from '../config';
import knex from 'knex';
import axios from 'axios';
import { slice } from 'lodash';
import { stringify } from 'querystring';
import { LookupService } from '../services';

export const lookupRouter = express.Router();
const db = knex(DB_CONFIG);

const lookupService = new LookupService();

lookupRouter.get(
	'/populateEmailList',
	ReturnValidationErrors,
	async function (req: Request, res: Response) {
		try {
			lookupService.populateEmailList();
			res.status(200).json('Success');
		} catch (error: any) {
			console.log(error);
			res.status(500).json('Internal Server Error');
		}
	}
);

lookupRouter.get(
	'/emailList',
	ReturnValidationErrors,
	async function (req: Request, res: Response) {
		try {
			let emailList = await axios
				.get(
					`http://directory-api-dev.ynet.gov.yk.ca/employees?email=` +
						req.query.email,
					{
						headers: {
							'Ocp-Apim-Subscription-Key': AZURE_KEY,
						},
					}
				)
				.then((resp: any) => {
					let list = [];
					for (let employee of resp.data.employees) {
						if (employee.email != '') list.push(employee.email);
					}
					return list.sort();
				});
			res.status(200).json(emailList);
		} catch (error: any) {
			console.log(error);
			res.status(500).json('Internal Server Error');
		}
	}
);

lookupRouter.get(
	'/destination',
	ReturnValidationErrors,
	async function (req: Request, res: Response) {
		try {
			let result = await db('destinations').select('id', 'province', 'city');
			res.status(200).json(result);
		} catch (error: any) {
			console.log(error);
			res.status(500).json('Internal Server Error');
		}
	}
);

lookupRouter.get(
	'/departments',
	ReturnValidationErrors,
	async function (req: Request, res: Response) {
		try {
			let result = await db('departments')
				.select('id', 'name', 'type', 'ownedby')
				.where('type', '=', 'department');
			res.status(200).json(result);
		} catch (error: any) {
			console.log(error);
			res.status(500).json('Internal Server Error');
		}
	}
);

lookupRouter.get(
	'/branches',
	ReturnValidationErrors,
	async function (req: Request, res: Response) {
		try {
			let result = await db('departments')
				.select(
					'departments.id',
					'departments.name',
					'departments.type',
					'departments.ownedby',
					'b.name as department'
				)
				.where('departments.type', '=', 'branch')
				.innerJoin('departments as b', 'departments.ownedby', 'b.id');
			result.map((element) => {
				element.fullName = `${element.department} - ${element.name}`;
			});
			res.status(200).json(result);
		} catch (error: any) {
			console.log(error);
			res.status(500).json('Internal Server Error');
		}
	}
);

lookupRouter.get(
	'/department/:id',
	ReturnValidationErrors,
	async function (req: Request, res: Response) {
		try {
			let result = await db('departments')
				.select('id', 'name', 'type', 'ownedby')
				.where('ownedby', '=', req.params.id)
				.andWhere('type', '=', 'branch');
			res.status(200).json(result);
		} catch (error: any) {
			console.log(error);
			res.status(500).json('Internal Server Error');
		}
	}
);

lookupRouter.get(
	'/roles',
	ReturnValidationErrors,
	async function (req: Request, res: Response) {
		try {
			let result = await db('roles').select('id', 'rolename');
			res.status(200).json(result);
		} catch (error: any) {
			console.log(error);
			res.status(500).json('Internal Server Error');
		}
	}
);

lookupRouter.get(
	'/departmentList',
	ReturnValidationErrors,
	async function (req: Request, res: Response) {
		let cleanList: any = {};
		try {
			let depList = await axios
				.get(`https://api.gov.yk.ca/directory/divisions`, {
					headers: {
						'Ocp-Apim-Subscription-Key': AZURE_KEY,
					},
				})
				.then((resp: any) => {
					for (let slice of resp.data.divisions) {
						if (cleanList[slice.department] == null)
							cleanList[slice.department] = {};

						if (slice.division)
							if (cleanList[slice.department][slice.division] == null)
								cleanList[slice.department][slice.division] = {};

						if (slice.branch)
							if (
								cleanList[slice.department][slice.division][slice.branch] ==
								null
							)
								cleanList[slice.department][slice.division][slice.branch] = [];

						if (slice.unit)
							cleanList[slice.department][slice.division][slice.branch].push(
								slice.unit
							);
					}
					return cleanList;
				});
			res.status(200).json(depList);
		} catch (error: any) {
			console.log(error);
			res.status(500).json('Internal Server Error');
		}
	}
);
