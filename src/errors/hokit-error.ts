import type { HokitErrorOptions } from "@hokit/types"

export class HokitError extends Error {
    public readonly code: string
    public readonly hint?: string
    public override readonly cause?: unknown

    constructor(options: HokitErrorOptions) {
        super(options.message)

        this.name = "HokitError"
        this.code = options.code

        if (options.hint !== undefined) {
            this.hint = options.hint
        }

        if (options.cause !== undefined) {
            this.cause = options.cause
        }
    }
}
