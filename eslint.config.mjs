// @ts-check Let TS check this config file

import zotero from "@zotero-plugin/eslint-config";

export default zotero({
  overrides: [
    {
      files: ["**/*.ts"],
      rules: {
        // Enable unused vars checking for real code
        "@typescript-eslint/no-unused-vars": "warn",
      },
    },
  ],
});
