# Hokit

## Recommended Structure

A recommended project structure:

```txt
src/
├── modules/
│    ├── react.ts
│    ├── node.ts
│    └── vue.ts
│
└──hokit.config.ts
```

## Configuration

Define the build settings.

### Options

| Option    | Description                     | Default         |
| --------- | ------------------------------- | --------------- |
| `cwd`     | Diretório raiz contendo módulos | `"src/modules"` |
| `presets` | Predefinições a aplicar         | `[]`            |
| `target`  | Alvo de execução                | `vscode`        |

### Example

```ts
import path from "node:path"
import { defineConfig } from "@hokit/config"

export default defineConfig({
    cwd: path.join("src", "modules"),
    presets: ["node", "react"],
    target: "vscode"
})
```

### Presets

The presets allow you to define standard conventions or conventions for your modules.

```ts
// types
export interface PresetConfig {
    output: string
    scopes: Scope | Scope[]
    tags?: string[]
    // It receives the module snippets and can transform them before generating the file.
    transform?: (snippets: SnippetConfig[]) => SnippetConfig[]
}
```

```ts
// config
export default defineConfig({
    cwd: path.join("src", "modules"),
    presets: {
        react: {
            output: "dist/react.json",
            scopes: ["typescriptreact"]
        }
    },
    target: "vscode"
})
```

## Creating modules

A module groups snippets that share metadata.

```ts
import { Module, Snippet, Todo, SnippetDefinition } from "hokit"

@Module({ preset: "react" })
class ReactModule {
    @Snippet({
        name: "React Functional Component",
        prefix: "rfc",
        body: ["$0"]
    })
    declare rfc: SnippetDefinition

    @Todo("Implementation pending")
    declare saf: SnippetDefinition
}
```

## Validation

Performs validation of DTO fields using validators.
Used by the linter to ensure that DTO fields are validated correctly.

```ts
import { Unique, Require, Min } from 'hokit/validator"

class SnippetFields {
    @Unique()
    @Require()
    name: string

    @Unique()
    @Require()
    prefix: string

    @Min(1)
    body: string[]
}
```

## CLI

### Help

Displays information about the available commands.

```sh
hokit help
```

```sh
# commands:

`init`          # Inicia um novo projeto com um template padrão
`build`         # Gera arquivos de snippet
`module`        # Cria um novo módulo com base em um template
`watch`         # Inicia o modo de observação
`doctor`        # Verifica a configuração do projeto
`lint`          # Executa o linter

# flags:

`--list`        # Lista todos os módulos disponíveis
`--fix`          # Executa o linter e corrige automaticamente os problemas
```
