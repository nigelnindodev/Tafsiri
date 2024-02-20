import { z } from "zod";

const mySchema = z.string();

mySchema.parse(12);
