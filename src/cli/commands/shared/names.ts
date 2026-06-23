export function assertPresetCliName(value: string) {
    if (/^[A-Za-z][A-Za-z0-9_-]*$/.test(value)) return

    throw new Error(
        `Preset "${value}" can only contain letters, numbers, hyphens, and underscores, and must start with a letter.`
    )
}

export function assertSnippetCliName(value: string) {
    if (/^[A-Za-z][A-Za-z0-9_]*$/.test(value)) return

    throw new Error(
        `Snippet prefix "${value}" can only contain letters, numbers, and underscores, and must start with a letter.`
    )
}
