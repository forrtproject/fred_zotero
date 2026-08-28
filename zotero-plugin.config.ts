import { defineConfig } from "zotero-plugin-scaffold";
import pkg from "./package.json";

export default defineConfig({
  source: ["src", "addon"],
  dist: ".scaffold/build",
  name: pkg.config.addonName,
  id: pkg.config.addonID,
  namespace: pkg.config.addonRef,
  updateURL: `https://forrtproject.github.io/flora-zotero/${
    pkg.version.includes("-") ? "update-beta.json" : "update.json"
  }`,
  xpiDownloadLink:
    "https://github.com/forrtproject/flora-zotero/releases/download/v{{version}}/{{xpiName}}.xpi",

  build: {
    assets: ["addon/**/*.*"],
    define: {
      ...pkg.config,
      author: pkg.author,
      description: pkg.description,
      homepage: pkg.homepage,
      buildVersion: pkg.version,
      buildTime: "{{buildTime}}",
    },
    prefs: {
      prefix: pkg.config.prefsPrefix,
    },
    esbuildOptions: [
      {
        entryPoints: ["src/index.ts"],
        define: {
          __env__: `"${process.env.NODE_ENV}"`,
        },
        bundle: true,
        target: "firefox115",
        outfile: `.scaffold/build/addon/content/scripts/${pkg.config.addonRef}.js`,
      },
    ],
  },

  test: {
    entries: "test/integration",
    waitForPlugin: `() => Zotero.${pkg.config.addonInstance}.data.initialized`,
    prefs: {
      // Skip onboarding modal in test profile
      // Keep in step with ONBOARDING_VERSION in src/modules/onboarding.ts, or
      // the onboarding dialog opens modally and blocks the integration run.
      "extensions.zotero.replication-checker.onboardingVersion": 2,
      "extensions.zotero.replication-checker.firstRunDone": true,
    },
  },

  // If you need to see a more detailed log, uncomment the following line:
  // logLevel: "trace",
});
