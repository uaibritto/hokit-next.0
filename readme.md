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
├── modules/
│   └── tsx.ts
└── templates/
    └── tsx/
        └── index.ts
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
    customPresets: {
        astro: {
            output: "dist/astro.json",
            scopes: ["astro"]
        }
    },
    target: "vscode",
    overrides: {
        tsx: {
            output: "dist/tsx.json"
        }
    }
})
```

| Option          | Description                                      | Standard             |
| --------------- | ------------------------------------------------ | -------------------- |
| `cwd`           | Directory containing the modules                 | required             |
| `presets`       | Enabled presets                                  | required             |
| `target`        | Output format `vscode`                           | `vscode`             |
| `customPresets` | User-defined presets                             | `{}`                 |
| `overrides`     | Output substitutions, scopes, and transformation | preset configuration |
| `docs`          | Documentation output and title                   | `docs/snippets`      |

`docs` is only used by `hokit docs`. It does not affect `build`, `lint`, or `doctor`.

```ts
export default defineConfig({
    cwd: "src/modules",
    presets: ["tsx"],
    target: "vscode",
    docs: {
        output: "docs/snippets",
        title: "Project snippets"
    }
})
```

When `docs` is omitted, Hokit writes documentation to `docs/snippets` with the title `Hokit Snippets`.

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

    @Todo("Waiting for the next Zustand release")
    @Snippet({
        name: "Zustand store",
        prefix: "zustand",
        body: ["$0"]
    })
    declare useStore: SnippetDefinition
}
```

Modules that use the same preset are aggregated into the same file. Names and prefixes must be unique within the preset.

In the VS Code output, each snippet receives the `scope` of the preset. When `description` is not provided, the name of the snippet is used; `template` is converted to `isFileTemplate` and defaults to `false`.

### Decorators

- `@Module`: Defines a module and the preset to be used.
- `@Snippet`: Define the snippet properties.
- `@Todo`: Marks a real `@Snippet` as pending. Pending snippets appear as lint
  warnings and are ignored by the build. Using `@Todo` without `@Snippet` is an
  error.

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
hokit build --include-todos
```

### `hokit module --[preset]`

Creates a module for a preset and its template directory. If necessary, automatically enables the preset in `hokit.config.ts`.

It creates:

- `src/modules/<preset>.ts`
- `src/templates/<preset>/index.ts`

It does not overwrite existing modules. Templates do not include `@Todo`; use `--todo` to mark the last snippet as pending. Without specifying a preset, the first one in the configuration is used.

```sh
hokit module --tsx
hokit module --tsx --todo
hokit module --todo
hokit module --list
```

The positional format still works for compatibility:

```sh
hokit module tsx
```

### `hokit snippet --[preset] [prefix]`

Adds a new snippet to the end of the module that owns the selected preset.

```sh
hokit snippet --tsx rfc
```

This command creates or updates:

- `src/templates/tsx/rfc.ts`
- `src/templates/tsx/index.ts`
- `src/modules/tsx.ts`

The module receives the template import and the snippet body points to `template.rfc`.

### `hokit lint [--fix]`

Executes the `required`, `min`, and `unique` rules on all modules.

The `--fix` option safely corrects outer spaces in text and adds `$0` to an empty `body`. Ambiguous issues, such as duplicate names, continue to be reported for manual correction.

```sh
hokit lint
hokit lint --fix
hokit lint --json
```

### `hokit docs`

Generates a Markdown summary and one page per scope. Pending snippets remain in
the documentation with their status and source location.

```sh
hokit docs
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

## Documentation

`hokit docs` generates project documentation in `docs/snippets` by default. This folder is intended to be committed when you want your snippet extension documented on GitHub.

Internal study notes for Hokit maintainers should stay outside the package published to npm.
