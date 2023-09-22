export * from "./user-service";
export * from "./form-service";
export * from "./lookup-service";
export * from "./audit-service";
export * from "./distance-matrix-service";
export interface QueryStatement {
  field: string;
  operator: string;
  value: any;
}

export interface SortStatement {
  field: string;
  direction: SortDirection;
}

export enum SortDirection {
  ASCENDING = "asc",
  DESCENDING = "desc"
}
