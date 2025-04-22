import { Schema } from "amplify/data/resource";

export type FieldInput = {
  inputFieldName: string;
  inputFieldType: string;
  inputFieldDescription: string;
  inputFieldPlaceholder: string;
  inputFieldRequired: boolean;
  inputFieldOptions: string[];
};

export type Tool = Schema["Tool"];
// export type EditRequest = Schema["EditRequest"];

export type ToolStatus =
  | "DRAFT"
  | "ACTIVE"
  | "PENDING"
  | "INACTIVE"
  | "ARCHIVED"
  | "IN-PROGRESS"
  | "ERROR";
