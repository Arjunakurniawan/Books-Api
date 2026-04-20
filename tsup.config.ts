import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  format: ["esm"],
  outDir: "dist",
  target: "esnext",
  clean: true,
  sourcemap: true,
  dts: false,
});
