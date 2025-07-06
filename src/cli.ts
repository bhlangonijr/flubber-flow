#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import path from "path";
import { writeJson } from "fs-extra";
import { register } from "ts-node";

const argv = yargs(hideBin(process.argv))
  .option("input", { alias: "i", type: "string", demandOption: true })
  .option("output", { alias: "o", type: "string", default: "flow.json" })
  .argv as { input: string; output: string };

(async () => {
  // Register ts-node to transpile TypeScript on the fly
  register({
    transpileOnly: true,
    compilerOptions: {
      module: "commonjs",
      esModuleInterop: true
    }
  });

  const inputPath = path.resolve(argv.input);
  const mod = await import(inputPath); // now supports .ts files
  const flow = typeof mod.default === "function" ? mod.default : mod.default?.build?.() ?? mod;

  await writeJson(argv.output, typeof flow.build === "function" ? flow.build() : flow, { spaces: 2 });
  console.log(`✅ JSON flow generated at ${argv.output}`);
})();
