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
