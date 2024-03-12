import { z } from "zod";
import { parseNumber } from "./utils";

/**
 * Contains commands that will trigger actions on the front end once an API request has been completed.
 */
export enum ServerHxTriggerEvents {
  LOGIN_STATUS_CHANGE = "loginStatusChangeEvent",
  GENERAL_ERROR = "generalErrorEvent",
  REFRESH_ORDER = "refreshOrderEvent",
}

export const CookieConstansts = {
  maxAge: 60 * 3,
  path: "/;/auth;/root;/orders;/payments;/inventory",
} as const;

export const RequestNumberSchema = z.string().transform(parseNumber);

export const SwaggerTags = {
  Auth: { name: "Auth", description: "Authentication Endpoints" },
  Inventory: { name: "Inventory", description: "Inventory Endpoints" },
  Orders: { name: "Orders", description: "Orders Endpoints" },
  Payments: { name: "Payments", description: "Payments Endpoints" },
  Users: { name: "Users", description: "Users Endpoints" },
} as const;
