import { HokitError } from "./hokit-error"

export class ValidationError extends HokitError {
    constructor(message: string, hint?: string, cause?: unknown) {
        super({
            code: "VALIDATION_ERROR",
            message,
            ...(hint !== undefined && { hint }),
            ...(cause !== undefined && { cause })
        })

        this.name = "ValidationError"
    }
}
