<div align="center">
    <img src="https://xgjzloifyvgpbmyonaya.supabase.co/storage/v1/object/public/files/CLkIt_6NNL/original" alt="Logo" width="200" />
    <br />
    <h1>Hokit</h1>
    <p>A declarative snippet compiler based on decorators.</p>
</div>

<br />

## Quick start

A quick start guide for the most common use cases.

```sh
npx hokit init
npx hokit build
```

The `init` command initializes a pre-configured project with well-defined defaults;

## Suggested Structure

```txt
.vscode/settings.json
src/
└── modules/
    └── tsx.ts
.editorconfig
.gitignore
.oxfmtrc.json
hokit.config.ts
package.json
tsconfig.json
```

- Editor settings compatible with `oxfmt`;
- Formatting preferences;
- Build settings;
- Dependency installation;

## Configuration

Configuration is done through a `hokit.config.ts` file.

```ts
import { defineConfig } from "hokit"

export default defineConfig({
    cwd: "src/modules",
    presets: ["tsx"],
    target: "vscode",
    overrides: {
        tsx: {
            output: "dist/tsx.json"
        }
    }
})
```

| Option      | Description                                      | Standard             |
| ----------- | ------------------------------------------------ | -------------------- |
| `cwd`       | Directory containing the modules                 | required             |
| `presets`   | Enabled presets                                  | required             |
| `target`    | Output format `vscode`                           | `vscode`             |
| `overrides` | Output substitutions, scopes, and transformation | preset configuration |

#### Presets

Available presets:

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
- `empty`.

Each language preset generates `dist/<language>.json`; `overrides` allows you to change output, scopes, or transformation individually.

## Modules and Snippets

```ts
import { Module, Snippet, Todo, type SnippetDefinition } from "hokit"

@Module({ preset: "tsx" })
export class TsxModule {
    @Snippet({
        name: "React Functional Component",
        prefix: "rfc",
        body: [
            'import type { JSX } from "react"',
            "",
            "export default function ${TM_FILENAME_BASE/(.*)/${1:/capitalize}/}(): JSX.Element {",
            "    return (",
            "        $1",
            "    )",
            "}"
        ],
        description: "Creates a React functional component",
        template: true
    })
    declare tsx: SnippetDefinition

    @Todo("Create a store with Zustand. [pending]")
    declare useStore: SnippetDefinition
}
```

Modules that use the same preset are aggregated into the same file. Names and prefixes must be unique within the preset.

In the VS Code output, each snippet receives the `scope` of the preset. When `description` is not provided, the name of the snippet is used; `template` is converted to `isFileTemplate` and defaults to `false`.

### Decorators

- `@Module`: Defines a module and the preset to be used.
- `@Snippet`: Define the snippet properties.
- `@Todo`: Marks a snippet as "pending" to be implemented later. It is ignored by the build.

## CLI

### `hokit init`

Initializes a project with configuration, TypeScript, and a sample TSX module.

Existing files are preserved.

```sh
hokit init
```

### `hokit build`

Loads TypeScript modules, validates snippets, and saves preset files.

Writing is atomic: an error will not leave a partially generated file.

```sh
hokit build
```

### `hokit module [preset]`

Creates a module for a preset. If necessary, automatically enables the preset in `hokit.config.ts`. Without an argument, it uses the first preset in the configuration. It does not overwrite existing modules. Templates do not include `@Todo`; use `--todo` to add it after the last snippet. Without specifying a preset, the first one in the configuration is used.

```sh
hokit module tsx
hokit module tsx --todo
hokit module --todo
hokit module --list
```

### `hokit lint [--fix]`

Executes the `required`, `min`, and `unique` rules on all modules.

The `--fix` option safely corrects outer spaces in text and adds `$0` to an empty `body`. Ambiguous issues, such as duplicate names, continue to be reported for manual correction.

```sh
hokit lint
hokit lint --fix
```

### `hokit doctor`

Check the Node.js version, configuration, module directory, presets, and ensure all output paths are safe.

```sh
hokit doctor
```

### `hokit clean`

Remove only the output files specified by the presets, always within the project directory.

```sh
hokit clean
```

### `hokit info`

Displays the Hokit version, project directory, target, and active presets.

```sh
hokit info
```

### `hokit watch`

Perform an initial build and recompile when a node changes. Quick changes are queued to prevent concurrent builds.

```sh
hokit watch
```

### `hokit help`

Displays a summary reference of the commands.

```sh
hokit help
hokit --help
hokit --version
```

## Personalized validation

Validation decorators are also available via the public subpath:

```ts
import { Min, Required, Unique } from "hokit/validator"
```

## Architecture

```txt
    Configuration + TypeScript modules
                ↓
    Decorator loader
                ↓
    Global metadata registry
                ↓
    Scanner → Validation → Preset → Schema
                ↓
    Secure atomic writing
```

The global registry maintains the same metadata between the public bundle and the CLI bundle. Validation occurs before any files are replaced.
