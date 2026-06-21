export const packageJsonTemplate = {
    name: "example",
    private: true,
    type: "module",
    scripts: {
        build: "hokit build"
    },
    dependencies: {
        hokit: "latest"
    },
    devDependencies: {
        typescript: "latest",
        oxfmt: "latest"
    }
}
