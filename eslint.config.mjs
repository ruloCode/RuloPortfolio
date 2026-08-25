import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

// Flat config, required since Next 16 dropped `next lint` and with it the
// .eslintrc.json it used to read. `pnpm lint` calls the ESLint CLI directly
// now — `next build` no longer lints on its own.
//
// core-web-vitals only, which is what .eslintrc.json extended. The
// `eslint-config-next/typescript` preset is a stricter policy than this repo
// has ever run; adopting it is a separate decision from the Next 16 move.
export default defineConfig([
  ...nextVitals,
  {
    // New rules in eslint-plugin-react-hooks v6, which arrives with Next 16.
    // They fire on code that predates them and still works — 11 of the 15 hits
    // are inside the vendored once-ui. Kept visible as warnings rather than
    // letting a dependency bump turn `pnpm lint` red; worth clearing on their
    // own, not as part of the upgrade.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/refs": "warn",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "video/**",
  ]),
]);
