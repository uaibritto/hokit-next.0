import { HokitError } from "./hokit-error"

export class ConfigError extends HokitError {
    constructor(message: string, hint?: string, cause?: unknown) {
        super({
            code: "CONFIG_ERROR",
            message,
            ...(hint !== undefined && { hint }),
            ...(cause !== undefined && { cause })
        })

        this.name = "ConfigError"
    }
}
