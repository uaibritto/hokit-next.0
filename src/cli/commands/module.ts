import { generateModule } from "@hokit/filesystem/write-output"

export async function module(template: string): Promise<void> {
    await generateModule(template)
}
