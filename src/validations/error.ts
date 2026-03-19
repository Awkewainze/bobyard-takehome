import type { ZodType, flattenError, output, treeifyError } from "zod";

export namespace Errors {
    export type ErrorResponse = {
        error: string;
    };

    export type ZodErrorResponse<TSchema extends ZodType> = {
        error: "Validation Error",
        zodError: {
            pretty: string,
            flatten: ReturnType<typeof flattenError<output<TSchema>>>
            tree: ReturnType<typeof treeifyError<output<TSchema>>>
        }
    } & ErrorResponse;

    export namespace Messages {
        export const LoginInvalid = "Username or Password is invalid";

        export const Unauthorized = "Access token is missing or invalid";
        export const NotFound = "Resource is either missing or you don't have access";
    }

    export const NotFound = { error: Errors.Messages.NotFound } as const;
    export const Unauthorized = { error: Errors.Messages.Unauthorized } as const;
}
