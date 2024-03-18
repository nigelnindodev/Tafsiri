import { z } from "zod"

export const parseNumber = (value: string): number => {
    const parsedNumberResult = Number(value)
    if (isNaN(parsedNumberResult)) {
        throw new z.ZodError([
            {
                code: z.ZodIssueCode.invalid_type,
                expected: "number",
                received: "string",
                path: [],
                message: `Failed to parse [${value}] as a number`,
            },
        ])
    } else {
        return parsedNumberResult
    }
}
