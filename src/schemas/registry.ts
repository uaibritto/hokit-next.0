import type { Schema, Target } from "@hokit/types"

import { VSCodeSchema } from "./vscode"
import { ZedSchema } from "./zed"

export const Schemas: Record<Target, Schema> = {
    vscode: VSCodeSchema,
    zed: ZedSchema
}
