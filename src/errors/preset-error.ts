import { HokitError } from "./hokit-error"

export class PresetError extends HokitError {
    constructor(message: string, hint?: string, cause?: unknown) {
        super({
            code: "PRESET_ERROR",
            message,
            ...(hint !== undefined && { hint }),
            ...(cause !== undefined && { cause })
        })

        this.name = "PresetError"
    }
}
