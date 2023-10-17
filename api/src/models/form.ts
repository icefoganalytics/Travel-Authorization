import {
  Association,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  DataTypes,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManySetAssociationsMixin,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from "sequelize"

import sequelize from "@/db/db-client"
import Expense from "./expense"
import Stop from "./stop"
import TravelPurpose from "./travel-purpose"

// These are a best guess, database values may not match this list.
// TODO: normalize database values and make sure all statuses are in this list.
// If we want validation for this field we should swith to an ORM such as Sequelize.
// Avoid exporting here, and instead expose via the Expense model to avoid naming conflicts
enum Statuses {
  DRAFT = "Draft",
  SUBMITTED = "Submitted",
  APPROVED = "Approved",
  DENIED = "Denied",
  CHANGE_REQUESTED = "Change Requested",
}

export class Form extends Model<InferAttributes<Form>, InferCreationAttributes<Form>> {
  static Statuses = Statuses

  declare id: number
  declare userId: number
  declare firstName: string | null
  declare lastName: string | null
  declare department: string | null
  declare division: string | null
  declare branch: string | null
  declare unit: string | null
  declare email: string | null
  declare mailcode: string | null
  declare daysOffTravelStatus: number | null
  declare dateBackToWork: Date | null
  declare travelDuration: number | null
  // declare purpose: string | null - deprecated but still in the database.
  declare travelAdvance: number | null
  declare eventName: string | null
  declare summary: string | null
  declare benefits: string | null
  declare status: Statuses | null
  declare formId: string
  declare supervisorEmail: string | null
  declare preappId: number | null
  declare approved: string | null
  declare requestChange: string | null
  declare denialReason: string | null
  declare oneWayTrip: boolean | null
  declare multiStop: boolean | null
  declare createdBy: number | null
  declare purposeId: number | null
  declare travelAdvanceInCents: number | null
  declare allTravelWithinTerritory: boolean | null

  // associations stops, purpose, expenses
  // https://sequelize.org/docs/v6/other-topics/typescript/#usage
  // https://sequelize.org/docs/v6/core-concepts/assocs/#special-methodsmixins-added-to-instances
  // https://sequelize.org/api/v7/types/_sequelize_core.index.belongstocreateassociationmixin
  declare getPurpose: BelongsToGetAssociationMixin<TravelPurpose>
  declare setPurpose: BelongsToSetAssociationMixin<TravelPurpose, TravelPurpose["id"]>
  declare createPurpose: BelongsToCreateAssociationMixin<TravelPurpose>

  declare getExpenses: HasManyGetAssociationsMixin<Expense>
  declare setExpenses: HasManySetAssociationsMixin<Expense, Expense["formId"]>
  declare hasExpense: HasManyHasAssociationMixin<Expense, Expense["formId"]>
  declare hasExpenses: HasManyHasAssociationsMixin<Expense, Expense["formId"]>
  declare addExpense: HasManyAddAssociationMixin<Expense, Expense["formId"]>
  declare addExpenses: HasManyAddAssociationsMixin<Expense, Expense["formId"]>
  declare removeExpense: HasManyRemoveAssociationMixin<Expense, Expense["formId"]>
  declare removeExpenses: HasManyRemoveAssociationsMixin<Expense, Expense["formId"]>
  declare countExpenses: HasManyCountAssociationsMixin
  declare createExpense: HasManyCreateAssociationMixin<Expense>

  declare getStops: HasManyGetAssociationsMixin<Stop>
  declare setStops: HasManySetAssociationsMixin<Stop, Stop["taid"]>
  declare hasStop: HasManyHasAssociationMixin<Stop, Stop["taid"]>
  declare hasStops: HasManyHasAssociationsMixin<Stop, Stop["taid"]>
  declare addStop: HasManyAddAssociationMixin<Stop, Stop["taid"]>
  declare addStops: HasManyAddAssociationsMixin<Stop, Stop["taid"]>
  declare removeStop: HasManyRemoveAssociationMixin<Stop, Stop["taid"]>
  declare removeStops: HasManyRemoveAssociationsMixin<Stop, Stop["taid"]>
  declare countStops: HasManyCountAssociationsMixin
  declare createStop: HasManyCreateAssociationMixin<Stop>

  declare expenses?: NonAttribute<Expense[]>
  declare purpose?: NonAttribute<TravelPurpose>
  declare stops?: NonAttribute<Stop[]>

  declare static associations: {
    expenses: Association<Form, Expense>
    purpose: Association<Form, TravelPurpose>
    stops: Association<Form, Stop>
  }

  static establishAssociations() {
    this.belongsTo(TravelPurpose, {
      as: "purpose",
      foreignKey: "purposeId",
    })
    this.hasMany(Stop, {
      as: "stops",
      sourceKey: "id",
      foreignKey: "taid",
    })
    this.hasMany(Expense, {
      as: "expenses",
      sourceKey: "id",
      foreignKey: "formId",
    })
  }

  get estimates(): NonAttribute<Expense[] | undefined> {
    return this.expenses?.filter((expense) => expense.type === Expense.Types.ESTIMATE)
  }
}

Form.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users", // using table name here, instead of Model class
        key: "id",
      },
    },
    purposeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "travelPurpose", // using table name here, instead of Model class
        key: "id",
      },
    },
    firstName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    department: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    division: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    branch: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    unit: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    mailcode: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    daysOffTravelStatus: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    dateBackToWork: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    travelDuration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // Deprecated but still in the database.
    // purpose: {
    //   type: DataTypes.STRING(255),
    //   allowNull: true,
    // },
    travelAdvance: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    eventName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    summary: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    benefits: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    formId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    supervisorEmail: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    preappId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    approved: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    requestChange: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    denialReason: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    // TODO: set default to false in the database
    oneWayTrip: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    // TODO: set default to false in the database
    multiStop: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    travelAdvanceInCents: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    allTravelWithinTerritory: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "travel_authorizations",
    modelName: "Form",
    timestamps: false,
  }
)

export default Form
