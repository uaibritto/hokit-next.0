import { HokitError } from "./hokit-error"

export class BuildError extends HokitError {
    constructor(message: string, hint?: string, cause?: unknown) {
        super({
            code: "BUILD_ERROR",
            message,
            ...(hint !== undefined && { hint }),
            ...(cause !== undefined && { cause })
        })

        this.name = "BuildError"
    }
}
