import type { SnippetDefinition } from "../../types"
import { Min, Required, Unique } from "../decorators"

export class SnippetFields {
    @Required("Snippet name is required.")
    @Unique("Snippet name must be unique.")
    declare name: SnippetDefinition["name"]

    @Required("Snippet prefix is required.")
    @Unique("Snippet prefix must be unique.")
    declare prefix: SnippetDefinition["prefix"]

    @Required("Snippet body is required.")
    @Min(1, "Snippet body must contain at least one line.")
    declare body: SnippetDefinition["body"]
}
