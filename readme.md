<div align="center">
    <img src="https://xgjzloifyvgpbmyonaya.supabase.co/storage/v1/object/public/files/CLkIt_6NNL/original" alt="Logo" width="200" />
    <br />
    <h1>Hokit</h1>
    <p>A declarative snippet compiler based on decorators.</p>
</div>

<br />

## Quick start

```sh
npx hokit init
npx hokit module --tsx
npx hokit snippet --tsx rfc
npx hokit build
```

`hokit init` creates a snippet-extension project with TypeScript, editor settings, formatting config, and empty module/template directories.

## Suggested Structure

```txt
.vscode/settings.json
src/
├── modules/
└── templates/
.editorconfig
.gitignore
.oxfmtrc.json
hokit.config.ts
package.json
tsconfig.json
```

## Configuration

Configuration is done through `hokit.config.ts`.

```ts
import { defineConfig } from "hokit"

export default defineConfig({
    cwd: "src/modules",
    output: "dist/snippets",
    presets: ["tsx"],
    extend: {
        presets: {
            astro: {
                scopes: ["astro"],
                tags: ["web", "astro"],
                transform: (snippets) =>
                    snippets.filter((snippet) => snippet.template === false)
            }
        }
    },
    docs: "off"
})
```

| Option           | Description                                        | Default  |
| ---------------- | -------------------------------------------------- | -------- |
| `cwd`            | Directory containing snippet modules               | required |
| `output`         | Directory where snippet JSON files are generated   | `dist`   |
| `presets`        | Enabled presets                                    | required |
| `extend.presets` | Adds custom presets or customizes built-in presets | `{}`     |
| `docs`           | Automatic Markdown documentation during build      | `"off"`  |

Output files are generated as `[output]/[preset].json`. For example, preset `tsx` with `output: "dist/snippets"` generates `dist/snippets/tsx.json`.

### Extending presets

`extend.presets` replaces the older `customPresets`/`overrides` model. If the preset exists, Hokit merges the extension with the built-in preset. If the preset does not exist, the extension defines a custom preset.

```ts
export default defineConfig({
    cwd: "src/modules",
    output: "dist/snippets",
    presets: ["tsx", "astro"],
    extend: {
        presets: {
            tsx: {
                tags: ["react"]
            },
            astro: {
                scopes: ["astro"]
            }
        }
    }
})
```

### Documentation

Documentation is generated automatically during `hokit build` when enabled.

```ts
export default defineConfig({
    cwd: "src/modules",
    output: "dist/snippets",
    presets: ["tsx"],
    docs: "on"
})
```

`docs: "on"` writes Markdown files to `docs`. To customize the output directory:

```ts
docs: {
    enabled: "on",
    output: "docs/snippets"
}
```

Pending snippets are included in the generated documentation with their status.

## Presets

Built-in presets:

- `tsx`
- `jsx`
- `swift`
- `kotlin`
- `python`
- `php`
- `ruby`
- `rust`
- `zig`
- `c`
- `cpp`
- `javascript`
- `empty`

Each preset generates one file using the global `output` directory.

## Modules and snippets

```ts
import { Module, Snippet, Todo, type SnippetDefinition } from "hokit"

import { template } from "@/templates/tsx"

@Module({ preset: "tsx" })
export class TsxModule {
    @Snippet({
        name: "React Functional Component",
        prefix: "rfc",
        body: template.rfc,
        description: "Create a React Functional Component",
        template: false
    })
    declare rfc: SnippetDefinition

    @Todo("Waiting for a future framework release")
    @Snippet({
        name: "React Arrow Component",
        prefix: "raf",
        body: template.raf,
        description: "Create a React Arrow Component",
        template: false
    })
    declare raf: SnippetDefinition
}
```

Modules that use the same preset are aggregated into the same output file. Names and prefixes must be unique within each preset.

For VS Code/Cursor snippets, Hokit injects the preset scope into each snippet. When `description` is omitted, the snippet name is used. `template` is converted to `isFileTemplate` and defaults to `false`.

### Decorators

- `@Module`: defines the preset used by the class.
- `@Snippet`: defines a snippet that can be built.
- `@Todo`: marks a real snippet as pending. Pending snippets are ignored by the regular build, reported by lint, and included in docs.

Using `@Todo` without `@Snippet` is an error.

## CLI

### `hokit init`

Initializes a new project, writes concrete dependency ranges instead of `latest`, and installs dependencies using the first available package manager in this order:

1. `bun`
2. `nub`
3. `pnpm`
4. `npm`
5. `yarn`

Existing files are preserved.

```sh
hokit init
```

### `hokit build`

Loads modules, validates snippets, writes JSON files, and optionally generates docs.

```sh
hokit build
hokit build --include-todo
```

`--include-todo` includes pending snippets in a preview build.

### `hokit module --[preset]`

Creates or updates the module and template index for a preset, and enables the preset in `hokit.config.ts`.

```sh
hokit module --tsx
hokit module tsx
hokit module --list
```

It creates or preserves:

- `src/modules/<preset>.ts`
- `src/templates/<preset>/index.ts`

Preset names used through the CLI must start with a letter and may contain only letters, numbers, hyphens, and underscores.

### `hokit snippet --[preset] [prefix]`

Creates or updates a snippet module, template index, and body file.

```sh
hokit snippet --tsx rfc
hokit snippet tsx rfc
hokit snippet --list
hokit snippet --tsx --list
```

It creates or updates:

- `src/modules/tsx.ts`
- `src/templates/tsx/index.ts`
- `src/templates/tsx/rfc.ts`

Generated snippet fields start as placeholders so the developer can fill name, description, and body intentionally.

Snippet prefixes used through the CLI must start with a letter and may contain only letters, numbers, and underscores.

### `hokit todo --[preset] [prefix]`

Creates the same files as `hokit snippet`, but marks the generated snippet as pending. If the snippet already exists, Hokit only adds `@Todo("")` to that snippet instead of creating a duplicate.

```sh
hokit todo --tsx raf
hokit todo tsx raf
hokit todo --list
hokit todo --tsx --list
```

### `hokit lint`

Runs validation rules.

```sh
hokit lint
hokit lint --fix
hokit lint --json
```

`--fix` safely trims simple text fields and fixes empty inline `body: []` definitions.

### `hokit doctor`

Checks Node.js, configuration, module directory, presets, and output path safety.

```sh
hokit doctor
```

### `hokit clean`

Removes generated snippet JSON files for enabled presets.

```sh
hokit clean
```

### `hokit info`

Displays the Hokit version, project directory, output directory, and active presets.

```sh
hokit info
```

### `hokit watch`

Runs an initial build and rebuilds when source files change.

```sh
hokit watch
```

### `hokit help`

Displays a formatted command reference with grouped commands, flags, and examples.

```sh
hokit help
hokit --help
hokit --version
```

## Validator decorators

Validation decorators are available through the public subpath:

```ts
import { Min, Required, Unique } from "hokit/validator"
```
