module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:lit/recommended"
    ],
    "overrides": [
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "rules": {
        // document => window.document
        "no-implicit-globals": "error",
        // less aggressive config for now but can be reenable later on
        "no-unused-vars": 0,
        "no-undef": "warn",
        "no-restricted-globals": ["error", {
            name: "DOMParser",
            message: "Load DOMParser from prose-models OR explicitely use window.DOMParser depending on your use case"
        }]
    }
}
