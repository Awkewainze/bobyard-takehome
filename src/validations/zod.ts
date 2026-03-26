import z, { flattenError, prettifyError, treeifyError, ZodError, ZodType, type output } from "zod";
import type { Errors } from "./error";

export const zId = z.coerce.number()
	.positive();

export const zTake = z.coerce.number()
	.positive()
	.max(100)
	.default(20)
	.catch(20);

export const zOrderBy = z.literal(["id", "date"])
	.optional()
	.default("date")
	.catch("date");

export type zOrderByType = z.infer<typeof zOrderBy>;

export const zAscOrDesc = z.literal(["asc", "desc"])
	.optional()
	.default("desc")
	.catch("desc");

export type zAscOrDescType = z.infer<typeof zAscOrDesc>;

export const zCursor = z.coerce.number()
	.optional()
	.catch(undefined)
	.transform(x => (x === 0 ? undefined : x));

export const zDateTime = z.iso.datetime()
	.transform(x => new Date(x))
	.default(() => new Date())
	.catch(() => new Date());

export const zComment = z.object({
	author: z.string().min(1).max(100),
	text: z.string().min(1).max(2000),
	image: z.url().optional().default("").catch(""),
	parentId: z.coerce.number().optional().nullable().default(null).catch(null)
});

export function toValidationResponseBody<TSchema extends ZodType, TParseError extends ZodError<output<TSchema>>>(zodParseError: TParseError): Errors.ZodErrorResponse<TSchema> {
	return {
		error: "Validation Error",
		zodError: {
			pretty: prettifyError(zodParseError),
			flatten: flattenError(zodParseError),
			tree: treeifyError(zodParseError)
		}
	}
}
