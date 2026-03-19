import { serve } from "bun";
import index from "./index.html";
import { ZodType, type output } from "zod";
import { Created, NoContent, NotFound, Ok, BadValidation } from "@/utils/api";
import { zComment, zTake, zCursor, zId } from "@/validations/zod";
import { PrismaClient } from "generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export function zParseOrBadRequest<TSchema extends ZodType>(schema: TSchema, data: unknown, overrideResponse?: Response): { isValid: true, data: output<TSchema> } | { isValid: false, response: Response } {
	const parseResult = schema.safeParse(data);
	if (parseResult.success) {
		return { isValid: true, data: parseResult.data };
	}

	return { isValid: false, response: BadValidation(parseResult.error) };
}

export const server = serve({
	routes: {
		"/api/comments": {
			async GET(req) {
				const { searchParams } = new URL(req.url);
				const take = zTake.parse(searchParams.get("take"));
				const cursorId = zCursor.parse(searchParams.get("cursor"));
				const cursor = cursorId == undefined ? undefined : { id: cursorId };

				const results = await prisma.comment.findMany({
					take,
					skip: cursor == undefined ? 0 : 1,
					cursor,
					orderBy: {
						date: "desc"
					}
				});

				return Ok(results);
			},

			async POST(req) {
				const parseResult = zParseOrBadRequest(zComment, await req.json());
				if (!parseResult.isValid) {
					return parseResult.response;
				}

				const created = await prisma.comment.create({
					data: {
						author: parseResult.data.author,
						text: parseResult.data.text,
						image: parseResult.data.image,
						likes: 0
					}
				});

				return Created(created);
			}
		},
		"/api/comments/:commentId": {
			async PUT(req) {
				const { success: idParseSuccess, data: id } = zId.safeParse(req.params.commentId);
				if (!idParseSuccess) {
					return BadValidation("Invalid commentId");
				}

				const parseResult = zParseOrBadRequest(zComment, await req.json());
				if (!parseResult.isValid) {
					return parseResult.response;
				}

				const created = await prisma.comment.update({
					where: {
						id
					},
					data: {
						...parseResult.data,
					}
				});
				return Ok(created);
			},

			async DELETE(req) {
				const { success: idParseSuccess, data: id } = zId.safeParse(req.params.commentId);
				if (!idParseSuccess) {
					return BadValidation("Invalid commentId");
				}

				const result = await prisma.comment.delete({
					where: {
						id
					}
				});

				return NoContent();
			}
		},

		"/api/comments/:commentId/like": {
			async POST(req) {
				const { success: idParseSuccess, data: id } = zId.safeParse(req.params.commentId);
				if (!idParseSuccess) {
					return BadValidation("Invalid commentId");
				}

				const newComment = await prisma.comment.update({
					where: {
						id
					},
					data: {
						likes: {
							increment: 1
						}
					}
				});

				return Ok({ likes: newComment.likes });
			}
		},

		// Invalid api call
		"/api/*": async () => {
			return NotFound();
		},

		// Serve index.html for all unmatched routes.
		"/*": index,
	},

	development: process.env.NODE_ENV !== "production" && {
		// Enable browser hot reloading in development
		hmr: true,

		// Echo console logs from the browser to the server
		console: true,
	},
});

console.log(`🚀 Server running at ${server.url}`);
