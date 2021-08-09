module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    plugins: [
        "@typescript-eslint",
    ],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
    ],
    env: {
        node: true,
        browser: true
    },
    "ignorePatterns": ["dist/**/*.*","demos/**/*.*"],
    rules: {
        eqeqeq: "warn",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-inferrable-types": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-var-requires":"off",
        "@typescript-eslint/no-empty-function":"off",
        semi: ["error", "never"],
        "require-atomic-updates": "error",
        "quotes": ["error", "double", {"allowTemplateLiterals": true, "avoidEscape": true}],
    }
}
