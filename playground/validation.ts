import { Min, Unique } from "@hokit/validators"

class SnippetFields {
    @Min(3, "The property name must be longer than 3 characters.")
    name: string

    @Unique()
    prefix: string

    constructor(name: string, prefix: string) {
        this.name = name
        this.prefix = prefix
    }
}

new SnippetFields("TI", "rfc")
