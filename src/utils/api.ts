import { Errors, toValidationResponseBody } from "@/validations";
import { HttpStatus } from "./http";
import { ZodError } from "zod";

export async function extractErrorText<TError extends Errors.ErrorResponse = Errors.ErrorResponse>(response: Response | TError): Promise<string | null> {
	try {
		let responseBody: TError;
		if (response instanceof Response) {
			responseBody = await response.json();
		} else {
			responseBody = response;
		}

		if ((responseBody as unknown as Errors.ZodErrorResponse<any>).zodError != null) {
			return (responseBody as unknown as Errors.ZodErrorResponse<any>).zodError.pretty;
		}

		if (responseBody.error != null) {
			return responseBody.error;
		}

		if (response instanceof Response) {
			return response.statusText;
		}

		return null;
	} catch (error) {
		console.error("Error extracting error text", error);
		if (response instanceof Response) {
			return response.statusText;
		}

		return null;
	}
}

export const Ok = <T extends object>(body?: T) => Response.json(body);
export const Created = <T extends object>(body?: T) => Response.json(body, { status: HttpStatus.CREATED });
export const NoContent = () => new Response(null, { status: HttpStatus.NO_CONTENT });
export const BadRequest = <T extends Errors.ErrorResponse>(body: T) => Response.json(body, { status: HttpStatus.BAD_REQUEST });
export const BadValidation = <T>(error: string | ZodError<T>) => {
	if (error instanceof ZodError) {
		return BadRequest(toValidationResponseBody(error))
	}

	return BadRequest({ error });
}
export const Unauthorized = () => Response.json(Errors.Unauthorized, { status: HttpStatus.UNAUTHORIZED });
export const NotFound = () => Response.json(Errors.NotFound, { status: HttpStatus.NOT_FOUND });
