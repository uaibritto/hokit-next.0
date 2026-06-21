export const vscodeTemplate: string = JSON.stringify(
    {
        "editor.codeActionsOnSave": {
            "source.fixAll.oxc": "explicit",
            "source.format.oxc": "explicit",
            "source.organizeImports": "explicit",
            "source.removeUnusedImports": "explicit",
            "source.addMissingImports.ts": "explicit"
        },
        "editor.formatOnSave": true,
        "editor.defaultFormatter": "oxc.oxc-vscode",
        "editor.formatOnSaveMode": "file",
        "files.autoSave": "afterDelay",
        "files.autoSaveDelay": 1000,
        "[typescript][typescriptreact][javascript][javascriptreact]": {
            "editor.defaultFormatter": "oxc.oxc-vscode"
        }
    },
    null,
    4
)
